

# Fix: Missing Soft-Delete Filters, Convert Hard Deletes, and Replace Console Logs

## Overview

This plan addresses three categories of issues identified in the codebase:
1. **Category 1**: Missing `deleted_at` filters in queries (showing deleted records)
2. **Category 2**: Hard deletes that should be soft deletes (expenses, invoices, employees)
3. **Category 5**: Console.log statements that should use the logger utility

---

## Category 1: Missing `deleted_at` Filters

These queries currently fetch soft-deleted records, causing incorrect data displays and calculations.

### Files to Fix

| File | Issue | Fix |
|------|-------|-----|
| `src/pages/Expenses.tsx` | Line ~559 fetches all expenses | Add `.is('deleted_at', null)` |
| `src/pages/Invoices.tsx` | Line ~95 fetches all invoices | Add `.is('deleted_at', null)` |
| `src/pages/ProfitLoss.tsx` | Profit/loss calculations include deleted entries | Add `.is('deleted_at', null)` to all queries |
| `src/pages/BusinessReport.tsx` | Business report includes deleted records | Add `.is('deleted_at', null)` |
| `src/pages/Dashboard.tsx` | Stats may include deleted records | Add `.is('deleted_at', null)` |
| `src/pages/AccountantPortal.tsx` | Accountant view shows deleted records | Add `.is('deleted_at', null)` |
| `src/pages/AdminAnalytics.tsx` | Admin metrics include deleted records | Add `.is('deleted_at', null)` |
| `src/hooks/useDocumentationStats.ts` | All stat counts include deleted records | Add `.is('deleted_at', null)` to applicable tables |
| `src/contexts/SubscriptionContext.tsx` | Tier snapshot logic counts deleted items | Add `.is('deleted_at', null)` |

### Pattern

```typescript
// Before
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('user_id', user.id);

// After  
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('user_id', user.id)
  .is('deleted_at', null);
```

---

## Category 2: Convert Hard Deletes to Soft Deletes

Convert direct `.delete()` calls to soft deletes for data recovery capability.

### Files to Convert

| File | Table | Current | Change To |
|------|-------|---------|-----------|
| `src/pages/Expenses.tsx` | expenses | `.delete()` | `.update({ deleted_at: new Date().toISOString() })` |
| `src/pages/Invoices.tsx` | invoices | `.delete()` | `.update({ deleted_at: new Date().toISOString() })` |
| `src/hooks/useEmployees.ts` | employees | `.delete()` | `.update({ deleted_at: new Date().toISOString() })` |
| `src/hooks/usePayrollHistory.ts` | payroll_runs | `.delete()` | `.update({ deleted_at: new Date().toISOString() })` |

### Keep as Hard Delete (per recommendation)

| File | Table | Reason |
|------|-------|--------|
| `src/pages/Reminders.tsx` | reminders | Low-value ephemeral data, no audit need |
| `src/lib/notifications.ts` | user_notifications | User-initiated clear action |
| `src/pages/CalculationHistory.tsx` | individual_calculations | User-initiated clear, no business need |
| `src/components/IPWhitelistManager.tsx` | ip_whitelist | Security data, user controls |
| `src/components/EmailRecipientsManager.tsx` | email_recipients | User preference, no audit need |

### Soft Delete Pattern

```typescript
// Before (hard delete)
const deleteEmployee = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => {
    toast.success('Employee deleted');
  },
});

// After (soft delete)
const deleteEmployee = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase
      .from('employees')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => {
    toast.success('Employee deleted');
  },
});
```

---

## Category 5: Replace Console.log with Logger

The `src/lib/taxValidators.ts` file uses raw `console.log/group/warn` statements instead of the project's logger utility.

### File to Fix

**`src/lib/taxValidators.ts`** (lines 675-693)

### Current Code
```typescript
export function logVerificationResults(report: VerificationReport, context: string): void {
  if (!import.meta.env.DEV) return;
  
  console.group(`📋 Tax Verification Report: ${context}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`All Passed: ${report.allPassed ? '✅' : '❌'}`);
  console.log(`Rules Age: ${report.rulesAge} days`);
  
  if (report.warnings.length > 0) {
    console.warn('⚠️ Warnings:', report.warnings);
  }
  
  console.group('Validation Results:');
  report.results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.ruleName}: ${result.explanation}`);
  });
  console.groupEnd();
  
  console.log('Sources:', report.sources);
  console.groupEnd();
}
```

### Fixed Code
```typescript
import logger from '@/lib/logger';

export function logVerificationResults(report: VerificationReport, context: string): void {
  // Logger already checks for dev mode internally
  logger.debug(`📋 Tax Verification Report: ${context}`);
  logger.debug(`Timestamp: ${report.timestamp}`);
  logger.debug(`All Passed: ${report.allPassed ? '✅' : '❌'}`);
  logger.debug(`Rules Age: ${report.rulesAge} days`);
  
  if (report.warnings.length > 0) {
    logger.warn('⚠️ Warnings:', report.warnings);
  }
  
  logger.debug('Validation Results:');
  report.results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    logger.debug(`${icon} ${result.ruleName}: ${result.explanation}`);
  });
  
  logger.debug('Sources:', report.sources);
}
```

---

## Summary of Changes

| Category | Files | Changes |
|----------|-------|---------|
| 1 - Missing filters | 9 files | Add `.is('deleted_at', null)` to queries |
| 2 - Hard to soft delete | 4 files | Convert `.delete()` to `.update({ deleted_at })` |
| 5 - Console.log | 1 file | Replace with logger utility |

**Total: 14 files to modify**

---

## Expected Results

After implementation:
- Deleted records no longer appear in lists, reports, or calculations
- Users can recover accidentally deleted expenses, invoices, and employees
- Consistent logging through the project's logger utility
- Cleaner production console output

