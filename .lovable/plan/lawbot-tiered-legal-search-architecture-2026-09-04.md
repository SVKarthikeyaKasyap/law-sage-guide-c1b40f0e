# Lawbot — Tiered Legal Search Architecture

## Project Context

Lawbot has two variants:

1. **User Variant**
2. **Lawyer Variant**

Both variants use a three-layer search architecture. The purpose is to make common questions faster and reduce unnecessary searches across the complete legal dataset.

The most important rule is:

> **Layer 1 searches only the specific selected shard. If the Layer 1 result does not meet the required confidence score, immediately move to Layer 2. Never search another Layer 1 shard.**

---

# 1. User Variant

The User Variant has two selectable areas:

### Layer 1 User Shards

- `general_emergency`
- `transportation_immigration`

These are separate datasets/shards.

### General Emergency shard

This shard should contain only commonly used emergency/legal situations that represent the majority of normal user queries, approximately the **80% most frequently needed situations**.

Examples include:

- Witnessing a crime
- Assault
- Threats
- Self-defense
- Immediate safety situations
- Domestic/public emergencies
- Police-related emergency situations
- Basic emergency legal rights and procedures

Do not fill this shard with the complete legal corpus. It should contain only the commonly required information for normal users.

### Transportation / Immigration shard

This shard should contain only commonly used transportation and immigration-related legal situations, again focusing on the high-frequency cases normally required by users.

---

# 2. Lawyer Variant

The Lawyer Variant has six Layer 1 shards:

- `civil`
- `criminal`
- `family`
- `consumer`
- `labor`
- `other`

Each shard must contain only the commonly used/high-frequency legal information for that particular domain.

For example:

### Criminal

Commonly required criminal-law provisions and situations.

### Civil

Commonly used civil-law provisions and situations.

### Family

Common family-law provisions and situations.

### Consumer

Common consumer-rights provisions and situations.

### Labor

Common employment/labor provisions and situations.

### Other

Legal information that does not naturally belong to the other five categories.

The Layer 1 shards are intended to represent approximately the **80% most commonly searched/useful information** for each domain, rather than the complete legal corpus.

---

# 3. Layer 2 — Complete Combined Index

Layer 2 has **only one logical node/index**.

It contains the complete legal dataset across all domains and user categories.

It must include:

- General emergency
- Transportation
- Immigration
- Civil law
- Criminal law
- Family law
- Consumer rights
- Labor law
- Other legal information
- All remaining less-common legal provisions

Unlike Layer 1, Layer 2 is not restricted to the user's selected category.

For example:

A user asks a question while using the **Criminal Law** lawyer category.

Layer 1 searches only:

`criminal`

If the result is weak, Layer 2 searches:

`ALL LEGAL DATA`

Therefore, a Layer 2 result is allowed to come from civil, family, consumer, labor, criminal, emergency, immigration, or any other relevant domain.

This is intentional.

---

# 4. Layer 1 Routing Rule

The selected category determines exactly which Layer 1 shard is searched.

### User Variant

`general_emergency` → search only `general_emergency`

`transportation_immigration` → search only `transportation_immigration`

### Lawyer Variant

`civil` → search only `civil`

`criminal` → search only `criminal`

`family` → search only `family`

`consumer` → search only `consumer`

`labor` → search only `labor`

`other` → search only `other`

There must be **no fallback between Layer 1 shards**.

For example:

```text
Selected category = Criminal

Layer 1:
Search Criminal shard
        ↓
Score result
        ↓
Below threshold
        ↓
Immediately go to Layer 2

```

Do NOT do:

```text
Criminal → Civil → Family → Other → Layer 2

```

That behavior is not wanted.

---

# 5. Confidence-Based Escalation

The existing count-based fallback should be replaced with a relevance/confidence score.

Do not decide escalation simply by checking how many search results were returned.

A search may return five irrelevant results, which should not be considered a successful Layer 1 answer.

