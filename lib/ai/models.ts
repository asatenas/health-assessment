export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'gpt-5',
    description: 'GPT-5 with medium reasoning effort',
  },
  {
    id: 'chat-model-reasoning',
    name: 'gpt-5.1',
    description: 'GPT-5.1 with medium reasoning effort',
  },
];
