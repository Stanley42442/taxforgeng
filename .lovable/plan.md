
# Unified Financial Dashboard Implementation Plan

## Overview

This plan creates a synchronized financial dashboard with global date filtering, renamed pages, and enhanced transaction tables for both Business and Personal finances.

---

## 1. Core Changes Summary

| Area | Change |
|------|--------|
| Page Naming | "Personal Expenses" → "Personal Transactions", "Business Expenses" → "Business Transactions" |
| Global Filtering | New shared context for date range state (Weekly, Monthly, Quarterly, Custom) |
| Dashboard | Enhanced unified view with cross-filtering capabilities |
| Transaction Tables | New table layout with Date, Category, Vendor, Amount, Status columns |

---

## 2. Architecture

### New Shared Context: `DateRangeContext`

A new context will provide global date filtering state that persists across navigation:

```text
┌─────────────────────────────────────────────────────────────────┐
│  DateRangeContext                                              │
│  ├── datePreset: 'week' | 'month' | 'quarter' | 'custom'       │
│  ├── customRange: { start: Date, end: Date }                   │
│  ├── computedRange: { start: Date, end: Date } (derived)       │
│  └── setDatePreset / setCustomRange                            │
└─────────────────────────────────────────────────────────────────┘
          │
          ├──► Dashboard.tsx (consumes)
          ├──► PersonalTransactions.tsx (consumes)
          └──► BusinessTransactions.tsx (consumes)
```

### State Persistence

- Selected date range persisted to `localStorage` via `safeLocalStorage`
- Range survives page navigation and browser refresh
- Uses existing `safeLocalStorage` pattern from codebase

---

## 3. Global Filter Bar Component

### Location
New component: `src/components/GlobalDateFilterBar.tsx`

### Features
- Toggle buttons: Weekly | Monthly | Quarterly | Custom
- Calendar date picker for custom range (using existing `Calendar` component)
- Clear visual indication of active filter
- Responsive design (stacks on mobile)

### Visual Design
```text
┌────────────────────────────────────────────────────────────────┐
│  📅 Filter by Date                                             │
│  ┌─────────┬──────────┬───────────┬─────────────────────────┐  │
│  │  Week   │  Month   │  Quarter  │  Custom: Jan 1 - Jan 31 │  │
│  └─────────┴──────────┴───────────┴─────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Page Renaming

### Navigation Updates (`NavMenu.tsx`)

| Old Path | New Path | Old Label | New Label |
|----------|----------|-----------|-----------|
| `/personal-expenses` | `/personal-transactions` | Personal Expenses | Personal Transactions |
| `/expenses` | `/business-transactions` | Expenses | Business Transactions |

### Route Updates (`App.tsx`)

- Update route paths
- Add redirects from old paths to new paths for bookmarks/links

---

## 5. Transaction Tables Enhancement

### New Table Columns

| Column | Description | Business | Personal |
|--------|-------------|----------|----------|
| Date | Formatted based on filter | Yes | Yes |
| Category | With icon and badge | Yes | Yes |
| Vendor/Description | Transaction description | Yes | Yes |
| Amount | Color-coded (green=income, red=expense) | Yes | Yes |
| Status | Pending/Cleared badge | Yes | Yes |
| Business | Which business (Business only) | Yes | No |

### New Component: `TransactionTable.tsx`

Shared table component for both Business and Personal transactions with:
- Sortable columns
- Responsive design (horizontal scroll on mobile)
- Row expansion for details
- Virtualization for large datasets (using existing pattern)

---

## 6. Real-Time Data Sync

### Existing Pattern (Maintained)

The codebase already has real-time subscriptions:

```typescript
// Dashboard.tsx - existing pattern
const channel = supabase
  .channel('dashboard-expenses')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, 
    () => fetchDashboardData()
  )
  .subscribe();
```

### Enhancement

Add real-time subscriptions to both transaction pages for immediate updates when:
- A transaction is added/deleted in another tab
- Business/Personal mode switches on Dashboard

---

## 7. Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/DateRangeContext.tsx` | Global date range state and persistence |
| `src/components/GlobalDateFilterBar.tsx` | Unified filter bar component |
| `src/components/transactions/TransactionTable.tsx` | Shared table component |
| `src/components/transactions/TransactionRow.tsx` | Table row component |
| `src/pages/PersonalTransactions.tsx` | Renamed Personal Expenses page |
| `src/pages/BusinessTransactions.tsx` | Renamed Business Expenses page |

---

## 8. Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add DateRangeProvider, update routes, add redirects |
| `src/components/NavMenu.tsx` | Update navigation labels and paths |
| `src/pages/Dashboard.tsx` | Consume DateRangeContext, add GlobalDateFilterBar |
| `src/hooks/usePersonalExpenses.ts` | Add date range filtering support |

---

## 9. Database Considerations

### Existing Schema (No Changes Needed)

The current schema already supports all required features:

**expenses table:**
- `date` (date) - for filtering
- `category` (text) - category display
- `description` (text) - vendor/description
- `amount` (numeric) - transaction amount
- `type` (text) - income/expense for color coding

**personal_expenses table:**
- `start_date` (date) - for filtering
- `category` (text) - category display
- `description` (text) - description
- `amount` (numeric) - transaction amount
- `payment_interval` (text) - for status display

### Status Field

Since there's no explicit "status" column, we'll derive it:
- **Business**: Show "Cleared" for past dates, "Pending" for future dates
- **Personal**: Use `is_active` field to determine status

---

## 10. Implementation Order

### Phase 1: Foundation
1. Create `DateRangeContext.tsx`
2. Create `GlobalDateFilterBar.tsx`
3. Wrap App with DateRangeProvider

### Phase 2: Transaction Tables
4. Create `TransactionTable.tsx` and `TransactionRow.tsx`
5. Create `PersonalTransactions.tsx` (enhanced version of PersonalExpenses)
6. Create `BusinessTransactions.tsx` (enhanced version of Expenses)

### Phase 3: Integration
7. Update `App.tsx` routes and redirects
8. Update `NavMenu.tsx` navigation
9. Update `Dashboard.tsx` to use global filter context

### Phase 4: Polish
10. Add real-time subscriptions to transaction pages
11. Ensure responsive design across all breakpoints
12. Test cross-filtering behavior

---

## 11. Technical Details

### Date Range Computation

```typescript
// DateRangeContext.tsx logic
const computeRange = (preset: string, customRange?: DateRange) => {
  const now = new Date();
  switch (preset) {
    case 'week':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'quarter':
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case 'custom':
      return customRange || { start: subDays(now, 30), end: now };
  }
};
```

### Cross-Filtering Effect

When the global date range changes:
1. All subscribed components receive new range via context
2. Data fetching hooks re-run with new date parameters
3. Tables, charts, and metrics update simultaneously
4. No manual refresh required

### Mobile Responsiveness

| Breakpoint | Table Behavior |
|------------|----------------|
| Desktop (>1024px) | Full table with all columns |
| Tablet (768-1024px) | Condensed columns, horizontal scroll |
| Mobile (<768px) | Card-based layout, stacked information |

---

## 12. Backward Compatibility

### URL Redirects

Old URLs will redirect to new ones:
- `/personal-expenses` → `/personal-transactions`
- `/expenses` → `/business-transactions`

### Dashboard Quick Actions

Update quick action links to point to new routes while maintaining the same user experience.

---

## 13. Testing Recommendations

After implementation:
1. Test date filter persistence across page navigation
2. Verify real-time updates when adding/deleting transactions
3. Check responsive behavior on mobile devices
4. Confirm redirects work for old bookmarked URLs
5. Test cross-filtering between Business and Personal modes
