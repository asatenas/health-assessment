import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const dbUrl = isDevelopment
    ? process.env.POSTGRES_URL_DEV
    : process.env.POSTGRES_URL;

  console.log(`🔍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Using database: ${isDevelopment ? 'DEV' : 'MAIN'}`);

  // biome-ignore lint: Forbidden non-null assertion.
  const connection = postgres(dbUrl!, { max: 1, ssl: 'require' });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
