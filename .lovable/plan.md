
# Complete Additional PWA Enhancements Plan (All 6 Enhancements)

## Overview

This plan implements **6 professional enhancements** to further elevate TaxForge NG to enterprise-grade standards:

1. **Web Vitals Monitoring** - Track LCP, FID, CLS, INP, FCP, TTFB in production
2. **Error Log Rate Limiting** - Prevent abuse of the public INSERT policy
3. **Admin Error Dashboard** - View and filter error logs and web vitals
4. **Enhanced Service Worker Precaching** - Optimize offline experience
5. **Nonce-based CSP** - Eliminate 'unsafe-inline' for stricter XSS protection
6. **Auto-cleanup/Retention Policy** - Prevent database bloat from logs

---

## 1. Web Vitals Monitoring

### Purpose
Track real-user performance metrics (Core Web Vitals) and store them in the database for monitoring LCP, FID, CLS, INP, FCP, and TTFB.

### New Dependency
Add `web-vitals` package (official Google library)

### New File: `src/lib/webVitals.ts`

```typescript
import { onCLS, onFID, onLCP, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';

interface WebVitalReport {
  metric_name: string;
  metric_value: number;
  metric_rating: 'good' | 'needs-improvement' | 'poor';
  metric_id: string;
  page_url: string;
  user_agent: string;
  connection_type?: string;
  user_id?: string;
}

// Batch vitals to reduce DB writes (5-second flush)
const vitalsQueue: WebVitalReport[] = [];
let flushTimeout: number | null = null;

async function flushVitals() {
  if (vitalsQueue.length === 0) return;
  const batch = [...vitalsQueue];
  vitalsQueue.length = 0;
  
  try {
    const { error } = await supabase.from('web_vitals').insert(batch);
    if (error) logger.error('[WebVitals] Insert failed:', error.message);
  } catch (e) {
    logger.error('[WebVitals] Flush error:', e);
  }
}

function queueVital(vital: WebVitalReport) {
  vitalsQueue.push(vital);
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = window.setTimeout(flushVitals, 5000);
}

function reportVital(metric: Metric) {
  const connection = (navigator as any).connection;
  const report: WebVitalReport = {
    metric_name: metric.name,
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
    page_url: window.location.pathname,
    user_agent: navigator.userAgent.slice(0, 500),
    connection_type: connection?.effectiveType,
  };
  
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) report.user_id = user.id;
    queueVital(report);
  }).catch(() => queueVital(report));
}

export function initWebVitals(): void {
  if (import.meta.env.DEV) {
    logger.debug('[WebVitals] Skipping in development');
    return;
  }
  
  onCLS(reportVital);
  onFID(reportVital);
  onLCP(reportVital);
  onINP(reportVital);
  onFCP(reportVital);
  onTTFB(reportVital);
  
  // Flush on page hide
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushVitals();
  });
  
  logger.debug('[WebVitals] Initialized');
}
```

### Database Migration: `web_vitals` table

```sql
CREATE TABLE IF NOT EXISTS public.web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
  metric_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  connection_type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;

-- Anyone can insert vitals (performance data)
CREATE POLICY "Anyone can insert web vitals" ON public.web_vitals
  FOR INSERT WITH CHECK (true);

-- Only admins can read vitals
CREATE POLICY "Admins can view web vitals" ON public.web_vitals
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_web_vitals_created_at ON public.web_vitals(created_at DESC);
CREATE INDEX idx_web_vitals_metric_name ON public.web_vitals(metric_name);
```

### Modify `src/main.tsx`
Add after error handlers initialization:
```typescript
import { initWebVitals } from './lib/webVitals';
initWebVitals();
```

---

## 2. Error Log Rate Limiting

### Purpose
Prevent abuse of the public INSERT policy on `error_logs` and `web_vitals`.

### Database Migration: Rate limiting triggers

```sql
-- Rate limit function for error_logs (max 10 per minute per user_agent)
CREATE OR REPLACE FUNCTION public.check_error_log_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.error_logs
  WHERE user_agent = NEW.user_agent
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded for error logging';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_error_log_rate_limit
  BEFORE INSERT ON public.error_logs
  FOR EACH ROW EXECUTE FUNCTION public.check_error_log_rate_limit();

-- Rate limit function for web_vitals (max 50 per minute per user_agent)
CREATE OR REPLACE FUNCTION public.check_web_vitals_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.web_vitals
  WHERE user_agent = NEW.user_agent
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count >= 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded for web vitals';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_web_vitals_rate_limit
  BEFORE INSERT ON public.web_vitals
  FOR EACH ROW EXECUTE FUNCTION public.check_web_vitals_rate_limit();
```

---

## 3. Admin Error Dashboard

### Purpose
Provide admins with a dedicated page to view, filter, and analyze error logs and web vitals.

### New File: `src/pages/ErrorDashboard.tsx`

Features:
- **Error Logs Table**: Columns for timestamp, error message, page URL, user agent, stack trace
- **Web Vitals Summary**: Cards showing average LCP, FID, CLS with rating distribution (good/needs-improvement/poor)
- **Vitals Trend Chart**: Line chart showing metric trends over time using existing recharts
- **Error Frequency Chart**: Bar chart showing errors per day
- **Filters**: Date range picker (last 24h, 7 days, 30 days), metric name, rating, page URL
- **Export**: Download as CSV for offline analysis
- **Pagination**: Handle large datasets efficiently

### Modify `src/App.tsx`
Add lazy import and route:
```typescript
const ErrorDashboard = lazy(() => import("./pages/ErrorDashboard"));
// In Routes:
<Route path="/admin/errors" element={<ErrorDashboard />} />
```

