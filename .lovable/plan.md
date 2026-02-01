

# Personal Dashboard Data Source & Layout Fixes

## Issues Identified

### Issue 1: Monthly Overview & Expense Breakdown Using Wrong Data Source
**Location**: `src/pages/Dashboard.tsx` lines 856-860 and `src/components/ExpenseCharts.tsx`

The Personal Dashboard currently uses the `ExpenseCharts` component which receives `expenses` - the **business expenses** array from the `expenses` table. This means:
- The "Monthly Overview" bar chart shows business income vs expenses
- The "Expense Breakdown" pie chart shows business expense categories (rent, transport, marketing, salary, etc.)

These should show **personal expense** data when in Personal mode (from `personal_expenses` table).

### Issue 2: My Businesses & Upcoming Reminders Appearing in Personal Dashboard
**Location**: `src/pages/Dashboard.tsx` lines 704-854

The Main Content Grid always displays:
- "My Businesses" card (lines 706-788)
- "Upcoming Reminders" card (lines 791-853)

These business-focused sections should **not** appear in Personal Dashboard mode.

---

## Technical Solution

### Fix 1: Conditional Charts Based on Dashboard Mode

Create a new `PersonalExpenseCharts` component that visualizes personal expense data:

**File: `src/components/PersonalExpenseCharts.tsx`** (New File)

| Feature | Personal Mode Display |
|---------|----------------------|
| Expense Breakdown (Pie) | Categories: Rent, Pension, Health Insurance, Life Insurance, Child Education, etc. |
| Monthly Overview (Bar) | Monthly personal expense totals by category |

The component will:
- Accept `annualTotals` and `expenses` from `usePersonalExpenses` hook
- Use personal expense categories from `PERSONAL_EXPENSE_CATEGORIES`
- Display appropriate colors matching the category icons

### Fix 2: Conditionally Render Main Content Grid

**File: `src/pages/Dashboard.tsx`**

| Mode | Visible Sections |
|------|-----------------|
| **Business** | My Businesses, Upcoming Reminders, ExpenseCharts |
| **Personal** | Personal Expense Categories, Tax Relief Summary, PersonalExpenseCharts |

In Personal mode, replace the business sections with:
- **Personal Deductions Summary**: List of each personal expense category with amounts
- **Tax Relief Breakdown**: Show which reliefs are being claimed

---

## Implementation Details

### New PersonalExpenseCharts Component

```typescript
interface PersonalExpenseChartsProps {
  expenses: PersonalExpense[];
  annualTotals: AnnualTotals;
}
```

**Pie Chart Data** (Expense Breakdown):
- Transform `annualTotals` into pie chart format
- Use colors matching personal expense category themes:
  - Rent: Blue
  - Pension: Green
  - Health Insurance: Pink
  - Life Insurance: Purple
  - Child Education: Amber
  - Dependent Care: Cyan
  - Other: Gray

**Bar Chart Data** (Monthly Overview):
- Group personal expenses by month
- Show stacked or grouped bars for different categories

### Dashboard Layout Changes

```text
BUSINESS MODE:
+--------------------------------------------------+
| [My Businesses]          | [Upcoming Reminders]  |
+--------------------------------------------------+
| [Expense Breakdown]      | [Monthly Overview]    |
+--------------------------------------------------+

PERSONAL MODE:
+--------------------------------------------------+
| [Personal Deductions]    | [Tax Reliefs Summary] |
+--------------------------------------------------+
| [Personal Breakdown]     | [Monthly Personal]    |
+--------------------------------------------------+
```

### Personal Deductions Card

A new card showing all personal expense categories:
- List each category with icon, name, and annual amount
- Show which categories have entries
- Link to Personal Expenses page for each category

### Tax Reliefs Summary Card

Shows calculated tax reliefs based on personal expenses:
- Rent Relief (20% of rent, max NGN 500,000)
- Pension contributions (fully deductible)
- Insurance premiums
- Child Education Allowance
- Dependent Relative Relief

---

## Files to Modify/Create

| File | Changes |
|------|---------|
| `src/components/PersonalExpenseCharts.tsx` | **NEW** - Personal expense visualization component |
| `src/pages/Dashboard.tsx` | Conditional rendering of business vs personal sections, import and use PersonalExpenseCharts |

---

## Expected Results

### Business Mode (unchanged):
- My Businesses card with saved businesses list
- Upcoming Reminders card with tax deadlines
- Expense Breakdown pie chart (business categories)
- Monthly Overview bar chart (income vs expenses)

### Personal Mode (fixed):
- Personal Deductions card with all personal expense categories
- Tax Reliefs Summary showing calculated reliefs
- Personal Expense Breakdown pie chart (rent, pension, insurance, etc.)
- Monthly Personal Overview showing expense trends

No more business-focused content (businesses, reminders) appearing in Personal Dashboard.

---

## Technical Notes

### Data Flow
- Business mode: Uses `expenses` state from `fetchDashboardData()`
- Personal mode: Uses `expenses` and `annualTotals` from `usePersonalExpenses()` hook (already imported)

### Category Colors for Personal Expenses
```typescript
const PERSONAL_CATEGORY_COLORS: Record<string, string> = {
  rent: '#3b82f6',           // Blue
  pension_contribution: '#22c55e', // Green
  nhf_contribution: '#10b981',     // Emerald
  health_insurance: '#ec4899',     // Pink
  life_insurance: '#8b5cf6',       // Purple
  child_education: '#f59e0b',      // Amber
  dependent_care: '#06b6d4',       // Cyan
  disability_support: '#6366f1',   // Indigo
  gratuity_received: '#f97316',    // Orange
  other: '#6b7280',               // Gray
};
```

### Realtime Updates
Personal expenses should also have realtime subscription for updates when in Personal mode. Will add a subscription to `personal_expenses` table similar to the existing `expenses` subscription.

