
# Plan: Implement Soft Delete with Cascade for Businesses

## Overview
This plan implements a soft delete system for businesses where deleting a business will also soft-delete all related data (expenses, employees, invoices, etc.). Users can restore a deleted business within a configurable time window, which also restores all associated data. Account deletion remains permanent with no restore option.

## Technical Approach

### Database Changes

#### 1. Add `deleted_at` Column to All Relevant Tables

We need to add a nullable `deleted_at` timestamp column to the following tables:
- `businesses` (primary)
- `audit_logs`
- `clients`
- `compliance_items`
- `employees`
- `expenses`
- `invoices`
- `payroll_runs`
- `payroll_templates`
- `reminders`
- `remittance_reminders`
- `tax_calculations`

```sql
-- Add deleted_at to businesses table
ALTER TABLE public.businesses 
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add deleted_at to related tables
ALTER TABLE public.expenses ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.employees ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.invoices ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.clients ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.compliance_items ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.payroll_runs ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.payroll_templates ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.reminders ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.remittance_reminders ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.tax_calculations ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.audit_logs ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
```

#### 2. Create Database Functions for Soft Delete and Restore

**Soft Delete Business Function:**
```sql
CREATE OR REPLACE FUNCTION public.soft_delete_business(business_uuid UUID, deleting_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deletion_time TIMESTAMPTZ := now();
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_uuid AND user_id = deleting_user_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Business not found or not owned by user';
  END IF;

  -- Soft delete the business
  UPDATE businesses SET deleted_at = deletion_time WHERE id = business_uuid;
  
  -- Cascade soft delete to related tables
  UPDATE expenses SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE employees SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE invoices SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE clients SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE compliance_items SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE payroll_runs SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE payroll_templates SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE reminders SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE remittance_reminders SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE tax_calculations SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
  UPDATE audit_logs SET deleted_at = deletion_time WHERE business_id = business_uuid AND deleted_at IS NULL;
END;
$$;
```

**Restore Business Function:**
```sql
CREATE OR REPLACE FUNCTION public.restore_business(business_uuid UUID, restoring_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  business_deleted_at TIMESTAMPTZ;
BEGIN
  -- Get the business's deleted_at timestamp and verify ownership
  SELECT deleted_at INTO business_deleted_at
  FROM businesses 
  WHERE id = business_uuid AND user_id = restoring_user_id AND deleted_at IS NOT NULL;
  
  IF business_deleted_at IS NULL THEN
    RAISE EXCEPTION 'Business not found, not deleted, or not owned by user';
  END IF;

  -- Restore the business
  UPDATE businesses SET deleted_at = NULL WHERE id = business_uuid;
  
  -- Restore all related records that were deleted at the same time
  UPDATE expenses SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE employees SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE invoices SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE clients SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE compliance_items SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE payroll_runs SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE payroll_templates SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE reminders SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE remittance_reminders SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE tax_calculations SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
  UPDATE audit_logs SET deleted_at = NULL WHERE business_id = business_uuid AND deleted_at = business_deleted_at;
END;
$$;
```

**Permanently Delete Old Soft-Deleted Businesses Function (cleanup):**
```sql
CREATE OR REPLACE FUNCTION public.cleanup_deleted_businesses(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cutoff_date TIMESTAMPTZ := now() - (retention_days || ' days')::interval;
  deleted_count INTEGER;
BEGIN
  -- Get count before deletion
  SELECT COUNT(*) INTO deleted_count FROM businesses WHERE deleted_at < cutoff_date;
  
  -- Delete from child tables first (due to foreign keys)
  DELETE FROM audit_logs WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM expenses WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM invoices WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM clients WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM compliance_items WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM payroll_runs WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM payroll_templates WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM reminders WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM remittance_reminders WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM tax_calculations WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  DELETE FROM employees WHERE business_id IN (SELECT id FROM businesses WHERE deleted_at < cutoff_date);
  
  -- Finally delete the businesses
  DELETE FROM businesses WHERE deleted_at < cutoff_date;
  
  RETURN deleted_count;
END;
$$;
```

#### 3. Update RLS Policies

Add `deleted_at IS NULL` filter to existing SELECT policies to hide soft-deleted records:

```sql
-- Update businesses RLS policy
DROP POLICY IF EXISTS "Users can view own businesses" ON businesses;
CREATE POLICY "Users can view own businesses"
ON businesses FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Similar updates for all other tables with business_id...
```

---

### Frontend Changes

#### 1. Update `src/contexts/SubscriptionContext.tsx`

Modify the `removeBusiness` function to call the soft delete database function:

```typescript
const removeBusiness = async (id: string) => {
  if (!user) return;

  // Call the soft delete database function
  const { error } = await supabase.rpc('soft_delete_business', {
    business_uuid: id,
    deleting_user_id: user.id
  });

  if (error) {
    console.error('Error soft-deleting business:', error);
    throw error;
  }

  setState(prev => ({
    ...prev,
    savedBusinesses: prev.savedBusinesses.filter(b => b.id !== id),
    businessCount: Math.max(0, prev.businessCount - 1),
  }));
};
```

