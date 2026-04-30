import { z } from 'zod';

export const aivioAnalysisSchema = z.object({
  client_name: z.string().nullable(),
  company: z.string().nullable(),
  intent: z.string(),
  budget: z.string().nullable(),
  urgency: z.enum(['low', 'medium', 'high']),
  temperature: z.enum(['cold', 'warm', 'hot']),
  summary: z.string(),
  next_action: z.string(),
  suggested_reply: z.string(),
  should_create_deal: z.boolean(),
  deal_title: z.string().nullable(),
  estimated_amount: z.number().nullable(),
  risk_flags: z.array(z.string()),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
});

export type AivioAIAnalysisType = z.infer<typeof aivioAnalysisSchema>;
