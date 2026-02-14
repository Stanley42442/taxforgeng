

# Schema Warning Resolution: aggregateRating

## What the Screenshot Shows

The screenshot displays **cached Google search history** from a previous Rich Results Test run. The warnings reference `WebApplication` type schema -- which we already replaced with `SoftwareApplication` in the last update. These warnings will clear on Google's next crawl.

## Current State

- The `aggregateRating` field is intentionally omitted (comment on line ~177 of SEOHead.tsx: "only add when real reviews exist")
- A `user_reviews` table exists in the database but has **0 reviews** currently
- Google's structured data guidelines explicitly prohibit adding `aggregateRating` without real user data -- doing so risks a manual penalty
- The old `createWebApplicationSchema` export is now dead code (no imports)

## What We Should Do

### 1. Clean up dead code
Remove the unused `createWebApplicationSchema` export from `SEOHead.tsx` to prevent accidental future use that would re-trigger this warning.

### 2. Add dynamic aggregateRating to homepage schema (conditional)
Modify `createSoftwareApplicationSchema` to **optionally** accept review stats. When real reviews exist in the `user_reviews` table, the schema will automatically include:
```
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "12",
  "bestRating": "5",
  "worstRating": "1"
}
```
When no reviews exist (current state), the field is omitted entirely -- which is the correct behavior per Google guidelines.

### 3. Create a hook to fetch review stats
Add a small `useReviewStats` hook that queries the `user_reviews` table for count and average rating. This will be used by Index.tsx to pass real data into the schema generator.

## Files Changed

| File | Change |
|------|--------|
| `src/components/seo/SEOHead.tsx` | Remove dead `createWebApplicationSchema`, update `createSoftwareApplicationSchema` to accept optional rating params |
| `src/pages/Index.tsx` | Pass review stats to schema generator |
| `src/hooks/useReviewStats.ts` | New hook -- queries `user_reviews` for count + average |

## What This Does NOT Do

- Does NOT add fake ratings (Google policy violation)
- Does NOT change any calculation logic
- The warning will naturally disappear once Google re-crawls the updated schema

