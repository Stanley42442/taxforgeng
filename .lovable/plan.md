

# Complete Professional PWA Enhancements Plan

## Overview

This plan implements **5 professional enhancements** to elevate TaxForge NG to production-grade standards: security hardening, performance optimization, better install UX, skeleton loading states, and production error tracking.

---

## 1. Content Security Policy (CSP) Headers

### Purpose
Protect against XSS attacks, clickjacking, and code injection vulnerabilities.

### File: `index.html`

Add security meta tags after the viewport meta tag:

```html
<!-- Security Headers -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://fonts.googleapis.com https://fonts.gstatic.com;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
```

### Security Benefits
| Directive | Protection |
|-----------|------------|
| `default-src 'self'` | Block all external content by default |
| `script-src` | Prevent XSS via unauthorized scripts |
| `frame-ancestors 'self'` | Prevent clickjacking attacks |
| `X-Content-Type-Options` | Prevent MIME-type sniffing |
| `Permissions-Policy` | Disable unused browser APIs |

---

## 2. Resource Preloading for Performance

### Purpose
Reduce First Contentful Paint (FCP) and Largest Contentful Paint (LCP) by ~300-800ms through early resource hints.

### File: `index.html`

Add resource hints before the PWA manifest:

```html
<!-- Critical Resource Preloading -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://uhuxqrrtsiintcwpxxwy.supabase.co" crossorigin>
<link rel="dns-prefetch" href="https://api.paystack.co">

<!-- Non-blocking font loading -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap"></noscript>
```

### Performance Impact
| Optimization | Time Saved |
|--------------|-----------|
| `preconnect` to Supabase | ~200-400ms (DNS+TCP+TLS) |
| `preconnect` to fonts | ~150-300ms |
| `dns-prefetch` to Paystack | ~50-100ms |
| Non-blocking font load | Eliminates render blocking |

---

## 3. Enhanced PWA Install Banner

