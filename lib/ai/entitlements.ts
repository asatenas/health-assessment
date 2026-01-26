import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

// Default entitlements for all users
export const defaultEntitlements: Entitlements = {
  maxMessagesPerDay: 5000,
  availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
};

/*
 * TODO: For users with a paid membership, create premium entitlements
 */
