export const CHAT_STATUSES = [
  'active',
  'initialized',
  'in_progress',
  'finished',
  'incomplete',
] as const;

export type ChatStatus = (typeof CHAT_STATUSES)[number];

export const CHECKPOINT_NAMES = [
  'created',
  'opened',
  'formOpened',
  'formSubmitted',
  'medications',
  'surgeryType',
  'cerebralIschemia',
  'coronaryDisease',
  'cardiacStructure',
  'insulin',
  'creatinine',
  'hemoglobin',
  'nps',
  'completed',
  'interrupted',
] as const;

export type CheckpointNames = (typeof CHECKPOINT_NAMES)[number];