Instead, calculate a relevance score for the best matching results.

The score should consider factors such as:

- Keyword matches
- Important legal terminology
- Exact phrase matches
- Title matches
- Section matches
- Content relevance
- Query-to-document similarity

Normalize the resulting score so a configurable threshold can be used.

For example:

```text
Layer 1 confidence >= threshold
        → Answer using Layer 1

Layer 1 confidence < threshold
        → Immediately search Layer 2

```

The threshold should be configurable rather than hard-coded throughout the application.

---

# 6. Layer 2 Escalation

Layer 2 is searched only when Layer 1 fails to reach the required confidence score.

Layer 2 searches the **complete combined dataset**.

Example:

```text
User selects Criminal Law

Query
 ↓
Layer 1 — Criminal shard
 ↓
Confidence = 0.42
 ↓
Threshold = 0.70
 ↓
Layer 2 — Complete legal index
 ↓
Confidence = 0.91
 ↓
Return Layer 2 answer

```

The Layer 2 search must not be restricted to the original Layer 1 category.

This allows the system to discover related laws from another domain when the user's question crosses legal categories.

---

# 7. Layer 3 — Live Legal Search

Keep the existing Layer 3 live-search functionality.

Layer 3 should be used only when Layer 2 still does not produce a sufficiently relevant answer.

For India, this can continue using the existing Indian Kanoon/web-search functionality.

The overall cascade becomes:

```text
USER QUERY
    ↓
SELECTED CATEGORY
    ↓
┌───────────────────────────────┐
│ LAYER 1                       │
│ Specific high-frequency shard │
└───────────────────────────────┘
    ↓
Confidence sufficient?
    ├── YES → Return answer
    │
    └── NO
         ↓
┌───────────────────────────────┐
│ LAYER 2                       │
│ Complete combined legal index │
└───────────────────────────────┘
    ↓
Confidence sufficient?
    ├── YES → Return answer
    │
    └── NO
         ↓
┌───────────────────────────────┐
│ LAYER 3                       │
│ Live legal/web search         │
└───────────────────────────────┘
    ↓
Return answer

```

---

# 8. Important Layer 1 Requirement

Layer 1 is intentionally **small and focused**.

It should contain the high-frequency information that approximately 80% of normal users are expected to need.

The remaining, less frequently used information belongs in Layer 2.

This means Layer 1 should NOT attempt to become a miniature copy of the entire legal database.

The goal is:

```text
Layer 1 = Fast + Focused + Frequently Used
Layer 2 = Complete + Broad
Layer 3 = Live + Last Resort

```

---

# 9. Database Structure

Update `legal_sections` to support the tiered architecture.

Add:

- `country`
- `domain`
- `tier`
- `user_track`

Suggested values:

### `domain`

```text
criminal
civil
family
consumer
labor
other

```

### `tier`

```text
1
2

```

### `user_track`

```text
general_emergency
transportation_immigration

```

`user_track` should be used for User Variant routing, while `domain` should be used for Lawyer Variant routing.

Add appropriate indexes for efficient filtering, especially around:

```text
country
domain
tier
user_track

```

The existing legal data should be backfilled so that every record has the appropriate country, domain, tier, and user-track information where applicable.

---

# 10. Data Distribution

Move the commonly used/high-frequency legal information into Tier 1.

Everything else should remain in Tier 2.

For example:

```text
Tier 1
├── User
│   ├── General Emergency
│   └── Transportation / Immigration
│
└── Lawyer
    ├── Criminal
    ├── Civil
    ├── Family
    ├── Consumer
    ├── Labor
    └── Other

```

And:

```text
Tier 2
└── Complete Legal Corpus
    ├── Criminal
    ├── Civil
    ├── Family
    ├── Consumer
    ├── Labor
    ├── Other
    ├── Emergency
    ├── Transportation
    ├── Immigration
    └── All remaining legal information

```

