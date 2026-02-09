# Quantum Mirror

<div align="center">
  <h3>Talk to Your Future Self, Reframe Reality, Collapse into Action</h3>
  <p>A Gemini-powered goal execution and action check-in app</p>
</div>

## Features

- **Future-Self Chat**: Talk to your future self who already achieved the goal, with warm challenge and narrative reframing.
- **Reality Reframe**: Upload a real-scene photo and get 3 concrete future deltas.
- **Action Collapse**: Generate a 10-20 minute physical task and check in with proof.
- **Streak Tracking**: Track action history and keep your consistency streak.
- **Safety Guardrails**: Self-harm keyword detection with immediate safety guidance.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4
- **Auth**: NextAuth.js (Google OAuth, Email, and local dev login)
- **Database**: Prisma ORM (SQLite / PostgreSQL / MySQL)
- **AI**: Google Gemini (`@google/generative-ai`)
- **Image Storage**: Cloudinary (optional)
- **State**: Zustand

## Quick Start

### 1. Clone

```bash
git clone <your-repo-url>
cd quantum-mirror
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` and set at least:

```bash
# Gemini (required)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_TEXT=gemini-3-flash-preview
GEMINI_MODEL_MULTI=gemini-3-flash-preview

# Database (required)
DATABASE_URL=file:./dev.db

# NextAuth (required)
AUTH_SECRET=your_random_secret_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email auth (optional)
EMAIL_SERVER=
EMAIL_FROM=

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

If you need Google registration/login, create a Google OAuth Web client and add this redirect URI:

```bash
http://localhost:3000/api/auth/callback/google
```

### 4. Initialize database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
quantum-mirror/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── goals/
│   │   │   ├── mirror/
│   │   │   └── session/
│   │   ├── auth/
│   │   ├── goals/
│   │   ├── history/
│   │   ├── session/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── mirror/
│   │   ├── ui/
│   │   └── navigation.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── gemini.ts
│   │   ├── prisma.ts
│   │   ├── safety.ts
│   │   ├── streak.ts
│   │   └── validators.ts
│   ├── stores/
│   └── types/
├── prisma/
│   └── schema.prisma
├── public/
├── DEPLOYMENT.md
├── QUICKSTART.md
└── README.md
```

## API Routes

### Auth
- `GET/POST /api/auth/[...nextauth]` - NextAuth handler

### Goals
- `GET /api/goals` - List user goals
- `POST /api/goals` - Create goal

### Session
- `GET /api/session/today` - Get today session
- `POST /api/session/today` - Start today session

### Mirror
- `POST /api/mirror/chat` - Future-self conversation
- `POST /api/mirror/reframe` - Image-based reality reframe
- `POST /api/mirror/action/generate` - Generate action task
- `POST /api/mirror/action/checkin` - Submit check-in + get feedback

## Frontend Routes

- `/` - Landing page (or dashboard when signed in)
- `/auth/signin` - Sign in page
- `/goals` - Goal management
- `/session/today` - Chat flow
- `/session/today/reframe` - Reality reframe flow
- `/session/today/action` - Action generation + check-in
- `/history` - Session history and streaks

## Core Product Flow

1. **Set or select a goal**
2. **Start today's session**
3. **Chat with future self**
4. **Optional reframe from image**
5. **Generate concrete action**
6. **Check in with proof**
7. **Review history and streak**

## Development Commands

```bash
npm run dev      # Start dev server
npm run lint     # Lint code
npm run build    # Production build
npm run start    # Start production server
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GEMINI_MODEL_TEXT` | No | Text model name |
| `GEMINI_MODEL_MULTI` | No | Multimodal model name |
| `DATABASE_URL` | Yes | Prisma database URL |
| `AUTH_SECRET` | Yes | NextAuth secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `EMAIL_SERVER` | No | SMTP config string |
| `EMAIL_FROM` | No | Sender email |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

## Safety Notice

Quantum Mirror is a reflection and action-planning product, not a medical or psychological treatment service.
If a user is at risk of self-harm, they should contact local emergency services or trusted support immediately.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

## Contributing

Issues and pull requests are welcome.

## License

MIT

## Support

- Open an issue in your repository
- See [QUICKSTART.md](./QUICKSTART.md)
- See [DEPLOYMENT.md](./DEPLOYMENT.md)