### Purpose
Create a professional, platform-aware install prompt with iOS-specific instructions (since iOS doesn't support `beforeinstallprompt`).

### File: `src/components/InstallPWAPrompt.tsx` (complete rewrite)

### New Features
1. **Platform Detection**: Identify iOS Safari, Android Chrome, and Desktop
2. **iOS Manual Instructions**: Step-by-step guide with Share icon visual
3. **Animated Entry**: Framer Motion slide-up with fade
4. **App Icon Preview**: Display the actual app icon in the prompt
5. **"Remind Me Later"**: 7-day snooze option
6. **Already Installed Detection**: Hide prompt for PWA sessions

### Component Structure

```typescript
const InstallPWAPrompt = () => {
  // States for platform detection
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Detect platform and standalone mode on mount
  useEffect(() => {
    // Check if already running as PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    // Detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    setPlatform(isIOS ? 'ios' : isAndroid ? 'android' : 'desktop');
    setIsStandalone(isInStandaloneMode);
  }, []);
  
  // For iOS: Show manual instructions with Share icon
  // For Android/Desktop: Use beforeinstallprompt API
};
```

### iOS-Specific UI
```text
+------------------------------------------+
|  [App Icon]  Install TaxForge NG         |
|                                          |
|  To install this app on your iPhone:     |
|                                          |
|  1. Tap the Share button [↑]             |
|  2. Scroll down and tap                  |
|     "Add to Home Screen"                 |
|  3. Tap "Add" to confirm                 |
|                                          |
|  [Got it]  [Remind me later]             |
+------------------------------------------+
```

---

## 4. Expanded Skeleton Loading States

### Purpose
Replace spinning loaders with content-shaped skeletons for a more polished perceived performance experience.

### Files to Modify

#### 4a. `src/App.tsx` - Enhanced PageLoader

Replace the generic spinner with a context-aware skeleton:

```typescript
const PageLoader = () => (
  <div className="min-h-screen p-6 animate-fade-in">
    <PageSkeleton />
  </div>
);
```

#### 4b. `src/components/ui/premium-skeleton.tsx` - New Skeleton Variants

Add specialized skeletons:

```typescript
// Dashboard-specific skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

// Expenses page skeleton
export function ExpensesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <PremiumSkeleton variant="text" className="h-8 w-40" />
        <PremiumSkeleton variant="button" className="h-10 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Calculator skeleton
export function CalculatorSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <FormSkeleton />
    </div>
  );
}
```

---

## 5. Error Tracking Integration

### Purpose
Capture production errors for monitoring and debugging without relying on user bug reports.

### Approach
Since we don't want to require external API keys, we'll implement a **lightweight error tracking system** that:
1. Captures errors from the existing ErrorBoundary
2. Logs errors to the Supabase database (using existing backend)
3. Provides an admin view for error monitoring

### Files to Create/Modify

#### 5a. New File: `src/lib/errorTracking.ts`

```typescript
import { supabase } from "@/integrations/supabase/client";
import logger from "@/lib/logger";
import { sanitizeErrorForDisplay, getErrorMessage } from "@/lib/errorUtils";

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
}

// Debounce to prevent error flooding
let lastErrorTime = 0;
const ERROR_THROTTLE_MS = 5000;

export async function reportError(error: Error, componentStack?: string): Promise<void> {
  const now = Date.now();
  if (now - lastErrorTime < ERROR_THROTTLE_MS) {
    logger.debug('[ErrorTracking] Throttled duplicate error');
    return;
  }
  lastErrorTime = now;

  const report: ErrorReport = {
    message: sanitizeErrorForDisplay(error),
    stack: error.stack?.slice(0, 1000), // Limit stack trace size
    componentStack: componentStack?.slice(0, 500),
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      report.userId = user.id;
    }
  } catch {
    // Ignore auth errors during error reporting
  }

  // Log to console in development, send to database in production
  if (import.meta.env.DEV) {
    logger.error('[ErrorTracking] Would report:', report);
    return;
  }

  try {
    await supabase.from('error_logs').insert({
      error_message: report.message,
      error_stack: report.stack,
      component_stack: report.componentStack,
      page_url: report.url,
      user_agent: report.userAgent,
      user_id: report.userId,
    });
  } catch (e) {
    logger.error('[ErrorTracking] Failed to report error:', getErrorMessage(e));
  }
}

// Global error handler for unhandled promise rejections
export function initGlobalErrorHandlers(): void {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    reportError(error);
  });

  window.addEventListener('error', (event) => {
    if (event.error) {
      reportError(event.error);
    }
  });
}
```

#### 5b. Database Migration: `error_logs` table

```sql
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  page_url TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only admins can read error logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view error logs" ON error_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can insert (errors need to be logged before auth check)
CREATE POLICY "Anyone can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
```

#### 5c. Modify `src/components/ErrorBoundary.tsx`

Add error reporting to the componentDidCatch:

```typescript
import { reportError } from "@/lib/errorTracking";

public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  logger.error("ErrorBoundary caught an error:", error, errorInfo);
  this.setState({ errorInfo });
  
  // Report to tracking system
  reportError(error, errorInfo.componentStack);
  
  this.props.onError?.(error, errorInfo);
}
```

#### 5d. Modify `src/main.tsx`

Initialize global error handlers:

```typescript
import { initGlobalErrorHandlers } from "@/lib/errorTracking";

// Initialize error tracking
initGlobalErrorHandlers();
```

---

## 6. Documentation Update

### File: `docs/CHANGELOG.md`

Add Phase 5 section documenting all enhancements.

---

## Summary

| Enhancement | Files Modified | Impact |
|-------------|----------------|--------|
| CSP Headers | `index.html` | XSS/Clickjacking protection |
| Resource Preloading | `index.html` | ~300-800ms faster load |
| Install Banner | `InstallPWAPrompt.tsx` | iOS support, better UX |
| Skeleton Loading | `App.tsx`, `premium-skeleton.tsx` | Smoother perceived loading |
| Error Tracking | New files + migrations | Production monitoring |
| Documentation | `CHANGELOG.md` | Audit trail |

---

## Technical Notes

### CSP Considerations
- `'unsafe-inline'` required for Vite HMR and Tailwind dynamic styles
- `'unsafe-eval'` needed for some charting libraries (Recharts)
- Can be tightened with nonce-based CSP in the future

### iOS PWA Limitations
- No `beforeinstallprompt` API - requires manual instructions
- Must detect iOS Safari specifically
- Safari on iOS has different PWA capabilities than Chrome

### Error Tracking Design
- Uses existing Supabase backend - no external API key needed
- Throttled to prevent flooding (5-second debounce)
- Sanitizes error messages to avoid exposing sensitive paths
- Separate admin-only viewing policy

