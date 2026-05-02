-- Phase 0: foundational tables.
-- Run against Neon Postgres. Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS feedback (
  id              BIGSERIAL PRIMARY KEY,
  landing         TEXT NOT NULL,
  note            TEXT NOT NULL DEFAULT '',
  session_id      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback (created_at DESC);

-- Generic event log (server-side analytics; populated from Phase 1.4 onward).
CREATE TABLE IF NOT EXISTS events (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  session_id      TEXT,
  user_id         TEXT,
  props           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_name_created_at_idx ON events (name, created_at DESC);

-- Phase 1.1: cached product enrichment lookups, keyed by hashed search keywords.
CREATE TABLE IF NOT EXISTS product_lookups (
  keyword_hash    TEXT PRIMARY KEY,
  keywords        TEXT NOT NULL,
  merchant        TEXT,
  product_url     TEXT,
  image_url       TEXT,
  price_inr       NUMERIC(10,2),
  rating          NUMERIC(3,2),
  raw             JSONB,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS product_lookups_expires_at_idx ON product_lookups (expires_at);

-- Phase 5.2: deterministic LLM recommendation cache.
CREATE TABLE IF NOT EXISTS recommendations_cache (
  signal_hash     TEXT PRIMARY KEY,
  output          JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS recommendations_cache_expires_at_idx ON recommendations_cache (expires_at);
