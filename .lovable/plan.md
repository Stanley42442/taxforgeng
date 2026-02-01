

# Dashboard Toggle & Carousel Restoration

## Overview

This plan addresses two distinct features:
1. **Dashboard Mode Toggle** - Add a toggle to switch between Business and Personal expense views
2. **Carousel Restoration** - Revert the landing page carousel from crossfade to sliding animation

---

## Part 1: Dashboard Personal/Business Toggle

### Current State

The Dashboard currently displays:
- Business expenses from the `expenses` table (linked via `business_id`)
- Business-related summary (income, expenses, net, deductible)
- Sparkline charts for the last 7 days of business transactions
- Saved businesses list and reminders

### Proposed Changes

Add a toggle switch at the top of the Financial Summary section that allows users to switch between:

| Mode | Data Source | Summary Shows |
|------|-------------|---------------|
| **Business** (default) | `expenses` table | Business income, expenses, net, deductible amounts |
| **Personal** | `personal_expenses` table | Rent, pension, health insurance, child education, etc. |

### Implementation Details

**File: `src/pages/Dashboard.tsx`**

1. **Add State for Dashboard Mode**
   ```typescript
   const [dashboardMode, setDashboardMode] = useState<'business' | 'personal'>('business');
   ```

2. **Import Personal Expenses Hook**
   ```typescript
   import { usePersonalExpenses } from '@/hooks/usePersonalExpenses';
   ```

3. **Add Toggle UI** - Place a segmented toggle in the Financial Summary header:
   - Two options: "Business" and "Personal" with appropriate icons
   - Persisted to localStorage for user preference

4. **Conditional Data Display**
   - When `dashboardMode === 'business'`: Show current business expenses view
   - When `dashboardMode === 'personal'`: Show personal expenses summary with:
     - Total rent paid
     - Pension contributions
     - Health/life insurance
     - Child education expenses
     - Other deductible categories
     - Link to Personal Expenses page instead of Business Expenses

5. **Personal Summary Cards** (when in Personal mode):
   - Card 1: **Rent Relief** - Annual rent amount
   - Card 2: **Pension** - Total pension contributions
   - Card 3: **Insurance** - Health + Life insurance totals
   - Card 4: **Total Deductible** - Sum of all personal deductions

6. **Quick Actions Update**
   - In Personal mode, replace "Expenses" quick action with "Personal Expenses"
   - Keep other actions the same

### Personal Dashboard View Structure

```text
+--------------------------------------------------+
| Financial Summary          [Business] [Personal] |
+--------------------------------------------------+
| Date Range: [This Month ▼]         [PDF] [CSV]   |
+--------------------------------------------------+
| +----------+ +----------+ +----------+ +--------+|
| | Rent     | | Pension  | | Insurance| | Total  ||
| | NGN X    | | NGN X    | | NGN X    | | NGN X  ||
| | Relief   | | Contrib  | | Premiums | | Deduct ||
| +----------+ +----------+ +----------+ +--------+|
+--------------------------------------------------+
```

---

## Part 2: Carousel Restoration to Sliding Animation

### Current State

The landing page carousel uses:
- `embla-carousel-fade` plugin for crossfade transitions
- `embla-carousel-autoplay` for automatic advancement
- CSS classes `carousel-fade-container` and `carousel-fade-slide` for fade effects

### Proposed Changes

Revert to the standard sliding animation by:

1. **Remove Fade Plugin** from carousel configuration
2. **Remove Fade CSS Classes** from carousel markup
3. **Keep Autoplay** - Still auto-advance slides
4. **Maintain Loop** - Still loop infinitely

### Implementation Details

**File: `src/pages/Index.tsx`**

```typescript
// BEFORE
import Fade from "embla-carousel-fade";

plugins={[
  Fade(),
  Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
]}

<CarouselContent className="carousel-fade-container">
  <CarouselItem key={index} className="carousel-fade-slide">

// AFTER (remove Fade, keep Autoplay)
// Remove: import Fade from "embla-carousel-fade";

plugins={[
  Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
]}

<CarouselContent>
  <CarouselItem key={index}>
```

The carousel will now use the default Embla sliding animation, which smoothly slides between items horizontally.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Add toggle state, import usePersonalExpenses, add toggle UI, conditional rendering for personal/business views |
| `src/pages/Index.tsx` | Remove Fade import, remove Fade() from plugins array, remove fade CSS classes from CarouselContent and CarouselItem |

---

## Technical Notes

### Dashboard Toggle Persistence
The toggle preference will be saved to localStorage using `safeLocalStorage`:
```typescript
const [dashboardMode, setDashboardMode] = useState<'business' | 'personal'>(() => {
  const saved = safeLocalStorage.getItem('dashboard_mode');
  return (saved as 'business' | 'personal') || 'business';
});
```

### Personal Expenses Summary Calculation
Will reuse the `annualTotals` from `usePersonalExpenses` hook which already calculates:
- `rent`, `pension_contribution`, `nhf_contribution`
- `health_insurance`, `life_insurance`
- `child_education`, `dependent_care`, `disability_support`
- `other`

### No Database Changes Required
Both features only require frontend changes - no migrations or RLS policy updates needed.

