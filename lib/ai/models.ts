export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Default',
    description: 'Default model',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Default Reasoning',
    description: 'Default model with reasoning capabilities',
  },
];
