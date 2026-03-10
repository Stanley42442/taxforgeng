

## Redesign Quick Reference Card

The Quick Reference section at the bottom of PayrollCalculator is a plain unstyled grid of bullet lists — it looks flat and unfinished compared to the premium fintech style used elsewhere.

### Design

Replace the plain `div` columns with individual styled sub-cards inside the grid, each with an icon, a colored header badge, and clean spacing. This matches the solid-card fintech pattern used across the rest of the app.

### Changes — `src/components/PayrollCalculator.tsx`

**1. Add imports** — `BookOpen`, `Percent`, `Receipt` icons from lucide-react.

**2. Replace lines 290–329** (the Quick Reference Card) with:

- Outer Card stays, title updated to include a `BookOpen` icon.
- Each of the 3 columns becomes a bordered `div` with `rounded-lg border bg-muted/30 p-4` styling:
  - **Pension Rates** — `Percent` icon, items use a clean `flex justify-between` layout (label left, value right) instead of bullet points.
  - **2026 PIT Rates** — table-style rows with band and rate, alternating subtle background.
  - **2026 Allowable Deductions** — clean list with small colored dots instead of bullet characters; "ABOLISHED" row gets a red badge.

This gives each section visual weight, clear hierarchy, and a polished look consistent with the rest of the dashboard.

**1 file, 1 section rewrite (~40 lines).**

