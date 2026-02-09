# Quantum Mirror - Deployment Guide

This guide explains how to deploy Quantum Mirror to Vercel or other hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Auth Provider Setup](#auth-provider-setup)
- [Deploy to Vercel](#deploy-to-vercel)
- [Other Deployment Options](#other-deployment-options)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)
- [Performance and Security](#performance-and-security)

## Prerequisites

1. Repository pushed to Git provider (GitHub/GitLab/Bitbucket)
2. Gemini API key
3. Production database (PostgreSQL/MySQL recommended)
4. `AUTH_SECRET` generated securely

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Environment Variables

Set these in your deployment platform:

```bash
# Gemini
GEMINI_API_KEY=
GEMINI_MODEL_TEXT=gemini-3-flash-preview
GEMINI_MODEL_MULTI=gemini-3-flash-preview

# Database
DATABASE_URL=

# NextAuth
AUTH_SECRET=
NEXTAUTH_URL=https://your-domain.com

# Optional providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_SERVER=
EMAIL_FROM=

# Optional image storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Database Setup

### Option A: Vercel Postgres

1. In Vercel project, open `Storage`
2. Create a Postgres database
3. Vercel injects `DATABASE_URL`

### Option B: Supabase Postgres

1. Create project in Supabase
2. Copy connection string from database settings
3. Set `DATABASE_URL`

### Option C: PlanetScale MySQL

1. Create PlanetScale DB
2. Copy connection string
3. Set `DATABASE_URL`

### Local SQLite (dev only)

Use:

```bash
DATABASE_URL=file:./dev.db
```

### Prisma provider configuration

If using PostgreSQL/MySQL, update `prisma/schema.prisma` datasource provider if needed.

## Auth Provider Setup

### Google OAuth (recommended)

1. Open Google Cloud Console
2. Create OAuth client credentials for web
3. Add redirect URI:
   - `https://your-domain.com/api/auth/callback/google`
4. Set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Email Login (optional)

Set:

- `EMAIL_SERVER` (SMTP URL/config)
- `EMAIL_FROM`

### Dev Login

`dev-login` credentials provider is for local testing and should not be your only production auth strategy.

## Deploy to Vercel

### Method 1: Vercel Dashboard

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Import repository
3. Set environment variables
4. Deploy

### Method 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

### Build command notes

Ensure Prisma client exists before runtime:

- Keep `prisma` and `@prisma/client` in dependencies
- Run at least once in CI/build pipeline:

```bash
npx prisma generate
```

## Other Deployment Options

### Railway

1. Connect repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

### Netlify

Netlify can run Next.js, but API routing configuration may need additional setup.

### Docker

Example baseline `Dockerfile`:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start"]
```

## Post-Deployment Checklist

- [ ] All required env vars are set
- [ ] Database connection works
- [ ] Prisma schema has been pushed/migrated
- [ ] Auth callback URLs are correct
- [ ] Gemini API key is valid and has quota
- [ ] Main flows work:
  - [ ] Goal creation
  - [ ] Future-self chat
  - [ ] Reframe with image
  - [ ] Action generation
  - [ ] Check-in feedback
  - [ ] History page

## Troubleshooting

### Database connection failed

- Validate `DATABASE_URL`
- Check DB allowlists/firewall
- Verify provider in Prisma schema

### Prisma client not generated

```bash
npx prisma generate
```

### NextAuth session issues

- Verify `AUTH_SECRET`
- Verify `NEXTAUTH_URL`
- Verify callback URLs and provider credentials

### Gemini API errors

- Verify API key
- Verify model names
- Check platform/network restrictions

### Image upload failures

- If using Cloudinary, verify credentials
- If not using Cloudinary, ensure image URL is publicly accessible

### Build failures

```bash
npm ci
npx prisma generate
npm run build
```

## Performance and Security

### Performance

1. Add DB pooling where supported
2. Cache repeated reads where safe
3. Optimize image delivery
4. Rate-limit API endpoints

### Security

1. Never hardcode secrets
2. Rotate API keys regularly
3. Use least-privilege database credentials
4. Restrict CORS/origins in production
5. Monitor abuse and API spend

## References

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Vercel Docs](https://vercel.com/docs)
