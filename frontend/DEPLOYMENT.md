# 🚀 Pharmacy Fantasy — Frontend Production Deployment Guide

> **Next.js 14+ (App Router) · React · TypeScript · Apollo Client · Standalone Node SSR**  
> *Target:* Frontend DevOps, Web Infrastructure Engineers & SRE

---

## 1. Next.js Build & Standalone Optimization

To deploy Next.js in production with minimal container image size (typically under 120MB instead of 1GB+), configure standalone mode in `next.config.js`:

```javascript
// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Generates a minimal server bundle in .next/standalone
  poweredByHeader: false, // Security: suppress X-Powered-By: Next.js
  compress: true, // Enable gzip compression for responses
};

module.exports = nextConfig;
```

---

## 2. Production Multi-Stage Dockerfile

Replace development Dockerfile with this multi-stage standalone runner:

```dockerfile
# ── Stage 1: Install Dependencies ──────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build Application ────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time public environment variables
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=${NEXT_PUBLIC_GRAPHQL_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ── Stage 3: Minimal Production Runner ────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Run as unprivileged node user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

---

## 3. Platform Deployment Options

### Option A: Vercel / Netlify (Managed Edge Delivery)
1. Link your GitHub repository in the Vercel dashboard.
2. Set Root Directory to `frontend`.
3. Add Environment Variables:
   - `NEXT_PUBLIC_GRAPHQL_URL`: `https://api.pharmacyfantasy.com/graphql`
   - `NEXT_PUBLIC_APP_URL`: `https://app.pharmacyfantasy.com`
4. Deploy — Vercel handles global Edge CDN routing, image optimization, and SSL automatically.

### Option B: Self-Hosted Docker Container (VPS / Cloud Run)
```bash
# Build production image with build args
docker build \
  --build-arg NEXT_PUBLIC_GRAPHQL_URL=https://api.pharmacyfantasy.com/graphql \
  --build-arg NEXT_PUBLIC_APP_URL=https://app.pharmacyfantasy.com \
  -t pharmacyfantasy-frontend:latest .

# Run standalone container
docker run -d \
  -p 3000:3000 \
  --name pf-frontend \
  --restart unless-stopped \
  pharmacyfantasy-frontend:latest
```

---

## 4. Production Security Headers & CDN Rules

Add security headers in `next.config.js` or via Nginx:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

---

## 5. Performance & Pre-Deployment Checklist

- [ ] `npm run build` succeeds locally without TypeScript or linting errors.
- [ ] `NEXT_PUBLIC_GRAPHQL_URL` points to production HTTPS API domain, not localhost.
- [ ] Image assets in `public/` are compressed and SVGs are sanitized.
- [ ] Apollo Client normalized caching confirmed (`InMemoryCache`).
- [ ] Mobile responsive testing passed for Delivery Courier and Shopkeeper views on standard 360px–420px mobile viewports.
