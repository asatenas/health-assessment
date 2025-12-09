export const CHAT_STATUSES = [
  'active',
  'initialized',
  'in_progress',
  'finished',
  'incomplete',
] as const;

export type ChatStatus = (typeof CHAT_STATUSES)[number];