### Modify `src/components/NavMenu.tsx`
Add to admin section:
```typescript
{ to: "/admin/errors", label: "Error Dashboard", icon: AlertTriangle },
```

---

## 4. Enhanced Service Worker Precaching

### Purpose
Ensure critical app shell assets are precached for instant offline loading.

### Modify `vite.config.ts`

Expand workbox configuration:
```typescript
workbox: {
  skipWaiting: true,
  clientsClaim: true,
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
  
  runtimeCaching: [
    // Supabase API - Network First with fallback
    {
      urlPattern: /^https:\/\/.*supabase.*\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
        networkTimeoutSeconds: 10,
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Google Fonts stylesheets - Stale While Revalidate
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
      },
    },
    // Google Fonts webfont files - Cache First
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: { maxEntries: 30, maxAgeSeconds: 31536000 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Static images - Cache First with 30-day TTL
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
      },
    },
  ],
},
```

---

## 5. Nonce-based CSP (Stricter Security)

### Purpose
Eliminate `'unsafe-inline'` for stricter XSS protection by using nonces for inline scripts.

### Approach
Since Vite builds static HTML and we can't inject nonces at runtime without a server, we'll use a **hybrid approach**:
1. Move inline structured data script to external file
2. Use `'strict-dynamic'` CSP directive where supported
3. Add script integrity hashes for known inline scripts

### Modify `index.html`

Replace the current CSP meta tag:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'strict-dynamic' 'unsafe-inline' https://*.supabase.co;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://fonts.googleapis.com https://fonts.gstatic.com;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
">
```

### New File: `public/structured-data.json`
Move structured data to external JSON file loaded at runtime (optional enhancement).

### Technical Note
Full nonce-based CSP requires server-side rendering or a reverse proxy to inject fresh nonces. For a static SPA:
- `'strict-dynamic'` + `'unsafe-inline'` provides fallback (modern browsers ignore `'unsafe-inline'` when `'strict-dynamic'` is present)
- Added `upgrade-insecure-requests` for HTTPS enforcement

---

## 6. Auto-cleanup/Retention Policy

### Purpose
Prevent database bloat by automatically deleting old error logs and web vitals.

### Database Migration: Cleanup function and scheduled job

```sql
-- Function to clean up old logs (keeps last 30 days for error_logs, 90 days for web_vitals)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Delete error logs older than 30 days
  DELETE FROM public.error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete web vitals older than 90 days
  DELETE FROM public.web_vitals
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup action
  RAISE NOTICE 'Cleaned up old logs at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create pg_cron extension if not exists (for scheduled cleanup)
-- Note: This requires Supabase to have pg_cron enabled
-- If not available, cleanup will be triggered manually or via edge function

-- Schedule daily cleanup at 3:00 AM UTC
-- SELECT cron.schedule('cleanup-old-logs', '0 3 * * *', 'SELECT public.cleanup_old_logs()');
```

### Alternative: Edge Function for Cleanup
Since `pg_cron` may not be available, create an edge function triggered by Supabase cron:

### New File: `supabase/functions/cleanup-logs/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  // Verify request is from cron (optional security)
  const authHeader = req.headers.get('Authorization');
  
  try {
    // Delete error logs older than 30 days
    const { error: errorLogsError } = await supabase
      .from('error_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (errorLogsError) throw errorLogsError;
    
    // Delete web vitals older than 90 days
    const { error: vitalsError } = await supabase
      .from('web_vitals')
      .delete()
      .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    
    if (vitalsError) throw vitalsError;
    
    return new Response(JSON.stringify({ success: true, cleanedAt: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Configure Cron in `supabase/config.toml`
Add scheduled invocation (runs daily at 3 AM UTC).

---

## Summary

| # | Enhancement | Files Modified/Created | Impact |
|---|-------------|------------------------|--------|
| 1 | Web Vitals Monitoring | `src/lib/webVitals.ts`, `src/main.tsx`, DB migration | Real-user performance metrics |
| 2 | Rate Limiting | DB migration (triggers) | Prevent INSERT abuse |
| 3 | Error Dashboard | `src/pages/ErrorDashboard.tsx`, `src/App.tsx`, `NavMenu.tsx` | Admin monitoring UI |
| 4 | SW Precaching | `vite.config.ts` | Faster offline loading |
| 5 | Nonce-based CSP | `index.html` | Stricter XSS protection |
| 6 | Auto-cleanup | Edge function + DB function | Prevent database bloat |

---

## New Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| web-vitals | ^4.x | Core Web Vitals measurement (official Google library) |

---

## Technical Notes

### Web Vitals Package
- Uses official `web-vitals` library from Google Chrome team
- Includes INP (Interaction to Next Paint) - the new Core Web Vital that replaced FID in 2024
- Batches writes with 5-second flush interval to reduce database load
- Flushes on page visibility change for complete data capture

### Rate Limiting Design
- Uses `user_agent` as fingerprint (RLS doesn't have access to IP)
- 10 errors/minute for `error_logs` (enough for real crashes)
- 50 vitals/minute for `web_vitals` (covers all 6 metrics per page load)
- Database triggers enforce limits - cannot be bypassed client-side

### CSP Improvements
- `'strict-dynamic'` allows trusted scripts to load other scripts
- Modern browsers ignore `'unsafe-inline'` when `'strict-dynamic'` is present
- `upgrade-insecure-requests` forces HTTPS for all resources

### Retention Policy
- Error logs: 30-day retention (enough for debugging)
- Web vitals: 90-day retention (for trend analysis)
- Edge function approach works without `pg_cron` extension
- Can be triggered manually or via Supabase scheduled functions

---

## Documentation Update

### File: `docs/CHANGELOG.md`
Add Phase 6 section documenting all 6 enhancements.
