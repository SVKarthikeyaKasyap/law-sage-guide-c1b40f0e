ALTER TABLE public.legal_sections
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'india',
  ADD COLUMN IF NOT EXISTS domain text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS tier smallint NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS user_track text;

CREATE INDEX IF NOT EXISTS legal_sections_shard_idx
  ON public.legal_sections (country, domain, tier);

CREATE INDEX IF NOT EXISTS legal_sections_track_idx
  ON public.legal_sections (country, user_track, tier);

CREATE INDEX IF NOT EXISTS legal_sections_keywords_idx
  ON public.legal_sections USING gin (keywords);

CREATE INDEX IF NOT EXISTS legal_sections_content_trgm_idx
  ON public.legal_sections (lower(title));

CREATE UNIQUE INDEX IF NOT EXISTS legal_sections_unique_idx
  ON public.legal_sections (country, section);