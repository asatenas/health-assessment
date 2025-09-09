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
    description: 'Claude Sonnet 4 balances performance and efficiency for internal and external use cases, with enhanced steerability for greater control over implementations.',
  },
  // {
  //   id: 'chat-model-reasoning',
  //   name: 'GPT-5 Mini',
  //   description: 'GPT-5 mini is a cost optimized model that excels at reasoning/chat tasks. It offers an optimal balance between speed, cost, and capability.',
  // },
];
