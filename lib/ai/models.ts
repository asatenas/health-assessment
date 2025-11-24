export const DEFAULT_CHAT_MODEL: string = 'gemini-3-pro-preview-high';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'default',
    description:
      'Model being used in the main branch (gemini-3-pro-preview-high)',
  },
  {
    id: 'gpt-5-medium',
    name: 'gpt-5-medium',
    description: 'GPT-5 with medium reasoning effort',
  },
  {
    id: 'gpt-5-high',
    name: 'gpt-5-high',
    description: 'GPT-5 with high reasoning effort',
  },
  {
    id: 'gpt-5-pro-medium',
    name: 'gpt-5-pro-medium',
    description: 'GPT-5 Pro with medium reasoning effort',
  },
  {
    id: 'gpt-5-pro-high',
    name: 'gpt-5-pro-high',
    description: 'GPT-5 Pro with high reasoning effort',
  },
  {
    id: 'gpt-5.1-medium',
    name: 'gpt-5.1-medium',
    description: 'GPT-5.1 with medium reasoning effort',
  },
  {
    id: 'gpt-5.1-high',
    name: 'gpt-5.1-high',
    description: 'GPT-5.1 with high reasoning effort',
  },
  {
    id: 'gpt-5.1-thinking-medium',
    name: 'gpt-5.1-thinking-medium',
    description: 'GPT-5.1 Thinking with medium reasoning effort',
  },
  {
    id: 'gpt-5.1-thinking-high',
    name: 'gpt-5.1-thinking-high',
    description: 'GPT-5.1 Thinking with high reasoning effort',
  },
  {
    id: 'gemini-3-pro-preview-medium',
    name: 'gemini-3-pro-preview-medium',
    description: 'Gemini 3 Pro with medium reasoning effort',
  },
  {
    id: 'gemini-3-pro-preview-high',
    name: 'gemini-3-pro-preview-high',
    description: 'Gemini 3 Pro with high reasoning effort',
  },
];
