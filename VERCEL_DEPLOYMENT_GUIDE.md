# Vercel Deployment Guide

## Quick Start

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

---

## Pre-Deployment Checklist

### 1. Security Review

- ✅ **Secrets Management**
  - Never commit `.env` file
  - Use Vercel dashboard for environment variables
  - Rotate all credentials before production
  - Use separate credentials for staging/production

- ✅ **Input Validation**
  - All user inputs are validated with Zod
  - HTML content is sanitized with DOMPurify
  - SQL queries use parameterized statements

- ✅ **Authentication**
  - Role-based access control implemented
  - Admin endpoints require `admin` or `super_admin` role
  - JWT tokens validated on every request
  - Session timeout configured

- ✅ **Database Security**
  - Row Level Security (RLS) enabled
  - Connection pooling configured
  - Encrypted connections only (SSL/TLS)
  - Regular backups enabled

### 2. Performance Optimization

- ✅ **Bundle Size**
  ```bash
  bun run build:analyze
  ```
  - Target: < 500KB gzipped
  - Remove unused dependencies
  - Code splitting enabled for routes

- ✅ **Caching Strategy**
  - Static assets: 1 year cache
  - HTML: no-cache (must revalidate)
  - API responses: 5 minutes memory cache
  - Browser: LocalStorage for user data

- ✅ **Image Optimization**
  - Use WebP format when possible
  - Responsive images with srcset
  - Lazy loading for off-screen images
  - CDN delivery via Supabase Storage

- ✅ **Core Web Vitals Targets**
  - FCP (First Contentful Paint): < 1.5s
  - LCP (Largest Contentful Paint): < 2.5s
  - CLS (Cumulative Layout Shift): < 0.1
  - TTFB (Time to First Byte): < 600ms

### 3. Environment Variables Setup

Add these to Vercel project settings:

**Public Variables (visible to client)**:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_PUBLIC_SUPABASE_ANON_KEY=your_key
VITE_ENABLE_ANALYTICS=true
```

**Secret Variables (server-only)**:
```
SUPABASE_SERVICE_ROLE_KEY=your_secret_key
SUPABASE_JWT_SECRET=your_jwt_secret
POSTGRES_PRISMA_URL=postgresql://...?pgbouncer=true
```

### 4. Build Configuration

The `vercel.json` configuration includes:
- Optimal build command: `bun run build`
- Region distribution: iad1, sfo1, hnd1, sin1
- Security headers configured
- Cache headers optimized

### 5. Monitoring Setup

**Enable these in Vercel Dashboard**:
- Web Analytics: Auto-tracks Core Web Vitals
- Error Reporting: Captures deployment errors
- Real-time Logs: Monitor production issues

---

## Deployment Steps

### Step 1: Local Testing

```bash
# Type check
bun run type-check

# Lint code
bun run lint

# Run tests
bun run test

# Build and preview locally
bun run prod
```

### Step 2: Set Environment Variables

Go to Vercel Dashboard > Project Settings > Environment Variables

### Step 3: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 4: Verify Deployment

```bash
# Check deployment status
vercel list

# View logs
vercel logs --prod

# Check environment variables
vercel env ls
```

---

## Performance Optimization

### 1. Database Connection Pooling

Supabase provides connection pooling via PgBouncer:

```env
# Use this URL for application connections (pooled)
POSTGRES_PRISMA_URL=postgresql://user:password@pooler.supabase.co:6543/postgres?pgbouncer=true

# Use this URL for migrations (non-pooled)
POSTGRES_URL_NON_POOLING=postgresql://user:password@db.supabase.co:5432/postgres
```

### 2. API Response Caching

The app uses a 3-tier caching strategy:

```
Browser Cache (1 year for static assets)
    ↓
Memory Cache (5 minutes for API responses)
    ↓
LocalStorage (persistent user data)
    ↓
Supabase Database
```

### 3. Code Splitting

Routes are automatically code-split for faster initial load:

```typescript
// Routes load only when accessed
<Route path="/admin" element={<Admin />} />
```

### 4. Image Optimization

Always use optimized images:

```typescript
<img
  src="image.webp"
  srcSet="image-small.webp 400w, image-large.webp 1600w"
  alt="Description"
  loading="lazy"
/>
```

---

## Monitoring & Troubleshooting

### Monitor Performance

```bash
# Run Lighthouse audit
bun run perf:lighthouse

# Check bundle size
bun run build:analyze
```

### Common Issues

#### Issue: Build Timeout
```
Solution: Increase build timeout in vercel.json
  "buildCommand": "bun run build --mode production"
```

#### Issue: Database Connection Errors
```
Solution: Enable connection pooling
  POSTGRES_PRISMA_URL=...?pgbouncer=true
```

#### Issue: Memory Limit Exceeded
```
Solution: Optimize bundle size
  - Remove unused dependencies
  - Enable code splitting
  - Compress images
```

#### Issue: Slow API Responses
```
Solution: Enable caching
  - Configure cache headers
  - Use memory cache for repeated queries
  - Enable database query optimization
```

---

## Security Best Practices

### 1. Environment Variables

✅ DO:
- Store secrets in Vercel dashboard
- Use different credentials per environment
- Rotate credentials regularly
- Use minimal required permissions

❌ DON'T:
- Commit `.env` file
- Share credentials in chat/email
- Use same credentials across environments
- Log sensitive data

### 2. API Security

✅ DO:
- Validate all inputs with Zod
- Sanitize HTML with DOMPurify
- Rate limit API endpoints
- Use HTTPS only

❌ DON'T:
- Trust client input
- Use dangerouslySetInnerHTML without sanitization
- Expose error details to clients
- Log user passwords

### 3. Database Security

✅ DO:
- Enable Row Level Security
- Use parameterized queries
- Encrypt connections
- Regular backups

❌ DON'T:
- Disable RLS
- Use string concatenation for queries
- Log SQL statements with sensitive data
- Skip backups

---

## Rollback Procedure

If deployment has critical issues:

```bash
# View recent deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment_id>

# Or manually redeploy from git
vercel --prod
```

---

## Continuous Deployment

GitHub Actions workflow automatically:
- Runs tests on PR
- Checks linting with Biome
- Performs security audit
- Deploys on merge to main

See `.github/workflows/ci-cd.yml` for details.

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Connection Pooling**: https://supabase.com/docs/guides/database/connecting-to-postgres
- **Core Web Vitals**: https://web.dev/vitals/
- **Security Best Practices**: https://owasp.org/

---

**Last Updated**: 2026-02-13
**Status**: Production Ready ✅
