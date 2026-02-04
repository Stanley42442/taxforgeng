
# Fix Dashboard Date Filtering for Charts

## Issues Identified

### Issue 1: Expense Breakdown & Monthly Overview Don't Respect Filter (Business Mode)
The `ExpenseCharts` component receives `expenses` (unfiltered) instead of `filteredExpenses`. When you select a date range like "This Week" or "This Month", the summary cards update correctly, but the charts continue showing all-time data.

**Current Code (Line 938):**
```typescript
<ExpenseCharts expenses={expenses} />
```

**Should Be:**
```typescript
<ExpenseCharts expenses={filteredExpenses} />
```

### Issue 2: Personal Dashboard Has No Date Filter
When you switch to Personal mode, the date filter dropdown disappears entirely. The Personal view only shows annual totals with no ability to filter by week/month/quarter.

The date filter UI is only rendered in the collapsible summary header when showing Business metrics, but it should also be available in Personal mode.

---

## Changes Required

### 1. Fix Business Charts - Pass Filtered Expenses (Dashboard.tsx)

Change the `ExpenseCharts` component to receive `filteredExpenses` instead of all expenses:

```typescript
// Line 938
<ExpenseCharts expenses={filteredExpenses} />
```

This ensures that:
- The Expense Breakdown pie chart only shows expenses within the selected date range
- The Monthly Overview bar chart only shows months within the selected range

---

### 2. Add Date Filter to Personal Mode (Dashboard.tsx)

Currently, the date filter is only visible in Business mode. We need to:

1. **Show the date filter dropdown in Personal mode** - The filter UI should be visible regardless of dashboard mode

2. **Filter personal expenses by date range** - Create a `filteredPersonalExpenses` variable that filters `personalExpenses` based on `dateRangeStart` and `dateRangeEnd`

3. **Update PersonalExpenseCharts** - Pass filtered expenses and recalculate `annualTotals` based on the filtered data

---

### 3. Update Personal Summary Cards (Dashboard.tsx)

The Personal mode summary cards currently show annual totals. These should be updated to reflect the selected date range:

```typescript
const filteredPersonalExpenses = useMemo(() => {
  return personalExpenses.filter(e => {
    const expenseDate = new Date(e.start_date);
    return isWithinInterval(expenseDate, { start: dateRangeStart, end: dateRangeEnd });
  });
}, [personalExpenses, dateRangeStart, dateRangeEnd]);

const filteredAnnualTotals = useMemo(() => {
  // Recalculate totals based on filteredPersonalExpenses
  return filteredPersonalExpenses.reduce((totals, expense) => {
    // ... calculation logic
  }, { rent: 0, pension_contribution: 0, ... });
}, [filteredPersonalExpenses]);
```

---

### 4. Update PersonalExpenseCharts Component

Modify the component to use the filtered data passed from the Dashboard:

- The pie chart will show category breakdown for the selected period
- The bar chart will show monthly data within the selected range
- Total calculations will reflect the filtered period

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | 1. Pass `filteredExpenses` to `ExpenseCharts`<br>2. Add `filteredPersonalExpenses` and `filteredAnnualTotals` memos<br>3. Show date filter in Personal mode<br>4. Update Personal summary cards to use filtered totals |
| `src/components/PersonalExpenseCharts.tsx` | Update to handle date-filtered data properly |

---

## Implementation Details

### Dashboard.tsx Changes

**Add filtered personal expenses (after line 326):**
```typescript
const filteredPersonalExpenses = useMemo(() => {
  return personalExpenses.filter(e => {
    const expenseDate = new Date(e.start_date);
    return isWithinInterval(expenseDate, { start: dateRangeStart, end: dateRangeEnd });
  });
}, [personalExpenses, dateRangeStart, dateRangeEnd]);
```

**Add filtered annual totals (after filteredPersonalExpenses):**
```typescript
const filteredAnnualTotals = useMemo(() => {
  return filteredPersonalExpenses.reduce((totals, expense) => {
    const amount = Number(expense.amount);
    const category = expense.category as keyof typeof totals;
    if (category in totals) {
      totals[category] += amount;
    }
    return totals;
  }, {
    rent: 0, pension_contribution: 0, nhf_contribution: 0,
    health_insurance: 0, life_insurance: 0, child_education: 0,
    dependent_care: 0, disability_support: 0, gratuity_received: 0, other: 0
  });
}, [filteredPersonalExpenses]);
```

**Fix line 938:**
```typescript
<ExpenseCharts expenses={filteredExpenses} />
```

**Update line 1126:**
```typescript
<PersonalExpenseCharts expenses={filteredPersonalExpenses} annualTotals={filteredAnnualTotals} />
```

**Show date filter in Personal mode summary header:**
Move the date filter outside the Business-only conditional, so it appears in both modes.

---

## Expected Behavior After Fix

### Business Mode
- Selecting "This Week" filters the pie chart to only show expenses from this week
- Monthly Overview shows only months within the selected range
- Custom date range affects all charts and metrics

### Personal Mode  
- Date filter dropdown visible in the summary section
- Selecting a date range filters all personal expense data
- Pie chart shows category breakdown for selected period
- Bar chart shows monthly totals within selected period
- Summary cards update to show filtered totals
