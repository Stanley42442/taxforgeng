# TaxForge NG Enhancement Reference

This document serves as a living reference for all professional enhancements implemented and planned for TaxForge NG. It should be consulted and updated for future enhancement purposes.

---

## Implemented Enhancements

### Phase 6: Enterprise-Grade Production Standards (Completed January 2026)

#### 1. Web Vitals Monitoring

**Purpose**: Track real-user performance metrics (Core Web Vitals) for production monitoring.

**Implementation**:
- **File**: `src/lib/webVitals.ts`
- **Dependency**: `web-vitals` v5.x (official Google library)
- **Metrics Tracked**: LCP, CLS, INP, FCP, TTFB
- **Batching**: 5-second flush interval to reduce database writes
- **Table**: `public.web_vitals`

**Technical Details**:
```typescript
// Metrics are batched and flushed every 5 seconds
// Also flushes on page visibility change for complete data capture
// Skips in development mode to avoid polluting production data
```

**RLS Policy**: Admins can read; anyone can insert (rate-limited by trigger).

---

#### 2. Error Log Rate Limiting

**Purpose**: Prevent abuse of public INSERT policies on `error_logs` and `web_vitals`.

**Implementation**:
- **Database Triggers**: `enforce_error_log_rate_limit`, `enforce_web_vitals_rate_limit`
- **Limits**: 
  - Error logs: 10 per minute per `user_agent`
  - Web vitals: 50 per minute per `user_agent`

**Technical Details**:
```sql
-- Rate limiting uses user_agent as fingerprint (RLS doesn't have access to IP)
-- Triggers raise exception when limit exceeded
-- Cannot be bypassed client-side
```

**Security Note**: This mitigates potential DoS attacks on public INSERT policies.

---

#### 3. Admin Error Dashboard

**Purpose**: Provide admins with a dedicated page to view, filter, and analyze errors and performance.

**Implementation**:
- **File**: `src/pages/ErrorDashboard.tsx`
- **Route**: `/admin/errors`
- **Access**: Admin-only (uses `useAdminCheck` hook)

**Features**:
| Feature | Description |
|---------|-------------|
| Web Vitals Summary | Cards showing average LCP, CLS, INP with rating distribution |
| Error Logs Table | Paginated table with timestamp, message, page URL, stack trace |
| Vitals Trend Chart | Line chart showing metric trends over selected period |
| Date Range Filter | Last 24h, 7 days, 30 days |
| CSV Export | Download errors and vitals for offline analysis |
| Pagination | Efficient handling of large datasets |

**UI Components Used**: Recharts, Card, Table, Button, Select, Badge

---

#### 4. Enhanced Service Worker Precaching

**Purpose**: Optimize offline experience with intelligent caching strategies.

**Implementation**:
- **File**: `vite.config.ts` (workbox configuration)

**Caching Strategies**:
| Resource | Strategy | TTL | Notes |
|----------|----------|-----|-------|
| Supabase API | NetworkFirst | 24 hours | 10-second timeout fallback |
| Google Fonts (CSS) | StaleWhileRevalidate | 1 year | Quick updates |
| Google Fonts (WOFF2) | CacheFirst | 1 year | Immutable assets |
| Static Images | CacheFirst | 30 days | PNG, JPG, SVG, WebP |

**Configuration**:
```typescript
maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB limit
globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
```

---

#### 5. Nonce-based CSP (Stricter Security)

**Purpose**: Eliminate XSS attack vectors with strict Content Security Policy.

**Implementation**:
- **File**: `index.html`

**CSP Directives**:
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

**Key Security Features**:
- `'strict-dynamic'`: Modern browsers ignore `'unsafe-inline'` when this is present
- `upgrade-insecure-requests`: Forces HTTPS for all resources
- `frame-ancestors 'self'`: Prevents clickjacking

---

#### 6. Auto-cleanup/Retention Policy

**Purpose**: Prevent database bloat by automatically deleting old logs.

**Implementation**:
- **Edge Function**: `supabase/functions/cleanup-logs/index.ts`
- **Configuration**: `supabase/config.toml`

