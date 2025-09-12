export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Claude Sonnet 4',
    description: 'Default model',
  },
  {
    id: 'chat-model-reasoning',
    name: 'GPT-5',
    description: 'Default model with reasoning capabilities',
  },
];
