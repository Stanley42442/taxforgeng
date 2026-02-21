

## Switch Paystack to Live Mode

### Step 1: Update Your Paystack Secret Keys

You'll be prompted to enter your **live** Paystack keys (found in your Paystack Dashboard under Settings > API Keys & Webhooks > Live tab):

- **PAYSTACK_SECRET_KEY** -- replace with your `sk_live_...` key
- **PAYSTACK_PUBLIC_KEY** -- replace with your `pk_live_...` key

No code changes are needed for the backend functions -- they already read these secrets dynamically.

### Step 2: Remove "Test Mode" Label from E-Filing Page

The payment dialog in `src/pages/EFiling.tsx` (line 391) currently says:

> "Complete payment via Paystack (Test Mode)"

This will be updated to:

> "Complete payment via Paystack"

### Step 3: Configure Your Paystack Webhook (Manual Step)

In your **Paystack Dashboard** (Live mode), set the webhook URL to:

```
https://uhuxqrrtsiintcwpxxwy.supabase.co/functions/v1/paystack-webhook
```

This ensures Paystack sends live payment confirmations to your backend.

---

### What Does NOT Change

- **TierSwitcher "Test Mode"** -- This is an internal admin/dev tool for simulating subscription tiers, unrelated to Paystack. It stays as-is.
- **Embed "Sandbox"** -- This refers to the API-key-free demo widget, not Paystack. It stays as-is.
- **All edge functions** (`paystack-initialize`, `paystack-verify`, `paystack-webhook`, etc.) -- These already use the secrets dynamically, so swapping the secret values is all that's needed.

### Summary of Changes

| What | Action |
|---|---|
| `PAYSTACK_SECRET_KEY` secret | Replace with `sk_live_...` |
| `PAYSTACK_PUBLIC_KEY` secret | Replace with `pk_live_...` |
| `src/pages/EFiling.tsx` line 391 | Remove "(Test Mode)" from dialog text |
| Paystack Dashboard webhook URL | Set manually to your backend webhook endpoint |

