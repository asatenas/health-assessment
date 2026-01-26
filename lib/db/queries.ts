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
  lte,
  sql,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  clinic,
  user,
  chat,
  type Clinic,
  type User,
  message,
  type DBMessage,
  type Chat,
  type ChatForm,
  stream,
  checkpoint,
  surgery,
} from './schema';
import { generateUUID } from '../shared/utils';
import { generateHashedPassword } from './utils';
import { ChatSDKError } from '../shared/errors';
import type { ChatStatus, CheckpointNames } from './chat-status';
import { postgres_url } from '@/lib/shared/constants';
import type {
  FormConfiguration,
  DashboardConfiguration,
} from '@/lib/types/clinic-config';
import { DEFAULT_FORM_CONFIG } from '../config/default-form-config';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(postgres_url!);
const db = drizzle(client);

export async function getUser(
  email: string,
): Promise<Array<User & { clinicId: string }>> {
  try {
    // Returns user with clinicId for authentication
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function getUserById({
  userId,
}: { userId: string }): Promise<User | undefined> {
  try {
    const [selectedUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));
    return selectedUser;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get user by id');
  }
}

export async function getClinicByUserId({
  userId,
}: { userId: string }): Promise<Clinic | undefined> {
  try {
    const [result] = await db
      .select({
        id: clinic.id,
        clinicName: clinic.clinicName,
        email: clinic.email,
        formConfig: clinic.formConfig,
        dashboardConfig: clinic.dashboardConfig,
        updatedAt: clinic.updatedAt,
        authorized: clinic.authorized,
      })
      .from(user)
      .innerJoin(clinic, eq(user.clinicId, clinic.id))
      .where(eq(user.id, userId));
    return result;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get clinic by user id',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    // First create the clinic
    const [newClinic] = await db
      .insert(clinic)
      .values({
        email,
        formConfig: DEFAULT_FORM_CONFIG,
        updatedAt: new Date(),
      })
      .returning({
        id: clinic.id,
      });

    // Then create the user (owner) for that clinic
    await db.insert(user).values({
      clinicId: newClinic.id,
      email,
      password: hashedPassword,
      role: 'owner',
      status: 'active',
    });

    // Return the clinic ID for backward compatibility (session uses this)
    return [{ id: newClinic.id }];
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createClinicConfig(clinicId: string) {
  try {
    return await db
      .update(clinic)
      .set({
        formConfig: DEFAULT_FORM_CONFIG,
        updatedAt: new Date(),
      })
      .where(eq(clinic.id, clinicId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create clinic config',
    );
  }
}

export async function createChatWithToken({
  id,
  clinicId,
  token,
}: {
  id: string;
  clinicId: string;
  token: string;
}) {
  try {
    const createdAt = new Date();
    const tokenExpiresAt = new Date(
      createdAt.getTime() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 days from creation

    const result = await db
      .insert(chat)
      .values({
        id,
        createdAt,
        clinicId,
        visibility: 'private',
        token,
        tokenExpiresAt,
        status: 'active',
      })
      .returning();

    await db.insert(checkpoint).values({
      chatId: id,
      created: createdAt,
    });

    return result;
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
            ? and(whereCondition, eq(chat.clinicId, id))
            : eq(chat.clinicId, id),
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

export async function getChatWithSurgeryById({ id }: { id: string }) {
  try {
    const chatData = await getChatById({ id });
    const [surgeryDetails] = await db
      .select()
      .from(surgery)
      .where(eq(surgery.assessmentId, id));

    return {
      ...chatData,
      surgery: surgeryDetails || null,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chat with surgery by id',
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
    return result?.form;
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
          eq(chat.clinicId, id),
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
      .set({ results, score_rcri, score_aub_has2 })
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

export async function updateChatNpsById({
  chatId,
  nps,
}: {
  chatId: string;
  nps: number;
}) {
  try {
    return await db.update(chat).set({ nps }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat nps by id',
    );
  }
}

export async function updateCheckpointByChatId({
  chatId,
  name,
}: {
  chatId: string;
  name: CheckpointNames;
}) {
  try {
    return await db
      .update(checkpoint)
      .set({ [name]: new Date() })
      .where(eq(checkpoint.chatId, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update checkpoint by chat id',
    );
  }
}

export async function getChatsByClinicUserId({
  clinicId,
  status,
  dateFrom,
  dateTo,
  page = 1,
  limit = 20,
}: {
  clinicId: string;
  status?: ChatStatus | 'expired';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const conditions: SQL<any>[] = [eq(chat.clinicId, clinicId)];

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
        surgeryDate: surgery.date,
        // Project a computed status: preserve 'finalized', otherwise expired when tokenExpiresAt <= now()
        status: sql`CASE WHEN ${chat.status} = 'finished' THEN 'finished' WHEN ${chat.tokenExpiresAt} <= now() THEN 'expired' ELSE ${chat.status} END`,
      })
      .from(chat)
      .leftJoin(surgery, eq(surgery.assessmentId, chat.id))
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
  // If both are null or -1, return unknown
  const validRcri = rcri != null && rcri !== -1 ? rcri : null;
  const validHas2 = has2 != null && has2 !== -1 ? has2 : null;

  if (validRcri === null && validHas2 === null) return 'unknown';

  // Use whichever score is available, or the max if both are available
  const maxScore = Math.max(
    validRcri ?? Number.NEGATIVE_INFINITY,
    validHas2 ?? Number.NEGATIVE_INFINITY,
  );

  if (maxScore <= 1) return 'low';
  if (maxScore <= 3) return 'medium';
  return 'high';
}

function mapRiskLevelToPortuguese(
  riskLevel: 'low' | 'medium' | 'high' | 'unknown',
): 'baixo' | 'moderado' | 'alto' | 'unknown' {
  const map = {
    low: 'baixo' as const,
    medium: 'moderado' as const,
    high: 'alto' as const,
    unknown: 'unknown' as const,
  };
  return map[riskLevel];
}

function mapRiskLevelToPortugueseCapitalized(
  riskLevel: 'low' | 'medium' | 'high' | 'unknown',
): 'Baixo' | 'Moderado' | 'Alto' | 'Desconhecido' {
  const map = {
    low: 'Baixo' as const,
    medium: 'Moderado' as const,
    high: 'Alto' as const,
    unknown: 'Desconhecido' as const,
  };
  return map[riskLevel];
}

/**
 * Get aggregated dashboard metrics for a coordinator
 */
export async function getDashboardMetrics({
  clinicId,
  dateFrom,
  dateTo,
}: {
  clinicId: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const conditions: SQL<any>[] = [eq(chat.clinicId, clinicId)];

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
      if (form?.latexAllergy) {
        latexAllergies++;
      }
    }

    // Get all surgeries for these chats
    const chatIds = allChats.map((c) => c.id);
    const allSurgeries =
      chatIds.length > 0
        ? await db
            .select()
            .from(surgery)
            .where(inArray(surgery.assessmentId, chatIds))
        : [];

    // Surgery tracking
    const totalSurgeriesScheduled = allSurgeries.filter(
      (s) => s.date !== null,
    ).length;
    const surgeriesCompleted = allSurgeries.filter((s) => s.completed).length;
    const surgeriesCancelled = allSurgeries.filter((s) => s.cancelled).length;
    const surgeriesRescheduled = allSurgeries.filter(
      (s) => s.rescheduled,
    ).length;

    // Adjustments
    const adjustmentsRequired = allSurgeries.filter(
      (s) => s.adjustmentsRequired,
    ).length;

    // Daily metrics - surgeries for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSurgeries = allSurgeries.filter((s) => {
      if (!s.date) return false;
      const surgeryDate = new Date(s.date);
      return surgeryDate >= today && surgeryDate < tomorrow;
    });

    // Tomorrow's surgeries
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    const tomorrowsSurgeries = allSurgeries.filter((s) => {
      if (!s.date) return false;
      const surgeryDate = new Date(s.date);
      return surgeryDate >= tomorrow && surgeryDate < dayAfterTomorrow;
    });

    // This week's surgeries
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const thisWeeksSurgeries = allSurgeries.filter((s) => {
      if (!s.date) return false;
      const surgeryDate = new Date(s.date);
      return surgeryDate >= today && surgeryDate < endOfWeek;
    });

    // Cancellation and reschedule breakdown by reason
    const reasonMap = new Map<
      string,
      { cancelled: number; rescheduled: number }
    >();

    for (const surgeryItem of allSurgeries) {
      if (
        (surgeryItem.cancelled || surgeryItem.rescheduled) &&
        surgeryItem.statusReason
      ) {
        const current = reasonMap.get(surgeryItem.statusReason) || {
          cancelled: 0,
          rescheduled: 0,
        };
        if (surgeryItem.cancelled) current.cancelled++;
        if (surgeryItem.rescheduled) current.rescheduled++;
        reasonMap.set(surgeryItem.statusReason, current);
      }
    }

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
      totalSurgeriesScheduled,
      surgeriesCompleted,
      surgeriesCancelled,
      surgeriesRescheduled,
      adjustmentsRequired,
      todaysSurgeries,
      tomorrowsSurgeries,
      thisWeeksSurgeries,
      cancellationsAndReschedulesByReason,
    };
  } catch (error) {
    console.log(error);
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
  clinicId,
  dateFrom,
  dateTo,
}: {
  clinicId: string;
  dateFrom: Date;
  dateTo: Date;
}) {
  try {
    const chats = await db
      .select()
      .from(chat)
      .where(
        and(
          eq(chat.clinicId, clinicId),
          gte(chat.createdAt, dateFrom),
          lt(chat.createdAt, dateTo),
        ),
      )
      .orderBy(asc(chat.createdAt));

    // Get all surgeries for these chats
    const chatIds = chats.map((c) => c.id);
    const surgeries =
      chatIds.length > 0
        ? await db
            .select()
            .from(surgery)
            .where(inArray(surgery.assessmentId, chatIds))
        : [];

    // Create a map of assessmentId to surgery
    const surgeryMap = new Map(surgeries.map((s) => [s.assessmentId, s]));

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

      const surgeryItem = surgeryMap.get(chatItem.id);
      if (surgeryItem?.date) current.surgeriesScheduled++;
      if (surgeryItem?.completed) current.surgeriesPerformed++;
      if (surgeryItem?.cancelled) current.cancellations++;

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
  clinicId,
}: { clinicId: string }) {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const chats = await db
      .select()
      .from(chat)
      .where(eq(chat.clinicId, clinicId));

    // Get all surgeries for these chats
    const chatIds = chats.map((c) => c.id);
    const surgeries =
      chatIds.length > 0
        ? await db
            .select()
            .from(surgery)
            .where(inArray(surgery.assessmentId, chatIds))
        : [];

    // Create a map of assessmentId to surgery
    const surgeryMap = new Map(surgeries.map((s) => [s.assessmentId, s]));

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
      const surgeryItem = surgeryMap.get(chatItem.id);
      const surgeryDate = surgeryItem?.date ? new Date(surgeryItem.date) : null;
      const formAge = chatItem.form as any;
      const patientAge = formAge?.age;

      // High priority: High-risk patients with surgery in next 24 hours
      if (surgeryDate && surgeryDate <= in24Hours && surgeryDate >= now) {
        const riskLevel = calculateRiskLevel(
          chatItem.score_rcri,
          chatItem.score_aub_has2,
        );
        if (riskLevel === 'high') {
          notifications.push({
            id: generateUUID(),
            priority: 'high',
            type: 'high_risk_soon',
            message: `Paciente de alto risco com cirurgia em ${surgeryDate.toLocaleDateString('pt-BR')}`,
            chatId: chatItem.id,
            patientAge,
            surgeryDate,
          });
        }
      }

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
      if (surgeryItem?.medicalInterventionRequired) {
        notifications.push({
          id: generateUUID(),
          priority: 'high',
          type: 'intervention_required',
          message: 'Intervenção médica necessária',
          chatId: chatItem.id,
          patientAge,
        });
      }

      // High priority: Surgery in < 3 days without completed assessment
      if (
        surgeryDate &&
        surgeryDate <= in72Hours &&
        surgeryDate >= now &&
        chatItem.status !== 'finished'
      ) {
        notifications.push({
          id: generateUUID(),
          priority: 'high',
          type: 'surgery_soon_incomplete',
          message: `Cirurgia em ${surgeryDate.toLocaleDateString('pt-BR')} sem avaliação concluída`,
          chatId: chatItem.id,
          patientAge,
          surgeryDate,
        });
      }

      // Medium priority: Moderate-risk patients with surgery in next 48 hours
      if (surgeryDate && surgeryDate <= in48Hours && surgeryDate >= now) {
        const riskLevel = calculateRiskLevel(
          chatItem.score_rcri,
          chatItem.score_aub_has2,
        );
        if (riskLevel === 'medium') {
          notifications.push({
            id: generateUUID(),
            priority: 'medium',
            type: 'moderate_risk_soon',
            message: `Paciente de risco moderado com cirurgia em ${surgeryDate.toLocaleDateString('pt-BR')}`,
            chatId: chatItem.id,
            patientAge,
            surgeryDate,
          });
        }
      }

      // Medium priority: Adjustments required
      if (surgeryItem?.adjustmentsRequired) {
        notifications.push({
          id: generateUUID(),
          priority: 'medium',
          type: 'adjustments_required',
          message: 'Ajustes necessários',
          chatId: chatItem.id,
          patientAge,
        });
      }
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
 * Update surgery details for an assessment
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

    if (surgeryDate !== undefined) updateData.date = surgeryDate;
    if (surgeryCompleted !== undefined) updateData.completed = surgeryCompleted;
    if (surgeryRescheduled !== undefined)
      updateData.rescheduled = surgeryRescheduled;
    if (surgeryCancelled !== undefined) updateData.cancelled = surgeryCancelled;
    if (surgeryStatusReason !== undefined)
      updateData.statusReason = surgeryStatusReason;
    if (medicalInterventionRequired !== undefined)
      updateData.medicalInterventionRequired = medicalInterventionRequired;
    if (interventionNotes !== undefined)
      updateData.interventionNotes = interventionNotes;
    if (adjustmentsRequired !== undefined)
      updateData.adjustmentsRequired = adjustmentsRequired;
    if (adjustmentNotes !== undefined)
      updateData.adjustmentNotes = adjustmentNotes;

    const [updatedSurgery] = await db
      .update(surgery)
      .set(updateData)
      .where(eq(surgery.assessmentId, chatId))
      .returning();

    return updatedSurgery;
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
  clinicId,
}: { clinicId: string }) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all finished assessments for this clinic
    const chats = await db
      .select()
      .from(chat)
      .where(and(eq(chat.clinicId, clinicId), eq(chat.status, 'finished')));

    // Get surgeries scheduled for today
    const todaysSurgeries = await db
      .select()
      .from(surgery)
      .where(
        and(
          inArray(
            surgery.assessmentId,
            chats.map((c) => c.id),
          ),
          gte(surgery.date, today),
          lt(surgery.date, tomorrow),
        ),
      )
      .orderBy(asc(surgery.date));

    // Map surgeries to include chat data and risk level
    return todaysSurgeries.map((surgeryItem) => {
      const chatItem = chats.find((c) => c.id === surgeryItem.assessmentId);
      const rcriScore = chatItem?.score_rcri ?? null;
      const has2Score = chatItem?.score_aub_has2 ?? null;
      const riskLevel = calculateRiskLevel(rcriScore, has2Score);
      const formData = chatItem?.form as any;

      return {
        chatId: surgeryItem.assessmentId,
        patientAge: formData?.age || 0,
        riskLevel: mapRiskLevelToPortugueseCapitalized(riskLevel),
        surgeryDate: surgeryItem.date?.toISOString() || '',
        surgeryName: surgeryItem.name || formData?.surgeryName,
        surgeryTime: formData?.surgeryTime,
        rcriScore: rcriScore,
        has2Score: has2Score,
      };
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      "Failed to get today's surgeries",
    );
  }
}

/**
 * Get monthly surgeries (defaults to current month)
 * @param userId - The user ID
 * @param month - Month (1-12), defaults to current month
 * @param year - Year (e.g., 2024), defaults to current year
 */
export async function getMonthlySurgeries({
  clinicId,
  month,
  year,
}: {
  clinicId: string;
  month?: number;
  year?: number;
}) {
  try {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1; // getMonth() is 0-indexed
    const targetYear = year ?? now.getFullYear();

    // Calculate start and end of the month
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(targetYear, targetMonth, 0); // Day 0 of next month = last day of current month
    endOfMonth.setHours(23, 59, 59, 999);

    // Get all finished or in-progress assessments for this clinic
    const chats = await db
      .select()
      .from(chat)
      .where(
        and(
          eq(chat.clinicId, clinicId),
          sql`${chat.status} IN ('finished', 'in_progress')`,
        ),
      );

    // Get surgeries scheduled in the target month
    const surgeries = await db
      .select()
      .from(surgery)
      .where(
        and(
          inArray(
            surgery.assessmentId,
            chats.map((c) => c.id),
          ),
          gte(surgery.date, startOfMonth),
          lte(surgery.date, endOfMonth),
        ),
      )
      .orderBy(asc(surgery.date));

    // Create a map of assessmentId to chat
    const chatMap = new Map(chats.map((c) => [c.id, c]));

    // Group by day
    const groupedByDay: Record<string, any[]> = {};

    surgeries.forEach((surgeryItem) => {
      if (!surgeryItem.date) return;

      const surgeryDate = new Date(surgeryItem.date);
      const dayOfWeek = surgeryDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
      });
      const dateStr = surgeryDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      const key = `${dayOfWeek}, ${dateStr}`;

      if (!groupedByDay[key]) {
        groupedByDay[key] = [];
      }

      const chatItem = chatMap.get(surgeryItem.assessmentId);
      const formData = chatItem?.form as any;
      const riskLevel = calculateRiskLevel(
        chatItem?.score_rcri ?? null,
        chatItem?.score_aub_has2 ?? null,
      );
      groupedByDay[key].push({
        chatId: surgeryItem.assessmentId,
        patientAge: formData?.age || 0,
        riskLevel: mapRiskLevelToPortuguese(riskLevel),
        surgeryDate: surgeryItem.date.toISOString(),
        surgeryName: surgeryItem.name || formData?.surgeryName,
        surgeryTime: formData?.surgeryTime,
        surgeryCompleted: surgeryItem.completed,
        surgeryCancelled: surgeryItem.cancelled,
        surgeryRescheduled: surgeryItem.rescheduled,
        rcriScore: chatItem?.score_rcri ?? null,
        has2Score: chatItem?.score_aub_has2 ?? null,
      });
    });

    return groupedByDay;
  } catch (error) {
    console.log(error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get monthly surgeries',
    );
  }
}

export async function getWeeklySurgeries({
  clinicId,
  startDate,
  endDate,
}: {
  clinicId: string;
  startDate: Date;
  endDate: Date;
}) {
  try {
    // Get all finished or in-progress assessments for this clinic
    const chats = await db
      .select()
      .from(chat)
      .where(
        and(
          eq(chat.clinicId, clinicId),
          sql`${chat.status} IN ('finished', 'in_progress')`,
        ),
      );

    // Get surgeries scheduled in the date range
    const surgeries = await db
      .select()
      .from(surgery)
      .where(
        and(
          inArray(
            surgery.assessmentId,
            chats.map((c) => c.id),
          ),
          gte(surgery.date, startDate),
          lte(surgery.date, endDate),
        ),
      )
      .orderBy(asc(surgery.date));

    // Create a map of assessmentId to chat
    const chatMap = new Map(chats.map((c) => [c.id, c]));

    // Format surgeries with additional data
    const formattedSurgeries = surgeries
      .filter((surgeryItem) => surgeryItem.date)
      .map((surgeryItem) => {
        const chatItem = chatMap.get(surgeryItem.assessmentId);
        const formData = chatItem?.form as any;
        const riskLevel = calculateRiskLevel(
          chatItem?.score_rcri ?? null,
          chatItem?.score_aub_has2 ?? null,
        );

        return {
          chatId: surgeryItem.assessmentId,
          patientAge: formData?.age || 0,
          riskLevel: mapRiskLevelToPortugueseCapitalized(riskLevel),
          surgeryDate: surgeryItem?.date?.toISOString(),
          surgeryName: surgeryItem.name || formData?.surgeryName || undefined,
          surgeryTime: formData?.surgeryTime || undefined,
          rcriScore: chatItem?.score_rcri ?? null,
          has2Score: chatItem?.score_aub_has2 ?? null,
        };
      });

    return formattedSurgeries;
  } catch (error) {
    console.log(error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get weekly surgeries',
    );
  }
}

export async function getClinicConfigByClinicId({
  clinicId,
}: {
  clinicId: string;
}): Promise<
  | Pick<Clinic, 'clinicName' | 'formConfig' | 'dashboardConfig' | 'updatedAt'>
  | undefined
> {
  try {
    const [config] = await db
      .select({
        clinicName: clinic.clinicName,
        formConfig: clinic.formConfig,
        dashboardConfig: clinic.dashboardConfig,
        updatedAt: clinic.updatedAt,
      })
      .from(clinic)
      .where(eq(clinic.id, clinicId));
    return config;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get clinic config',
    );
  }
}

export async function getClinicFormConfigByClinicId({
  clinicId,
}: {
  clinicId: string;
}): Promise<FormConfiguration> {
  const config = await getClinicConfigByClinicId({ clinicId });
  if (config?.formConfig) {
    return config.formConfig as FormConfiguration;
  }
  return DEFAULT_FORM_CONFIG;
}

export async function updateClinicConfig({
  clinicId,
  clinicName,
  formConfig,
  dashboardConfig,
}: {
  clinicId: string;
  clinicName?: string;
  formConfig?: FormConfiguration;
  dashboardConfig?: DashboardConfiguration;
}) {
  try {
    const updateData: Partial<Clinic> = {
      updatedAt: new Date(),
    };

    if (clinicName !== undefined) updateData.clinicName = clinicName;
    if (formConfig !== undefined) updateData.formConfig = formConfig as any;
    if (dashboardConfig !== undefined)
      updateData.dashboardConfig = dashboardConfig as any;

    const [updated] = await db
      .update(clinic)
      .set(updateData)
      .where(eq(clinic.id, clinicId))
      .returning();

    return updated;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update clinic config',
    );
  }
}

export async function upsertSurgery({
  assessmentId,
  name,
  date,
  time,
}: {
  assessmentId: string;
  name?: string;
  date?: string;
  time?: string;
}) {
  try {
    // Combine date and time into a single timestamp if both provided
    let surgeryDateTime: Date | undefined;
    if (date && time) {
      surgeryDateTime = new Date(`${date}T${time}`);
    } else if (date) {
      surgeryDateTime = new Date(date);
    }

    const surgeryData: any = {
      assessmentId,
    };

    if (name !== undefined) surgeryData.name = name;
    if (surgeryDateTime !== undefined) surgeryData.date = surgeryDateTime;

    return await db
      .insert(surgery)
      .values(surgeryData)
      .onConflictDoUpdate({
        target: surgery.assessmentId,
        set: {
          ...(name !== undefined && { name }),
          ...(surgeryDateTime !== undefined && { date: surgeryDateTime }),
        },
      });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to upsert surgery');
  }
}