**Retention Policy**:
| Table | Retention | Rationale |
|-------|-----------|-----------|
| `error_logs` | 30 days | Sufficient for debugging |
| `web_vitals` | 90 days | Allows trend analysis |

**Scheduling** (Recommended):
```sql
-- Run daily at 3 AM UTC using pg_cron
SELECT cron.schedule(
  'cleanup-logs-daily',
  '0 3 * * *',
  $$SELECT net.http_post(
    url:='https://uhuxqrrtsiintcwpxxwy.supabase.co/functions/v1/cleanup-logs',
    headers:='{"Authorization": "Bearer <anon_key>"}'::jsonb
  )$$
);
```

---

## Planned Enhancements

### High Priority

#### 7. Automated Cleanup Cron Job
**Status**: Pending
**Priority**: High
**Description**: Schedule the `cleanup-logs` edge function to run daily at 3 AM UTC.
**Implementation**: Use `pg_cron` extension with `supabase--insert` tool.

#### 8. Real-time Error Streaming
**Status**: Planned
**Priority**: Medium
**Description**: Add real-time updates to the Error Dashboard using Supabase Realtime subscriptions.
**Benefits**: Live monitoring without manual refresh.

#### 9. Error Grouping & Deduplication
**Status**: Planned
**Priority**: Medium
**Description**: Group similar errors by message pattern, showing occurrence count.
**Benefits**: Reduces noise, highlights systemic issues.

### Medium Priority

#### 10. Performance Budget Alerts
**Status**: Proposed
**Description**: Trigger alerts when Core Web Vitals exceed thresholds.
**Thresholds**:
- LCP > 2500ms (needs improvement)
- CLS > 0.1 (needs improvement)
- INP > 200ms (needs improvement)

#### 11. User Session Recording
**Status**: Proposed
**Description**: Record user sessions for replay during error investigation.
**Considerations**: Privacy compliance, storage costs.

#### 12. A/B Testing Infrastructure
**Status**: Proposed
**Description**: Framework for feature flag-based A/B testing.
**Components**: Feature flags table, percentage-based rollout logic.

### Low Priority (Future Considerations)

#### 13. Synthetic Monitoring
**Description**: Automated tests that simulate user journeys in production.

#### 14. Error Correlation
**Description**: Link errors to specific deployments/commits.

#### 15. Custom Alerting Rules
**Description**: User-defined rules for error notifications.

---

## Enhancement Guidelines

### Adding New Enhancements

1. **Document First**: Add entry to this file before implementation
2. **Security Review**: Consider RLS, rate limiting, input validation
3. **Performance Impact**: Measure before and after
4. **Test Coverage**: Add tests for new functionality
5. **Changelog**: Update `docs/CHANGELOG.md`

### Enhancement Categories

| Category | Description | Examples |
|----------|-------------|----------|
| Security | Protect data and prevent attacks | CSP, rate limiting, RLS |
| Performance | Improve speed and efficiency | Caching, lazy loading, batching |
| Observability | Monitor and debug | Web vitals, error tracking |
| UX | Improve user experience | Offline support, PWA features |
| DevOps | Improve development workflow | CI/CD, automated testing |

### Quality Checklist

- [ ] RLS policies reviewed
- [ ] Rate limiting considered
- [ ] Error handling implemented
- [ ] Logging added (using `logger.ts`)
- [ ] Tests written
- [ ] Documentation updated
- [ ] Changelog entry added

---

## Technical Debt & Known Issues

### Current Technical Debt

1. **React 19 Upgrade**: Pending (breaking changes require migration plan)
2. **CSP Nonce Server-Side**: Full nonce-based CSP requires SSR
3. **pg_cron Setup**: Cleanup cron job not yet automated

### Resolved Issues

| Issue | Resolution | Date |
|-------|------------|------|
| Public INSERT policies abuse | Rate limiting triggers | Jan 2026 |
| No performance monitoring | Web Vitals integration | Jan 2026 |
| Database bloat risk | Auto-cleanup function | Jan 2026 |

---

## References

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [VitePWA Workbox](https://vite-pwa-org.netlify.app/workbox/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

*Last Updated: January 2026*
*Maintainer: TaxForge NG Development Team*
