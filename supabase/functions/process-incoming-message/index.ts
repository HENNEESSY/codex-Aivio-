// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function hashString(str: string) {
  const messageBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
  return encodeHex(hashBuffer);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    const openRouterModel = Deno.env.get('OPENROUTER_MODEL') || 'anthropic/claude-3.5-sonnet'

    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase env vars')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()
    
    let { workspace_id, channel, external_chat_id, sender_name, message_text, external_message_id } = body

    if (!workspace_id || !channel || !external_chat_id || !message_text) {
      throw new Error('Missing required fields')
    }

    // 1. Idempotency Check
    let idempotencyKey = external_message_id 
      ? `${workspace_id}_${channel}_${external_chat_id}_${external_message_id}`
      : await hashString(`${workspace_id}_${channel}_${external_chat_id}_${message_text.trim()}`);

    const { data: existingMsg } = await supabase.from('messages').select('*').eq('idempotency_key', idempotencyKey).single();
    if (existingMsg) {
      return new Response(JSON.stringify({ ok: true, source: "duplicate", message: existingMsg }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    // 2. Find or create Contact
    let { data: contact } = await supabase.from('contacts').select('*').eq('workspace_id', workspace_id).eq('external_chat_id', external_chat_id).single()

    if (!contact) {
      const { data: newContact, error } = await supabase.from('contacts').insert([{ workspace_id, name: sender_name || 'Неизвестный', source: channel }]).select().single()
      if (error) throw error
      contact = newContact
    }

    // 3. Find or create Conversation
    let { data: conversation } = await supabase.from('conversations').select('*').eq('contact_id', contact.id).eq('channel', channel).single()

    if (!conversation) {
      const { data: newConv, error } = await supabase.from('conversations').insert([{ workspace_id, contact_id: contact.id, channel, external_chat_id, status: 'active', unread_count: 1, last_message_at: new Date().toISOString() }]).select().single()
      if (error) throw error
      conversation = newConv
    } else {
      await supabase.from('conversations').update({ unread_count: conversation.unread_count + 1, last_message_at: new Date().toISOString() }).eq('id', conversation.id)
    }

    // 4. Insert Message
    const { data: message, error: msgErr } = await supabase.from('messages').insert([{
        workspace_id, conversation_id: conversation.id, sender_type: 'client', content: message_text,
        external_message_id, idempotency_key: idempotencyKey, delivery_status: 'received'
    }]).select().single()
    if (msgErr) throw msgErr

    // 5. OpenRouter AI Step
    let aiAnalysis = null;
    let aiRunStatus = 'failed';
    let aiErrorMessage = null;
    let tokensIn = 0; let tokensOut = 0;

    if (openRouterKey) {
      const systemPrompt = `Ты — AI-аналитик системы Aivio...`;
      // Skipping full prompt for brevity in function code, assume standard Aivio behavior
      const fullSystemPrompt = `Ты — AI-аналитик системы Aivio. Твоя задача: проанализировать входящее сообщение от клиента и вернуть строго валидный JSON без markdown, без пояснений.
Формат ответа:
{
  "client_name": string | null,
  "company": string | null,
  "intent": string,
  "budget": string | null,
  "urgency": "low" | "medium" | "high",
  "temperature": "cold" | "warm" | "hot",
  "summary": string,
  "next_action": string,
  "suggested_reply": string,
  "should_create_deal": boolean,
  "deal_title": string | null,
  "estimated_amount": number | null,
  "risk_flags": string[],
  "sentiment": "positive" | "neutral" | "negative"
}
Правила: Все текстовые значения на русском языке.`;

      try {
        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openRouterKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: openRouterModel,
            messages: [{ role: 'system', content: fullSystemPrompt }, { role: 'user', content: `Сообщение от клиента (${sender_name}): ${message_text}` }],
            response_format: { type: 'json_object' }
          })
        });

        const respData = await resp.json()
        if (respData.choices && respData.choices[0] && respData.choices[0].message) {
          aiAnalysis = JSON.parse(respData.choices[0].message.content)
          aiRunStatus = 'succeeded';
          if (respData.usage) { tokensIn = respData.usage.prompt_tokens; tokensOut = respData.usage.completion_tokens; }
        }
      } catch (e) {
        aiErrorMessage = e.message;
      }
    }

    let deal = null;
    let task = null;
    let approval_request = null;
    let activity = null;

    if (aiAnalysis) {
       await supabase.from('ai_runs').insert([{
         workspace_id, message_id: message.id, analysis_result: aiAnalysis,
         status: aiRunStatus, error_message: aiErrorMessage, tokens_input: tokensIn, tokens_output: tokensOut
       }]);

       if (aiAnalysis.should_create_deal) {
         // Create Deal if none is currently active for this contact
         const { data: activeDeals } = await supabase.from('deals').select('id').eq('contact_id', contact.id).eq('status', 'active');
         if (!activeDeals || activeDeals.length === 0) {
            const { data: newDeal } = await supabase.from('deals').insert([{
              workspace_id, contact_id: contact.id, title: aiAnalysis.deal_title || `Сделка: ${contact.name}`,
              amount: aiAnalysis.estimated_amount, temperature: aiAnalysis.temperature || 'warm', status: 'active'
            }]).select().single()
            deal = newDeal;
         }
       }

       if (aiAnalysis.next_action) {
         const { data: newTask } = await supabase.from('tasks').insert([{
           workspace_id, contact_id: contact.id, deal_id: deal ? deal.id : null,
           title: aiAnalysis.next_action, urgency: aiAnalysis.urgency || 'medium', source: 'ai'
         }]).select().single()
         task = newTask;
       }

       if (aiAnalysis.suggested_reply) {
         const { data: ap } = await supabase.from('approval_requests').insert([{
            workspace_id, contact_id: contact.id, deal_id: deal ? deal.id : null, type: 'reply',
            title: 'Предложить ответ', payload: { action_type: 'send_message', content: aiAnalysis.suggested_reply }
         }]).select().single();
         approval_request = ap;
       }

       const { data: act } = await supabase.from('activities').insert([{
         workspace_id, contact_id: contact.id, deal_id: deal ? deal.id : null, type: 'ai_analysis',
         title: 'Новый клиент проанализирован', body: aiAnalysis.summary, channel
       }]).select().single();
       activity = act;

       // Notification logic omitted for brevity, but could insert into notification_events here
    }

    return new Response(JSON.stringify({ ok: true, source: "live", contact, conversation, message, deal, task, approval_request, ai_analysis: aiAnalysis, activity }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: { code: 'INTERNAL_ERROR', message: error.message } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
