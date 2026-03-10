

## Fix Remaining See-Through Cards

Three more spots in `src/pages/Documentation.tsx` still have translucent card backgrounds that were missed in the previous pass.

### Changes

**`src/pages/Documentation.tsx`**

| Line | Current | Fix |
|------|---------|-----|
| 652 | `bg-card/50 backdrop-blur-sm` | Remove both classes |
| 691 | `bg-card/50 backdrop-blur-sm` | Remove both classes |
| 728 | `backdrop-blur-sm` | Remove class (keep gradient) |

The other `backdrop-blur` hits are intentional overlays (modals, loaders, upgrade prompts) — not content cards — so they stay as-is. The `bg-card/80` on button glass variants is a hover state, not a card background.

**1 file, 3 lines.**

