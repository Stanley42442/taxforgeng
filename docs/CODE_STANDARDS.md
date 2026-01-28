# TaxForge NG - Code Standards

This document defines the coding standards and patterns used in TaxForge NG.

---

## Table of Contents

1. [Error Handling](#error-handling)
2. [Logging](#logging)
3. [Storage Access](#storage-access)
4. [Number Parsing](#number-parsing)
5. [Database Queries](#database-queries)
6. [Component Patterns](#component-patterns)
7. [TypeScript Guidelines](#typescript-guidelines)
8. [Styling](#styling)

---

## Error Handling

### Typed Catch Blocks

Always type catch blocks as `unknown`:

```typescript
// ❌ Bad - implicit any
try {
  await operation();
} catch (error) {
  console.log(error.message);
}

// ✅ Good - typed unknown
try {
  await operation();
} catch (error: unknown) {
  const message = getErrorMessage(error);
  logger.error('Failed:', message);
}
```

### Error Message Extraction

Use the utility function for consistent error messages:

```typescript
import { getErrorMessage } from '@/lib/errorUtils';

catch (error: unknown) {
  const message = getErrorMessage(error);
  toast.error(message);
}
```

### User-Facing Errors

Always provide actionable error messages:

```typescript
// ❌ Bad
toast.error('Error occurred');

// ✅ Good
toast.error('Failed to save business. Please try again.');
```

---

## Logging

### Use Logger, Not Console

```typescript
import logger from '@/lib/logger';

// ❌ Bad
console.log('Debug info');
console.error('Something failed');

// ✅ Good
logger.debug('Debug info');
logger.error('Something failed:', error);
```

### Log Levels

| Level | Use Case | Production |
|-------|----------|------------|
| `debug` | Development details | Hidden |
| `info` | General information | Hidden |
| `warn` | Potential issues | Hidden |
| `error` | Actual errors | Visible |

### Structured Logging

Include context in log messages:

```typescript
logger.error('Payment failed:', { 
  userId: user.id, 
  amount, 
  error: getErrorMessage(error) 
});
```

---

## Storage Access

### Always Use Safe Wrappers

```typescript
import { safeLocalStorage, safeSessionStorage } from '@/lib/safeStorage';

// ❌ Bad - can throw
localStorage.setItem('key', 'value');
const data = JSON.parse(localStorage.getItem('key'));

// ✅ Good - safe
safeLocalStorage.setItem('key', 'value');
const data = safeLocalStorage.getJSON('key', defaultValue);
```

### Available Methods

```typescript
safeLocalStorage.getItem(key);           // Returns string | null
safeLocalStorage.setItem(key, value);    // Returns boolean (success)
safeLocalStorage.removeItem(key);        // Returns boolean (success)
safeLocalStorage.getJSON(key, default);  // Returns parsed JSON or default
safeLocalStorage.setJSON(key, value);    // Returns boolean (success)
```

### When Direct Access Is Acceptable

Only use direct localStorage when:
1. Already inside a try-catch block
2. Matching exact Supabase token keys
3. In bootstrap code (main.tsx) with error handling

---

## Number Parsing

### Always Specify Radix

```typescript
// ❌ Bad - implicit radix
parseInt(value);
parseInt(someString);

// ✅ Good - explicit radix
parseInt(value, 10);
parseInt(someString, 10);
```

### Why This Matters

Without radix, strings starting with `0` may be parsed as octal:
- `parseInt('08')` → `0` (octal parse fails, returns 0)
- `parseInt('08', 10)` → `8` (correct)

---

## Database Queries

### Use maybeSingle for Optional Data

```typescript
// ❌ Bad - throws if no record exists
const { data } = await supabase
  .from('profiles')
  .select()
  .eq('id', userId)
  .single();

// ✅ Good - returns null if not found
const { data } = await supabase
  .from('profiles')
  .select()
  .eq('id', userId)
  .maybeSingle();
```

### Soft Delete Pattern

Always filter by `deleted_at`:

```typescript
const { data } = await supabase
  .from('businesses')
  .select('*')
  .is('deleted_at', null);  // Only active records
```

### Parallel Queries

Use Promise.all for independent queries:

```typescript
// ❌ Bad - sequential
const { data: profile } = await supabase.from('profiles')...;
const { data: business } = await supabase.from('businesses')...;
const { data: expenses } = await supabase.from('expenses')...;

// ✅ Good - parallel
const [profileRes, businessRes, expensesRes] = await Promise.all([
  supabase.from('profiles')...,
  supabase.from('businesses')...,
  supabase.from('expenses')...,
]);
```

---

## Component Patterns

### Lazy Route Error Boundary

Wrap all lazy-loaded routes:

```typescript
import { LazyRouteErrorBoundary } from '@/components/LazyRouteErrorBoundary';

<Route 
  path="/page" 
  element={
    <LazyRouteErrorBoundary>
      <Suspense fallback={<Loading />}>
        <LazyPage />
      </Suspense>
    </LazyRouteErrorBoundary>
  } 
/>
```

### Loading States

Always provide loading feedback:

```typescript
if (loading) {
  return <PremiumSkeleton lines={5} />;
}
```

### Empty States

Handle empty data gracefully:

```typescript
if (data.length === 0) {
  return <EmptyState 
    icon={FileText}
    title="No invoices yet"
    description="Create your first invoice to get started"
  />;
}
```

---

## TypeScript Guidelines

### Prefer Type over Interface for Props

```typescript
// ✅ Preferred
type ButtonProps = {
  variant: 'primary' | 'secondary';
  onClick: () => void;
};

// Also acceptable
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
}
```

### Export Types Explicitly

```typescript
// ❌ Bad
export { MyComponent };
type Props = {...};

// ✅ Good
export type { Props };
export { MyComponent };
```

### Use Const Assertions

```typescript
const TIERS = ['free', 'starter', 'basic', 'professional'] as const;
type Tier = typeof TIERS[number];
```

---

## Styling

### Use Design System Tokens

```typescript
// ❌ Bad - hardcoded colors
<div className="bg-purple-500 text-white">

// ✅ Good - semantic tokens
<div className="bg-primary text-primary-foreground">
```

### Responsive Design

Use Tailwind breakpoints consistently:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Animation

Use Framer Motion for complex animations:

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
```

Use Tailwind for simple animations:

```typescript
<div className="animate-fade-in">
```

---

## Checklist for New Code

- [ ] Error handling uses `catch (error: unknown)`
- [ ] Logging uses `logger.*` not `console.*`
- [ ] Storage uses `safeLocalStorage` wrapper
- [ ] `parseInt` has radix parameter
- [ ] Optional queries use `.maybeSingle()`
- [ ] Lazy routes have error boundary
- [ ] Colors use design tokens
- [ ] Loading and empty states handled
