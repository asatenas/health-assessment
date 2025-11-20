export const CHAT_STATUSES = [
  'active',
  'initialized',
  'in_progress',
  'expired',
  'finished',
] as const;

export type ChatStatus = (typeof CHAT_STATUSES)[number];
