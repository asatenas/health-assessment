import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  // lte,
  sql,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  type ChatForm,
  stream,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import { ChatSDKError } from '../errors';
import type { ChatStatus } from './chat-status';
import { postgres_url } from '@/lib/constants';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(postgres_url!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function getUserById({
  id,
}: { id: string }): Promise<User | undefined> {
  try {
    const [selectedUser] = await db.select().from(user).where(eq(user.id, id));
    return selectedUser;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get user by id');
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

export async function createChatWithToken({
  id,
  userId,
  token,
}: {
  id: string;
  userId: string;
  token: string;
}) {
  try {
    const createdAt = new Date();
    const tokenExpiresAt = new Date(
      createdAt.getTime() + 7 * 24 * 60 * 60 * 1000,
    ); // 7 days from creation

    return await db
      .insert(chat)
      .values({
        id,
        createdAt,
        userId,
        visibility: 'private',
        token,
        tokenExpiresAt,
        status: 'active',
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create chat with token',
    );
  }
}

export async function getChatByIdAndToken({
  id,
  token,
}: { id: string; token: string }) {
  try {
    const [selectedChat] = await db
      .select()
      .from(chat)
      .where(and(eq(chat.id, id), eq(chat.token, token)));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chat by id and token',
    );
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function getChatWithStatusById({ id }: { id: string }) {
  try {
    const [row] =
      await client`SELECT * FROM "ChatWithStatus" WHERE "id" = ${id} LIMIT 1`;
    return row || null;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chat with computed status by id',
    );
  }
}

export async function getChatsWithStatusByUserId({
  userId,
  page = 1,
  limit = 20,
}: {
  userId: string;
  page?: number;
  limit?: number;
}) {
  try {
    const offset = (page - 1) * limit;

    const chats = await client`
      SELECT "id", "createdAt", "computed_status" AS status
      FROM "ChatWithStatus"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await client`
      SELECT count(*)::int AS count FROM "ChatWithStatus" WHERE "userId" = ${userId}
    `;

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      chats,
      pagination: { page, limit, total, totalPages },
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats with computed status by user id',
    );
  }
}

export async function getChatFormById({ id }: { id: string }) {
  try {
    const [result] = await db
      .select({ form: chat.form })
      .from(chat)
      .where(eq(chat.id, id));
    return result?.form || null;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chat form by id',
    );
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function deleteAssistantMessagesAfterLastUser({
  chatId,
}: {
  chatId: string;
}) {
  try {
    // Get all messages for this chat
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(desc(message.createdAt));

    // Find the last user message
    const lastUserMessageIndex = messages.findIndex(
      (msg) => msg.role === 'user',
    );

    if (lastUserMessageIndex === -1) {
      // No user messages found, nothing to delete
      return;
    }

    // Get all assistant messages that come after the last user message
    const messagesToDelete = messages.slice(0, lastUserMessageIndex);
    const assistantMessageIds = messagesToDelete
      .filter((msg) => msg.role === 'assistant')
      .map((msg) => msg.id);

    if (assistantMessageIds.length > 0) {
      // Delete votes for these messages
      await db
        .delete(vote)
        .where(
          and(
            eq(vote.chatId, chatId),
            inArray(vote.messageId, assistantMessageIds),
          ),
        );

      // Delete the messages
      return await db
        .delete(message)
        .where(
          and(
            eq(message.chatId, chatId),
            inArray(message.id, assistantMessageIds),
          ),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete assistant messages after last user message',
    );
  }
}

export async function deleteSequentialAssistantMessages({
  chatId,
}: {
  chatId: string;
}) {
  try {
    // Get all messages for this chat
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(desc(message.createdAt));

    if (messages.length < 2) {
      return; // Not enough messages to have duplicates
    }

    // Count sequential assistant messages from the end
    let sequentialAssistantCount = 0;
    const sequentialAssistantMessages = [];

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'assistant') {
        sequentialAssistantCount++;
        // Don't add the first (most recent) one to the delete list
        if (i > 0) {
          sequentialAssistantMessages.push(messages[i]);
        }
      } else {
        break; // Stop when we hit a non-assistant message
      }
    }

    // If there's more than 1 sequential assistant message, delete all but the most recent
    if (
      sequentialAssistantCount > 1 &&
      sequentialAssistantMessages.length > 0
    ) {
      const assistantMessageIds = sequentialAssistantMessages.map(
        (msg) => msg.id,
      );

      // Delete votes for these messages
      await db
        .delete(vote)
        .where(
          and(
            eq(vote.chatId, chatId),
            inArray(vote.messageId, assistantMessageIds),
          ),
        );

      // Delete the messages
      return await db
        .delete(message)
        .where(
          and(
            eq(message.chatId, chatId),
            inArray(message.id, assistantMessageIds),
          ),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete sequential assistant messages',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function makeChatReadOnlyById({
  chatId,
  incomplete,
}: { chatId: string; incomplete: boolean }) {
  const status = incomplete ? 'incomplete' : 'finished';
  try {
    return await db
      .update(chat)
      .set({ readOnly: true, status })
      .where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to make chat read only',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

export async function updateChatFormById({
  chatId,
  form,
}: {
  chatId: string;
  form: any;
}) {
  try {
    return await db.update(chat).set({ form }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat form by id',
    );
  }
}

export async function updateChatMedicationsById({
  chatId,
  medications,
}: {
  chatId: string;
  medications: any;
}) {
  try {
    return await db
      .update(chat)
      .set({ medications })
      .where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat medications by id',
    );
  }
}

export async function updateChatResultsById({
  chatId,
  results,
  score_rcri,
  score_aub_has2,
}: {
  chatId: string;
  results: string;
  score_rcri: number;
  score_aub_has2: number;
}) {
  try {
    return await db
      .update(chat)
      .set({ results, score_rcri, score_aub_has2, completedAt: new Date() })
      .where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat results by id',
    );
  }
}

export async function updateChatStatusById({
  chatId,
  status,
}: {
  chatId: string;
  status: ChatStatus;
}) {
  try {
    return await db.update(chat).set({ status }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat status by id',
    );
  }
}

export async function getChatsByClinicUserId({
  userId,
  status,
  dateFrom,
  dateTo,
  page = 1,
  limit = 20,
}: {
  userId: string;
  status?: ChatStatus | 'expired';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const conditions: SQL<any>[] = [eq(chat.userId, userId)];

    // Add status filter if provided. Use compute-on-read semantics:
    // - If requested status is 'expired' consider rows where tokenExpiresAt <= now() OR status = 'expired'
    // - If requested status is 'finalized', only check stored status (ignore token expiration)
    // - For other statuses, require the stored status AND tokenExpiresAt > now() (otherwise computed_status would be 'expired')
    if (status) {
      if (status === 'expired') {
        conditions.push(
          sql`(${chat.tokenExpiresAt} <= now() OR ${chat.status} = 'expired')`,
        );
      } else if (status === 'finished') {
        conditions.push(sql`(${chat.status} = 'finished'`);
      } else {
        conditions.push(
          sql`(${chat.status} = ${status} AND ${chat.tokenExpiresAt} > now())`,
        );
      }
    }

    // Add date range filters if provided
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!Number.isNaN(fromDate.getTime())) {
        conditions.push(gte(chat.createdAt, fromDate));
      }
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      if (!Number.isNaN(endDate.getTime())) {
        // Add one day to include the entire end date
        endDate.setDate(endDate.getDate() + 1);
        conditions.push(lt(chat.createdAt, endDate));
      }
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(chat)
      .where(and(...conditions));

    const total = totalResult?.count || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const chats = await db
      .select({
        id: chat.id,
        createdAt: chat.createdAt,
        form: chat.form,
        results: chat.results,
        medications: chat.medications,
        score_rcri: chat.score_rcri,
        score_aub_has2: chat.score_aub_has2,
        // Project a computed status: preserve 'finalized', otherwise expired when tokenExpiresAt <= now()
        status: sql`CASE WHEN ${chat.status} = 'finished' THEN 'finished' WHEN ${chat.tokenExpiresAt} <= now() THEN 'expired' ELSE ${chat.status} END`,
      })
      .from(chat)
      .where(and(...conditions))
      .orderBy(desc(chat.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      chats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by clinic user id',
    );
  }
}

/**
 * Calculate risk level from RCRI and HAS2 scores
 */
export function calculateRiskLevel(
  rcri: number | null,
  has2: number | null,
): 'low' | 'medium' | 'high' | 'unknown' {
  if (rcri == null || has2 == null) return 'unknown';
  if (rcri === -1 || has2 === -1) return 'unknown';

  const maxScore = Math.max(rcri, has2);
  if (maxScore === 0) return 'low';
  if (maxScore === 1) return 'medium';
  return 'high';
}

/**
 * Get aggregated dashboard metrics for a coordinator
 */
export async function getDashboardMetrics({
  userId,
  dateFrom,
  dateTo,
}: {
  userId: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const conditions: SQL<any>[] = [eq(chat.userId, userId)];

    if (dateFrom) {
      conditions.push(gte(chat.createdAt, dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      conditions.push(lt(chat.createdAt, endDate));
    }

    // Get all chats for the user
    const allChats = await db
      .select()
      .from(chat)
      .where(and(...conditions));

    // Calculate metrics
    const totalAssessments = allChats.length;
    const completedAssessments = allChats.filter(
      (c) => c.status === 'finished',
    ).length;
    const completionRate =
      totalAssessments > 0
        ? Math.round((completedAssessments / totalAssessments) * 100)
        : 0;

    // Risk distribution
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      unknown: 0,
    };

    for (const chatItem of allChats) {
      const riskLevel = calculateRiskLevel(
        chatItem.score_rcri,
        chatItem.score_aub_has2,
      );
      riskDistribution[riskLevel]++;
    }

    // Latex Allergies
    let latexAllergies = 0;
    for (const chatItem of allChats) {
      const form = chatItem.form as ChatForm | null;
      const allergies = form?.allergies || [];
      if (allergies.includes('latex') || allergies.includes('látex')) {
        latexAllergies++;
      }
    }

    // Surgery tracking
    // const totalSurgeriesScheduled = allChats.filter(
    //   (c) => c.surgeryDate !== null,
    // ).length;
    // const surgeriesCompleted = allChats.filter(
    //   (c) => c.surgeryCompleted === true,
    // ).length;
    // const surgeriesCancelled = allChats.filter(
    //   (c) => c.surgeryCancelled === true,
    // ).length;
    // const surgeriesRescheduled = allChats.filter(
    //   (c) => c.surgeryRescheduled === true,
    // ).length;

    // Adjustments
    // const adjustmentsRequired = allChats.filter(
    //   (c) => c.adjustmentsRequired === true,
    // ).length;

    // Daily metrics - surgeries for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSurgeries = allChats.filter((c) => {
      // if (!c.surgeryDate) return false;
      // const surgeryDate = new Date(c.surgeryDate);
      // return surgeryDate >= today && surgeryDate < tomorrow;
    });

    // Tomorrow's surgeries
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    const tomorrowsSurgeries = allChats.filter((c) => {
      // if (!c.surgeryDate) return false;
      // const surgeryDate = new Date(c.surgeryDate);
      // return surgeryDate >= tomorrow && surgeryDate < dayAfterTomorrow;
    });

    // This week's surgeries
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const thisWeeksSurgeries = allChats.filter((c) => {
      // if (!c.surgeryDate) return false;
      // const surgeryDate = new Date(c.surgeryDate);
      // return surgeryDate >= today && surgeryDate < endOfWeek;
    });

    // Cancellation and reschedule breakdown by reason
    const reasonMap = new Map<
      string,
      { cancelled: number; rescheduled: number }
    >();

    // for (const chatItem of allChats) {
    //   if (
    //     (chatItem.surgeryCancelled || chatItem.surgeryRescheduled) &&
    //     chatItem.surgeryStatusReason
    //   ) {
    //     const current = reasonMap.get(chatItem.surgeryStatusReason) || {
    //       cancelled: 0,
    //       rescheduled: 0,
    //     };
    //     if (chatItem.surgeryCancelled) current.cancelled++;
    //     if (chatItem.surgeryRescheduled) current.rescheduled++;
    //     reasonMap.set(chatItem.surgeryStatusReason, current);
    //   }
    // }

    const cancellationsAndReschedulesByReason: Array<{
      reason: string;
      count: number;
      type: 'cancelled' | 'rescheduled';
    }> = [];

    for (const [reason, counts] of reasonMap.entries()) {
      if (counts.cancelled > 0) {
        cancellationsAndReschedulesByReason.push({
          reason,
          count: counts.cancelled,
          type: 'cancelled',
        });
      }
      if (counts.rescheduled > 0) {
        cancellationsAndReschedulesByReason.push({
          reason,
          count: counts.rescheduled,
          type: 'rescheduled',
        });
      }
    }

    return {
      totalAssessments,
      completedAssessments,
      completionRate,
      riskDistribution,
      latexAllergies,
      // totalSurgeriesScheduled,
      // surgeriesCompleted,
      // surgeriesCancelled,
      // surgeriesRescheduled,
      // adjustmentsRequired,
      todaysSurgeries,
      tomorrowsSurgeries,
      thisWeeksSurgeries,
      cancellationsAndReschedulesByReason,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get dashboard metrics',
    );
  }
}

/**
 * Get timeline data for charts (daily/weekly trends)
 */
export async function getTimelineData({
  userId,
  dateFrom,
  dateTo,
}: {
  userId: string;
  dateFrom: Date;
  dateTo: Date;
}) {
  try {
    const chats = await db
      .select()
      .from(chat)
      .where(
        and(
          eq(chat.userId, userId),
          gte(chat.createdAt, dateFrom),
          lt(chat.createdAt, dateTo),
        ),
      )
      .orderBy(asc(chat.createdAt));

    // Group by date
    const dateMap = new Map<
      string,
      {
        assessmentsCreated: number;
        assessmentsCompleted: number;
        surgeriesScheduled: number;
        surgeriesPerformed: number;
        cancellations: number;
      }
    >();

    for (const chatItem of chats) {
      const dateKey = chatItem.createdAt.toISOString().split('T')[0];
      const current = dateMap.get(dateKey) || {
        assessmentsCreated: 0,
        assessmentsCompleted: 0,
        surgeriesScheduled: 0,
        surgeriesPerformed: 0,
        cancellations: 0,
      };

      current.assessmentsCreated++;
      if (chatItem.status === 'finished') current.assessmentsCompleted++;
      // if (chatItem.surgeryDate) current.surgeriesScheduled++;
      // if (chatItem.surgeryCompleted) current.surgeriesPerformed++;
      // if (chatItem.surgeryCancelled) current.cancellations++;

      dateMap.set(dateKey, current);
    }

    // Convert to array
    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get timeline data',
    );
  }
}

/**
 * Get high and medium priority notifications
 */
export async function getHighPriorityNotifications({
  userId,
}: { userId: string }) {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const chats = await db.select().from(chat).where(eq(chat.userId, userId));

    const notifications: Array<{
      id: string;
      priority: 'high' | 'medium';
      type: string;
      message: string;
      chatId: string;
      patientAge?: number;
      surgeryDate?: Date;
    }> = [];

    for (const chatItem of chats) {
      // const surgeryDate = chatItem.surgeryDate
      //   ? new Date(chatItem.surgeryDate)
      //   : null;
      const formAge = chatItem.form as any;
      const patientAge = formAge?.age;

      // High priority: High-risk patients with surgery in next 24 hours
      // if (surgeryDate && surgeryDate <= in24Hours && surgeryDate >= now) {
      //   const riskLevel = calculateRiskLevel(chatItem.results);
      //   if (riskLevel === 'high') {
      //     notifications.push({
      //       id: generateUUID(),
      //       priority: 'high',
      //       type: 'high_risk_soon',
      //       message: `Paciente de alto risco com cirurgia em ${surgeryDate.toLocaleDateString('pt-BR')}`,
      //       chatId: chatItem.id,
      //       patientAge,
      //       surgeryDate,
      //     });
      //   }
      // }

      // High priority: Form not completed and deadline passed (> 2 days since creation)
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      if (chatItem.status !== 'finished' && chatItem.createdAt < twoDaysAgo) {
        notifications.push({
          id: generateUUID(),
          priority: 'high',
          type: 'incomplete_form',
          message: `Formulário não concluído - prazo vencido (criado em ${chatItem.createdAt.toLocaleDateString('pt-BR')})`,
          chatId: chatItem.id,
          patientAge,
        });
      }

      // High priority: Medical intervention required
      // if (chatItem.medicalInterventionRequired) {
      //   notifications.push({
      //     id: generateUUID(),
      //     priority: 'high',
      //     type: 'intervention_required',
      //     message: 'Intervenção médica necessária',
      //     chatId: chatItem.id,
      //     patientAge,
      //   });
      // }

      // High priority: Surgery in < 3 days without completed assessment
      // if (
      //   surgeryDate &&
      //   surgeryDate <= in72Hours &&
      //   surgeryDate >= now &&
      //   chatItem.status !== 'finished'
      // ) {
      //   notifications.push({
      //     id: generateUUID(),
      //     priority: 'high',
      //     type: 'surgery_soon_incomplete',
      //     message: `Cirurgia em ${surgeryDate.toLocaleDateString('pt-BR')} sem avaliação concluída`,
      //     chatId: chatItem.id,
      //     patientAge,
      //     surgeryDate,
      //   });
      // }

      // Medium priority: Moderate-risk patients with surgery in next 48 hours
      // if (surgeryDate && surgeryDate <= in48Hours && surgeryDate >= now) {
      //   const riskLevel = calculateRiskLevel(chatItem.results);
      //   if (riskLevel === 'medium') {
      //     notifications.push({
      //       id: generateUUID(),
      //       priority: 'medium',
      //       type: 'moderate_risk_soon',
      //       message: `Paciente de risco moderado com cirurgia em ${surgeryDate.toLocaleDateString('pt-BR')}`,
      //       chatId: chatItem.id,
      //       patientAge,
      //       surgeryDate,
      //     });
      //   }
      // }

      // Medium priority: Adjustments required
      // if (chatItem.adjustmentsRequired) {
      //   notifications.push({
      //     id: generateUUID(),
      //     priority: 'medium',
      //     type: 'adjustments_required',
      //     message: 'Ajustes necessários',
      //     chatId: chatItem.id,
      //     patientAge,
      //   });
      // }
    }

    // Sort by priority (high first) and then by surgery date
    notifications.sort((a, b) => {
      if (a.priority === 'high' && b.priority === 'medium') return -1;
      if (a.priority === 'medium' && b.priority === 'high') return 1;
      if (a.surgeryDate && b.surgeryDate) {
        return a.surgeryDate.getTime() - b.surgeryDate.getTime();
      }
      return 0;
    });

    return notifications;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get notifications',
    );
  }
}

/**
 * Update surgery details for a chat
 */
export async function updateChatSurgeryDetails({
  chatId,
  surgeryDate,
  surgeryCompleted,
  surgeryRescheduled,
  surgeryCancelled,
  surgeryStatusReason,
  medicalInterventionRequired,
  interventionNotes,
  adjustmentsRequired,
  adjustmentNotes,
}: {
  chatId: string;
  surgeryDate?: Date;
  surgeryCompleted?: boolean;
  surgeryRescheduled?: boolean;
  surgeryCancelled?: boolean;
  surgeryStatusReason?: string;
  medicalInterventionRequired?: boolean;
  interventionNotes?: string;
  adjustmentsRequired?: boolean;
  adjustmentNotes?: string;
}) {
  try {
    const updateData: any = {};

    if (surgeryDate !== undefined) updateData.surgeryDate = surgeryDate;
    if (surgeryCompleted !== undefined)
      updateData.surgeryCompleted = surgeryCompleted;
    if (surgeryRescheduled !== undefined)
      updateData.surgeryRescheduled = surgeryRescheduled;
    if (surgeryCancelled !== undefined)
      updateData.surgeryCancelled = surgeryCancelled;
    if (surgeryStatusReason !== undefined)
      updateData.surgeryStatusReason = surgeryStatusReason;
    if (medicalInterventionRequired !== undefined)
      updateData.medicalInterventionRequired = medicalInterventionRequired;
    if (interventionNotes !== undefined)
      updateData.interventionNotes = interventionNotes;
    if (adjustmentsRequired !== undefined)
      updateData.adjustmentsRequired = adjustmentsRequired;
    if (adjustmentNotes !== undefined)
      updateData.adjustmentNotes = adjustmentNotes;

    const [updatedChat] = await db
      .update(chat)
      .set(updateData)
      .where(eq(chat.id, chatId))
      .returning();

    return updatedChat;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update surgery details',
    );
  }
}

/**
 * Get today's surgeries for swipe UI
 */
export async function getTodaysSurgeriesForSwipe({
  userId,
}: { userId: string }) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const chats = await db
      .select()
      .from(chat)
      .where(
        and(
          eq(chat.userId, userId),
          eq(chat.status, 'finished'),
          // gte(chat.surgeryDate, today),
          // lt(chat.surgeryDate, tomorrow),
        ),
      );
    // .orderBy(asc(chat.surgeryDate));

    // Add risk level to each chat
    return chats.map((chatItem) => ({
      ...chatItem,
      riskLevel: calculateRiskLevel(
        chatItem.score_rcri,
        chatItem.score_aub_has2,
      ),
    }));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      "Failed to get today's surgeries",
    );
  }
}

/**
 * Get this week's surgeries (from today until Saturday)
 */
export async function getThisWeeksSurgeries({ userId }: { userId: string }) {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Calculate days until Saturday (6 = Saturday, 0 = Sunday)
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const daysUntilSaturday = currentDay === 6 ? 0 : 6 - currentDay;

    const endOfSaturday = new Date(now);
    endOfSaturday.setDate(now.getDate() + daysUntilSaturday);
    endOfSaturday.setHours(23, 59, 59, 999);

    const surgeries = await db
      .select()
      .from(chat)
      .where(
        and(
          eq(chat.userId, userId),
          eq(chat.status, 'finished'),
          // gte(chat.surgeryDate, startOfToday),
          // lte(chat.surgeryDate, endOfSaturday),
        ),
      );
    // .orderBy(asc(chat.surgeryDate));

    // Group by day of week
    const groupedByDay: Record<string, any[]> = {};

    // surgeries.forEach((surgery) => {
    //   if (!surgery.surgeryDate) return;

    //   const surgeryDate = new Date(surgery.surgeryDate);
    //   const dayOfWeek = surgeryDate.toLocaleDateString('pt-BR', {
    //     weekday: 'long',
    //   });
    //   const dateStr = surgeryDate.toLocaleDateString('pt-BR', {
    //     day: '2-digit',
    //     month: '2-digit',
    //   });
    //   const key = `${dayOfWeek}, ${dateStr}`;

    //   if (!groupedByDay[key]) {
    //     groupedByDay[key] = [];
    //   }

    //   const formData = surgery.form as any;
    //   groupedByDay[key].push({
    //     chatId: surgery.id,
    //     patientAge: formData?.age || 0,
    //     riskLevel: calculateRiskLevel(surgery.results),
    //     surgeryDate: surgery.surgeryDate.toISOString(),
    //     surgeryCompleted: surgery.surgeryCompleted || false,
    //     surgeryCancelled: surgery.surgeryCancelled || false,
    //     surgeryRescheduled: surgery.surgeryRescheduled || false,
    //     rcriScore: extractRCRIScore(surgery.results),
    //     has2Score: extractHAS2Score(surgery.results),
    //   });
    // });

    return groupedByDay;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      "Failed to get this week's surgeries",
    );
  }
}
