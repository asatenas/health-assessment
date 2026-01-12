import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
  check,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { CHAT_STATUSES } from './chat-status';

export const user = pgTable('Clinic', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  emailVerified: boolean('emailVerified').notNull().default(false),
});

export type User = InferSelectModel<typeof user>;

export const clinicConfig = pgTable('ClinicConfig', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  clinicId: uuid('clinicId')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  clinicName: varchar('clinicName', { length: 255 }),
  formConfig: json('formConfig').notNull(),
  dashboardConfig: json('dashboardConfig'), // nullable for backward compatibility
  updatedAt: timestamp('updatedAt').notNull().default(sql`now()`),
});

export type ClinicConfig = InferSelectModel<typeof clinicConfig>;

export const patient = pgTable(
  'Patient',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    clinicId: uuid('clinicId')
      .notNull()
      .references(() => user.id),
    cpf: varchar('cpf', { length: 14 }).notNull(),
    phoneNumber: varchar('phoneNumber', { length: 20 }),
    email: varchar('email', { length: 255 }),
  },
  (table) => ({
    clinicCpfUnique: unique().on(table.clinicId, table.cpf),
  }),
);

export type Patient = InferSelectModel<typeof patient>;

export type ChatForm = {
  age: number;
  weight: number;
  height: number;
  latexAllergy?: boolean;
  allergies?: string[];
  medicalDevices?: {
    paceMaker?: boolean;
    cdi?: boolean;
    medicationPump?: boolean;
    others?: string[];
  };
  aestheticItems?: {
    megaHair?: boolean;
    hairExtensions?: boolean;
    gelNails?: boolean;
    falseLashes?: boolean;
    piercings?: boolean;
    contactLenses?: boolean;
    others?: string[];
  };
  recreationalDrugs?: {
    cocaine?: boolean;
    marijuana?: boolean;
    crack?: boolean;
    opioids?: boolean;
    methamphetamine?: boolean;
    others?: string[];
  };
  hemoglobin?: number;
  creatinine?: number;
};

export const chat = pgTable(
  'Assessment',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    userId: uuid('clinicId')
      .notNull()
      .references(() => user.id),
    patientId: uuid('patientId').references(() => patient.id),
    visibility: varchar('visibility', { enum: ['public', 'private'] })
      .notNull()
      .default('private'),
    readOnly: boolean('readOnly').notNull().default(false),
    form: json('form'),
    results: text('results'),
    medications: text('medications'),
    token: varchar('token', { length: 9 }),
    tokenExpiresAt: timestamp('tokenExpiresAt').notNull(),
    status: varchar('status', {
      enum: CHAT_STATUSES,
    })
      .notNull()
      .default('active'),
    score_rcri: integer('score_rcri'),
    score_aub_has2: integer('score_aub_has2'),
    nps: integer('nps'),
  },
  (table) => ({
    scoreRcriCheck: check(
      'score_rcri_non_negative',
      sql`${table.score_rcri} >= 0`,
    ),
    scoreAubHas2Check: check(
      'score_aub_has2_non_negative',
      sql`${table.score_aub_has2} >= 0`,
    ),
    npsCheck: check('nps_range', sql`${table.nps} >= 0 AND ${table.nps} <= 10`),
  }),
);

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('assessmentId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('assessmentId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

export const checkpoint = pgTable('Checkpoint', {
  chatId: uuid('assessmentId')
    .primaryKey()
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  created: timestamp('created'),
  opened: timestamp('opened'),
  formSubmitted: timestamp('formSubmitted'),
  medications: timestamp('medications'),
  surgeryType: timestamp('surgeryType'),
  insulin: timestamp('insulin'),
  creatinine: timestamp('creatinine'),
  hemoglobin: timestamp('hemoglobin'),
  cerebralIschemia: timestamp('cerebralIschemia'),
  coronaryDisease: timestamp('coronaryDisease'),
  cardiacStructure: timestamp('cardiacStructure'),
  nps: timestamp('nps'),
  completed: timestamp('completed'),
  interrupted: timestamp('interrupted'),
});

export type Checkpoint = InferSelectModel<typeof checkpoint>;

export const surgery = pgTable('Surgery', {
  assessmentId: uuid('assessmentId')
    .primaryKey()
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }),
  date: timestamp('date'),
  completed: boolean('completed').notNull().default(false),
  rescheduled: boolean('rescheduled').notNull().default(false),
  cancelled: boolean('cancelled').notNull().default(false),
  statusReason: varchar('statusReason', { length: 200 }),
  medicalInterventionRequired: boolean('medicalInterventionRequired')
    .notNull()
    .default(false),
  interventionNotes: text('interventionNotes'),
  adjustmentsRequired: boolean('adjustmentsRequired').notNull().default(false),
  adjustmentNotes: text('adjustmentNotes'),
});

export type Surgery = InferSelectModel<typeof surgery>;
