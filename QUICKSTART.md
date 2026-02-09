# Quantum Mirror - Quick Start

This is a 5-minute setup guide to run Quantum Mirror locally.

## Prerequisites

- Node.js 20+
- npm (or yarn/pnpm)
- A Google Gemini API key

## Step 1: Get a Gemini API Key

1. Open [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create an API key
4. Copy the key

## Step 2: Install and Configure

```bash
# in project root
npm install
```

Create `.env` in project root and set:

```bash
GEMINI_API_KEY=your_api_key
DATABASE_URL=file:./dev.db
AUTH_SECRET=replace_with_secure_random_value
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Optional variables:

```bash
GEMINI_MODEL_TEXT=gemini-3-flash-preview
GEMINI_MODEL_MULTI=gemini-3-flash-preview
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_SERVER=
EMAIL_FROM=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

If you want Google sign-up/sign-in, configure Google OAuth:

1. Open Google Cloud Console -> APIs & Services -> Credentials
2. Create an OAuth Client ID (Web application)
3. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
4. Copy values into `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## Step 3: Initialize Database

```bash
npx prisma generate
npx prisma db push
```

## Step 4: Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## First-Run Flow

1. Sign up/sign in with Google (or use local dev login if enabled)
2. Create a goal on `/goals`
3. Open `/session/today` and start chat
4. Optional: use `/session/today/reframe` with an image URL
5. Generate an action on `/session/today/action`
6. Submit check-in proof and reflection
7. Review progress on `/history`

## Local Dev Tips

### Use Prisma Studio

```bash
npx prisma studio
```

Default URL is usually [http://localhost:5555](http://localhost:5555).

### Rebuild Prisma Client

```bash
npx prisma generate
```

### Reset Local Database (destructive)

```bash
rm -f dev.db
npx prisma db push
```

## Troubleshooting

### Cannot connect to database

- Verify `DATABASE_URL`
- Ensure `npx prisma db push` has run

### Gemini API failed

- Verify `GEMINI_API_KEY`
- Verify network access
- Verify model names

### Auth not working

- Verify `AUTH_SECRET`
- Re-run Prisma setup
- Check `/api/auth/[...nextauth]` provider config

### Build errors

```bash
npm ci
npx prisma generate
npm run build
```

## Next Steps

1. Configure Google OAuth or email login
2. Configure Cloudinary for image upload storage
3. Deploy using [DEPLOYMENT.md](./DEPLOYMENT.md)
