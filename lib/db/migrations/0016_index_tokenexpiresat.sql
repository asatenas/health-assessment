-- Create an index on tokenExpiresAt to speed up queries that filter by expiration time
CREATE INDEX IF NOT EXISTS idx_chat_tokenexpiresat ON "Chat" ("tokenExpiresAt");
