

## Fix: Wire Up the AuthLoadingScreen Component

### Problem
The `AuthLoadingScreen` component was updated with the new branded design (logo, lava lamp background, dual-ring spinner) but it is **not imported or rendered anywhere** in the app. It's an orphaned component — the loading screen you see is just the default `PageLoader` skeleton from the `Suspense` fallback.

### Solution
Wrap the app content inside `AuthLoadingScreen` so the branded splash displays while the auth session initializes.

### Implementation

**File: `src/App.tsx`**

1. Import `AuthLoadingScreen` from `@/components/AuthLoadingScreen`
2. Wrap the content inside `<AuthProvider>` with `<AuthLoadingScreen>` so it shows the branded splash while `useAuth()` reports `loading: true`

The wrapper goes right after `<AuthProvider>` and before `<SubscriptionProvider>`:

```text
<AuthProvider>
  <AuthLoadingScreen>        ← NEW
    <SubscriptionProvider>
      ...rest of app...
    </SubscriptionProvider>
  </AuthLoadingScreen>       ← NEW
</AuthProvider>
```

This is the only change needed — the component already has the full branded UI with logo, lava lamp background, spinner, and exit animations.

