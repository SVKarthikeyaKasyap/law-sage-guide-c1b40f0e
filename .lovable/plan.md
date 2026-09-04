# Tiered Legal Search: Domain Shards First, Full Index Second

## What I understood

You want the search engine to stop scanning everything on every question. Instead:

**Lawyer mode — Layer 1 (six domain shards, only commonly used laws):**
criminal, civil, family, consumer rights, labor, other.
A question asked under "Criminal Law" searches only the criminal shard first.

**User mode — Layer 1 (two shards):**
general emergency, transport/immigration emergency.

**Layer 2 (one combined index, everything):**
Reached only when Layer 1's confidence score is too low. It is slower but can return laws from any domain — so a criminal-mode question may legitimately come back with civil sections.

**Layer 3 (web scraping / Indian Kanoon):** already exists, stays as the rare last resort.

Goal: ~80% of questions answered at Layer 1, less server load, faster answers.

## Current state (verified)

- `supabase/functions/chat/index.ts` already does a 3-step cascade: local corpus, then the `legal_sections` table, then Indian Kanoon for India.
- The escalation trigger today is a simple result **count** (`allSections.length < minResults`), not a relevance score, and there is no domain shard — every level scans the same pool.
- The database search filters by `category` only as a small scoring bonus, and it filters on a `country` column that **does not exist** on `legal_sections` (columns are: section, title, content, keywords, category, source). That filter is silently breaking database results — this is why country switching still felt India-only.

## What I will implement

### 1. Shard the data
Add to `legal_sections`: a `country` column (fixes the broken filter), a `domain` column (`criminal | civil | family | consumer | labor | other`), a `tier` column (`1` = commonly used shard, `2` = full corpus), plus indexes on `(country, domain, tier)` and a text index for matching. User-mode shards map onto the same rows via domain + a `user_track` tag (`general_emergency`, `transport`).

### 2. Scored, tiered cascade in the chat function
Replace the count-based escalation with a real confidence score:

```text
Layer 1  shard(country, domain/track, tier=1) + matching local corpus
            |  score >= threshold  -> answer now
            |  score <  threshold
Layer 2  full index (country, all domains, tier 1+2)
            |  score >= lower threshold -> answer
            |  still weak
Layer 3  Indian Kanoon / web scrape (India), store results back into tier 2
```

Score = weighted keyword hits + title/section match + phrase match, normalised so a threshold is meaningful. Top match must clear the bar, not just "3 rows returned".

### 3. Seed the shards
Populate tier-1 shards with the commonly used sections per domain and country (India uses BNS/BNSS, not IPC/CrPC), and move the rest of the corpus into tier 2. Newly scraped laws are written into tier 2 so future searches find them without scraping again.

### 4. Feedback in the UI
The chat shows which layer answered ("Layer 1 · Criminal shard", "Layer 2 · full corpus", "Layer 3 · live search") so escalation is visible. Advanced Mode keeps forcing all three layers.

## Technical notes

- Migration: `ALTER TABLE public.legal_sections` add `country`, `domain`, `tier`, `user_track`; backfill existing rows; add indexes. No new tables, existing read policy unchanged.
- `supabase/functions/chat/index.ts`: split `cascadingLegalSearch` into `searchShard()`, `searchFullIndex()`, `searchLive()`; add `scoreSections()` and threshold constants; remove the invalid `country` filter path once the column exists.
- Local corpus in the function gets the same domain tagging so Layer 1 stays consistent offline.
- Case-type ids in `CaseTypeSelector` / `UserCaseSelector` map 1:1 to domain/track values — no UI restructuring needed.

No code is changed until you approve this.