Add a new `restoreBusiness` function:

```typescript
const restoreBusiness = async (id: string) => {
  if (!user) return;

  const { error } = await supabase.rpc('restore_business', {
    business_uuid: id,
    restoring_user_id: user.id
  });

  if (error) {
    console.error('Error restoring business:', error);
    throw error;
  }

  // Refresh businesses to get the restored one
  await refreshBusinesses();
};
```

Add a function to get deleted businesses:

```typescript
const getDeletedBusinesses = async (): Promise<SavedBusiness[]> => {
  if (!user) return [];

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  return (businesses || []).map(b => ({
    id: b.id,
    name: b.name,
    entityType: b.entity_type as 'company' | 'business_name',
    turnover: Number(b.turnover),
    createdAt: new Date(b.created_at),
    deletedAt: new Date(b.deleted_at),
    // ...other fields
  }));
};
```

#### 2. Update `src/hooks/useDeleteWithUndo.ts`

Enhance to support the restore flow with cascade behavior:

```typescript
const deleteWithUndo = useDeleteWithUndo<SavedBusiness>({
  onDelete: async (business) => {
    await removeBusiness(business.id);
  },
  onRestore: async (business) => {
    await restoreBusiness(business.id);
  },
  getSuccessMessage: (business) => `"${business.name}" and all related data moved to trash`,
  getItemName: (business) => business.name,
  undoDuration: 10000, // 10 seconds to undo
});
```

#### 3. Add "Deleted Businesses" Section in SavedBusinesses Page

Add a collapsible section showing recently deleted businesses with restore option:

```typescript
// In SavedBusinesses.tsx
const [deletedBusinesses, setDeletedBusinesses] = useState<SavedBusiness[]>([]);
const [showDeleted, setShowDeleted] = useState(false);

// Fetch deleted businesses
useEffect(() => {
  if (user) {
    getDeletedBusinesses().then(setDeletedBusinesses);
  }
}, [user]);

// UI: Collapsible "Recently Deleted" section
{deletedBusinesses.length > 0 && (
  <Collapsible open={showDeleted} onOpenChange={setShowDeleted}>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" className="w-full justify-between">
        <span className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Recently Deleted ({deletedBusinesses.length})
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", showDeleted && "rotate-180")} />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      {/* List of deleted businesses with Restore button */}
    </CollapsibleContent>
  </Collapsible>
)}
```

#### 4. Update Delete Confirmation Dialog

Update the message to clarify that related data will also be deleted:

```typescript
<DeleteConfirmationDialog
  open={deleteWithUndo.showDialog}
  onOpenChange={(open) => !open && deleteWithUndo.cancelDelete()}
  onConfirm={deleteWithUndo.confirmDelete}
  title="Delete Business"
  description={`Are you sure you want to delete "${deleteWithUndo.itemToDelete?.name}"? This will also delete all related expenses, invoices, employees, reminders, and other data. You can restore this business within 30 days.`}
  itemName={deleteWithUndo.itemToDelete?.name}
/>
```

---

### Data Cleanup (Optional Background Job)

A scheduled job can be set up to permanently delete businesses that have been soft-deleted for more than 30 days:

```sql
-- Can be called via a cron job or Supabase scheduled function
SELECT cleanup_deleted_businesses(30);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| **Database Migration** | Add `deleted_at` columns, create functions, update RLS policies |
| `src/contexts/SubscriptionContext.tsx` | Update `removeBusiness`, add `restoreBusiness`, add `getDeletedBusinesses` |
| `src/pages/SavedBusinesses.tsx` | Add "Recently Deleted" section with restore functionality |
| `src/components/DeleteConfirmationDialog.tsx` | Update default description to mention cascade delete |
| `src/hooks/useDeleteWithUndo.ts` | Add onRestore handler support for database restoration |

---

## User Experience Flow

1. **Delete Business**: User clicks delete → Confirmation dialog explains cascade → User confirms → Business and all related data soft-deleted → Toast with "Undo" button appears
2. **Undo (within 10 seconds)**: User clicks Undo → Business and all related data restored immediately
3. **Restore (within 30 days)**: User goes to "Recently Deleted" section → Clicks "Restore" → Business and all data restored
4. **Permanent deletion**: After 30 days, cleanup job permanently removes the data
5. **Account deletion**: All user data (including soft-deleted) is permanently removed with no restore option

---

## Testing Checklist

1. Delete a business with expenses, invoices, and employees attached
2. Verify all related data is hidden from the UI
3. Click "Undo" within timeout and verify everything is restored
4. Delete again and wait for timeout to pass
5. Verify "Recently Deleted" shows the business
6. Click "Restore" and verify all data comes back
7. Test that account deletion permanently removes everything
