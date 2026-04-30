import { useQuery, useMutation } from '@tanstack/react-query';
import { getTemplates } from '@/lib/api/aivio';
import { toast } from 'sonner';

export function useAivioTemplates() {
  const query = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      // Return predefined demo templates
      return [
        { id: '1', name: 'IT-аутсорсинг', industry: 'Информационные технологии', description: 'Полный цикл продаж IT-услуг, включая договора.', tags: { stages_count: 5, ai_employees_count: 2 } },
        { id: '2', name: 'Недвижимость', industry: 'Недвижимость', description: 'Воронка для агентств и застройщиков с квалификацией лидов.', tags: { stages_count: 8, ai_employees_count: 3 } },
        { id: '3', name: 'Юридические услуги', industry: 'Услуги', description: 'Анализ документов, договора, сопровождение клиентов.', tags: { stages_count: 6, ai_employees_count: 1 } },
        { id: '4', name: 'Строительство', industry: 'Строительство', description: 'От заявки до акта приема-передачи объектов.', tags: { stages_count: 7, ai_employees_count: 1 } },
        { id: '5', name: 'Медицина и здоровье', industry: 'Медицина', description: 'Запись на прием, напоминания, feedback.', tags: { stages_count: 4, ai_employees_count: 2 } },
        { id: '6', name: 'E-commerce', industry: 'Торговля', description: 'Обработка заказов, возвратов и брошенных корзин.', tags: { stages_count: 5, ai_employees_count: 2 } },
        { id: '7', name: 'Образование', industry: 'Образование', description: 'Запись на курсы, прогрев, сбор отзывов.', tags: { stages_count: 6, ai_employees_count: 2 } },
        { id: '8', name: 'Ресторанный бизнес', industry: 'HoReCa', description: 'Бронь столов, банкеты, доставка.', tags: { stages_count: 4, ai_employees_count: 1 } },
        { id: '9', name: 'Логистика', industry: 'Транспорт', description: 'Заявки на перевозку, контроль статуса.', tags: { stages_count: 5, ai_employees_count: 1 } },
        { id: '10', name: 'Консалтинг', industry: 'Услуги B2B', description: 'B2B продажи длинного цикла со встречами.', tags: { stages_count: 7, ai_employees_count: 3 } }
      ];
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      // Fake network request
      await new Promise(r => setTimeout(r, 600));
      return id;
    },
    onSuccess: () => {
      toast.success('Шаблон применён');
    },
    onError: () => {
      toast.error('Ошибка при применении шаблона');
    }
  });

  return {
    templates: query.data || [],
    isLoading: query.isLoading,
    applyTemplate: (id: string) => applyTemplateMutation.mutate(id),
    isApplying: applyTemplateMutation.isPending,
  };
}
