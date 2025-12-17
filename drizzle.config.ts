import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { postgres_url } from '@/lib/shared/constants';

config({
  path: '.env.local',
});

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // biome-ignore lint: Forbidden non-null assertion.
    url: postgres_url!,
  },
});
