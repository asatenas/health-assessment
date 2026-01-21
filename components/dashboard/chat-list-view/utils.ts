import type { Chat } from './types';

/**
 * Same as queries.db. Should create an API?
 */
export function calculateRiskLevel(
  rcri: number | null,
  has2: number | null,
): 'low' | 'medium' | 'high' | 'unknown' {
  if (rcri == null || has2 == null) return 'unknown';
  if (rcri === -1 || has2 === -1) return 'unknown';

  const maxScore = Math.max(rcri, has2);
  if (maxScore <= 1) return 'low';
  if (maxScore <= 3) return 'medium';
  return 'high';
}

export const getRiskLevel = (chat: Chat): { level: string; color: string } => {
  const riskLevel = calculateRiskLevel(chat.score_rcri, chat.score_aub_has2);

  let level: string;
  let color: string;

  switch (riskLevel) {
    case 'low':
      level = 'Baixo';
      color =
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      break;
    case 'medium':
      level = 'Moderado';
      color =
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      break;
    case 'high':
      level = 'Alto';
      color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      break;
    default:
      level = '-';
      color = '';
      break;
  }

  return {
    level,
    color,
  };
};

export const getDaysUntilSurgery = (surgeryDate?: string | null): string => {
  if (!surgeryDate) return '-';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const surgery = new Date(surgeryDate);
  surgery.setHours(0, 0, 0, 0);

  const diffTime = surgery.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d atrás`;
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  return `${diffDays}`;
};

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'initialized':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'finished':
    case 'imcomplete':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    case 'expired':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'initialized':
      return 'Iniciado';
    case 'in_progress':
      return 'Em progresso';
    case 'finished':
      return 'Finalizado';
    case 'incomplete':
      return 'Incompleto';
    case 'expired':
      return 'Expirado';
    default:
      return status.replace('_', ' ');
  }
};
