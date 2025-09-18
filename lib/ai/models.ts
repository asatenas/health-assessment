export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'gpt-5-low',
    description: 'Low reasoning effort, fast and cost-effective',
  },
  {
    id: 'chat-model-reasoning',
    name: 'gpt-5-medium',
    description: 'Medium reasoning effort, balanced performance',
  },
];