Newly discovered/scraped legal information should normally be stored in **Tier 2**, unless it is intentionally promoted into a Tier 1 high-frequency shard later.

---

# 11. Local Corpus

The existing local corpus inside `supabase/functions/chat/index.ts` should follow the same classification/routing rules.

Local results used during Layer 1 must be tagged consistently with the corresponding:

- User track
- Lawyer domain
- Tier

This ensures that local/offline results do not bypass the shard architecture.

---

# 12. Chat Search Implementation

Refactor the existing cascading search into clearly separated operations:

```text
searchShard()
searchFullIndex()
searchLive()
scoreSections()

```

### `searchShard()`

Search only the selected Layer 1 shard.

It must never search other Layer 1 shards.

### `searchFullIndex()`

Search the complete Tier 1 + Tier 2 legal corpus regardless of the Layer 1 category.

### `searchLive()`

Perform the existing live/web/Indian Kanoon search when Layers 1 and 2 are insufficient.

---

# 13. User Interface Feedback

The interface should clearly tell the user which layer provided the answer.

Examples:

```text
Layer 1 · General Emergency

```

```text
Layer 1 · Criminal Law

```

```text
Layer 1 · Consumer Rights

```

```text
Layer 2 · Full Legal Corpus

```

```text
Layer 3 · Live Legal Search

```

The label should be generated dynamically based on the actual layer and shard used.

---

# 14. Advanced Mode

Advanced Mode should continue to support the existing behavior of forcing a broader/deeper search when required.

However, normal users should follow the standard cascade:

```text
Layer 1 → Layer 2 → Layer 3

```

with the strict Layer 1 shard rule described above.

---

# 15. Critical Acceptance Criteria

The implementation is considered correct only when all of the following are true:

### Requirement 1

Selecting a Layer 1 category searches only that category's Tier-1 shard.

### Requirement 2

A low Layer-1 confidence score immediately triggers Layer 2.

### Requirement 3

A low Layer-1 score must NOT trigger searches of the other Layer-1 shards.

### Requirement 4

Layer 2 searches the complete combined legal corpus.

### Requirement 5

Layer 2 is allowed to return a result from a different legal domain than the originally selected Layer 1 category.

### Requirement 6

Layer 3 is used only after Layer 2 also fails to meet its confidence requirement.

### Requirement 7

Escalation is based on relevance/confidence, not simply the number of search results.

### Requirement 8

Tier 1 contains primarily the high-frequency/common-use legal information, targeting approximately 80% of normal queries.

### Requirement 9

Tier 2 contains the complete legal corpus and all less frequently used information.

### Requirement 10

The UI identifies whether the answer came from Layer 1, Layer 2, or Layer 3.

---

# Final Architecture

The intended architecture is:

```text
                    LAWbot QUERY
                         │
                         ▼
                SELECTED USER MODE
                OR LAWYER CATEGORY
                         │
                         ▼
              ┌─────────────────────┐
              │      LAYER 1        │
              │ Selected shard only │
              │ High-frequency data │
              └─────────────────────┘
                         │
                   Score result
                         │
              ┌──────────┴──────────┐
              │                     │
        Score sufficient       Score insufficient
              │                     │
              ▼                     ▼
        RETURN ANSWER       ┌─────────────────────┐
                            │      LAYER 2        │
                            │ COMPLETE DATASET    │
                            │ All legal domains   │
                            └─────────────────────┘
                                      │
                                Score result
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                     Score sufficient    Score insufficient
                            │                   │
                            ▼                   ▼
                      RETURN ANSWER      ┌───────────────┐
                                        │    LAYER 3    │
                                        │ Live Search   │
                                        │ Indian Kanoon │
                                        └───────────────┘
                                                │
                                                ▼
                                          RETURN ANSWER

```

## Core Principle

**Layer 1 is category-specific and intentionally limited. Layer 2 is the universal fallback. There is never lateral searching between Layer 1 shards.**