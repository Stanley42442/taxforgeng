
## Add "Partner with Us" to Navigation — Desktop/Tablet Bar + Mobile Hamburger Menu

### What the User Wants
- **Desktop & Tablet (md and up)**: A visible "Partner with Us" link in the top navigation bar itself — not buried in a dropdown.
- **Mobile & small screens**: The link should appear in the hamburger/sheet menu (the accordion), which is the existing pattern for mobile navigation.

### Exactly What Will Change

Only **one file** needs editing: `src/components/NavMenu.tsx`

---

#### Change 1 — Import `Handshake` icon

Add `Handshake` to the existing lucide-react import block (line 22–59). This icon clearly signals partnership at a glance.

---

#### Change 2 — Add a persistent link in the desktop/tablet top bar

In the `{/* Actions */}` section of the header (around line 329), a standalone "Partner with Us" link is added **before** the FeedbackForm. It will:

- Show on `md` screens and wider (hidden on mobile, which uses the hamburger)
- Use `Handshake` icon + "Partner with Us" text
- Styled as a subtle outlined button / accent link so it stands out from regular quick-links but doesn't compete with primary CTAs
- Always visible — no auth check, no tier check

Visual result on desktop/tablet:

```text
[ Logo ]  [ Quick Links... ]          [ Partner with Us ] [ Feedback ] [ TierSwitcher ] [ 🔔 ] [ ☰ ]
```

---

#### Change 3 — Ensure "Partner with Us" is in the Resources group in the hamburger menu

Looking at the current `navGroups` Resources group (lines 150–170 approx), the `/embed-partner` link is already present as `{ to: "/embed-partner", label: "Partner with Us", icon: Code }`. 

It will be **moved to the top** of the Resources links array so it's the very first item a user sees when they expand that group in the mobile sheet — making it immediately discoverable without scrolling through the list.

The icon will also be updated from `Code` to `Handshake` for consistency.

---

### Breakpoint Summary

| Screen Size | Where "Partner with Us" appears |
|---|---|
| Mobile (< md, < 768px) | Hamburger sheet → Resources accordion → first item |
| Tablet (md, ≥ 768px) | Top navigation bar (persistent link) |
| Desktop (lg+, ≥ 1024px) | Top navigation bar (persistent link) |

---

### Files to Modify

| File | Change |
|---|---|
| `src/components/NavMenu.tsx` | Import `Handshake`; add persistent desktop/tablet link in header; move "Partner with Us" to top of Resources group with updated icon |

No database changes, no new files, no edge functions needed.
