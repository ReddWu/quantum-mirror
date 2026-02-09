

Quantum Mirror

<div align="center">
  <h3>Dialogue with Your Future Self, Reconstruct Reality, Collapse into Action</h3>
  <p>A goal achievement and action check-in app powered by Gemini AI</p>
</div>


Features
	•	Future Self Dialogue: Converse with your future self who has already achieved the goal, receiving gentle challenges and narrative reframing
	•	Reality Reconstruction: Upload photos of your current environment, and the AI identifies three concrete future differences
	•	Action Collapse: Generate a 10–20 minute, achievable physical action; upload a photo to check in and receive AI feedback
	•	Streak Tracking: Record your action history and maintain continuous check-in streaks
	•	Safety Protection: Detect self-harm related keywords and automatically display safety guidance and support resources

Tech Stack
	•	Framework: Next.js 16 (App Router) + TypeScript
	•	Styling: Tailwind CSS 4
	•	Authentication: NextAuth.js (Google OAuth and Email supported)
	•	Database: Prisma ORM (PostgreSQL, MySQL, SQLite supported)
	•	AI: Google Gemini 1.5 (@google/generative-ai)
	•	Image Storage: Cloudinary (optional)
	•	State Management: Zustand

Quick Start

1. Clone the Repository

git clone <your-repo-url>
cd quantum-mirror

2. Install Dependencies

npm install

3. Configure Environment Variables

Copy the .env example file and fill in your configuration:

# Gemini API (required)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_TEXT=gemini-1.5-flash
GEMINI_MODEL_MULTI=gemini-1.5-flash

# Database (required)
DATABASE_URL=file:./dev.db  # SQLite for local development

# NextAuth (required)
AUTH_SECRET=your_random_secret_here  # Generate with: openssl rand -base64 32

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email Authentication (optional)
EMAIL_SERVER=
EMAIL_FROM=

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

4. Initialize the Database

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

5. Start the Development Server

npm run dev

Visit http://localhost:3000 to view the app.

Project Structure

quantum-mirror/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth authentication
│   │   │   ├── goals/         # Goal management
│   │   │   ├── mirror/        # Core feature APIs
│   │   │   └── session/       # Session management
│   │   ├── goals/             # Goal pages
│   │   ├── history/           # History pages
│   │   ├── session/           # Session-related pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Context providers
│   ├── components/            # React components
│   │   ├── mirror/           # Core feature components
│   │   ├── ui/               # UI components
│   │   └── navigation.tsx    # Navigation bar
│   ├── lib/                   # Utilities and configuration
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── gemini.ts         # Gemini API integration
│   │   ├── prisma.ts         # Prisma client
│   │   ├── safety.ts         # Safety detection
│   │   ├── streak.ts         # Streak calculation
│   │   ├── cloudinary.ts     # Image upload
│   │   └── validators.ts     # Data validation
│   ├── stores/                # Zustand state management
│   └── types/                 # TypeScript type definitions
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── DEPLOYMENT.md              # Detailed deployment guide
└── README.md                  # This file

API Routes

Authentication
	•	GET/POST /api/auth/[…nextauth] – NextAuth authentication handler

Goal Management
	•	GET /api/goals – Retrieve all user goals
	•	POST /api/goals – Create a new goal

Session Management
	•	GET /api/session/today – Retrieve today’s session
	•	POST /api/session/today – Create today’s session

Core Features
	•	POST /api/mirror/chat – Future self dialogue
	•	POST /api/mirror/reframe – Reality reconstruction (image analysis)
	•	POST /api/mirror/action/generate – Generate action tasks
	•	POST /api/mirror/action/checkin – Action check-in

Frontend Routes
	•	/ – Home (logged out: product introduction; logged in: dashboard)
	•	/goals – Goal creation and management
	•	/session/today – Today’s session (future self dialogue)
	•	/session/today/reframe – Reality reconstruction (image upload and analysis)
	•	/session/today/action – Action generation and check-in
	•	/history – History and streak statistics

Core Feature Descriptions

1. Future Self Dialogue

Users converse with a future self who has already achieved the goal. The AI:
	•	Provides gentle, specific responses
	•	Asks friendly but challenging questions
	•	Rewrites the user’s narrative framework
	•	Suggests next steps (for example, entering reality reconstruction or action generation)

2. Reality Reconstruction

Users upload photos of their current environment. Through multimodal analysis, the AI:
	•	Identifies three concrete future differences (objects, layout, behavioral traces, etc.)
	•	Provides an 80–150 word narrated description
	•	Supplies cues for subsequent action generation

3. Action Collapse

Based on dialogue and reconstruction results, the AI generates:
	•	A physical action that can be completed in 10–20 minutes
	•	Clear step-by-step guidance
	•	The rationale behind the action
	•	A requirement to upload a photo as proof of completion

4. Action Check-In

After completing the action, users upload a photo and receive:
	•	Confirmation and feedback
	•	One sustainable micro-adjustment suggestion
	•	A prompt for the next day’s action

5. Safety Protection

The system detects self-harm related keywords. If detected, it will:
	•	Immediately return a safety notice
	•	Display crisis hotline information
	•	Emphasize the tool’s non-medical nature

Deployment

For detailed deployment instructions, see DEPLOYMENT.md.

Quick Deployment to Vercel
	1.	Push the code to GitHub
	2.	Import the project into Vercel
	3.	Configure environment variables
	4.	Deploy

Development

Build the Project

npm run build

Run the Production Version

npm start

Lint the Code

npm run lint

Database Management

# Open Prisma Studio (visual database management)
npx prisma studio

# Create a database migration
npx prisma migrate dev --name your_migration_name

# Reset the database
npx prisma migrate reset

Environment Variables Reference

Variable Name	Required	Description
GEMINI_API_KEY	Yes	Google Gemini API key
GEMINI_MODEL_TEXT	No	Text model name (default: gemini-1.5-flash)
GEMINI_MODEL_MULTI	No	Multimodal model name (default: gemini-1.5-flash)
DATABASE_URL	Yes	Database connection string
AUTH_SECRET	Yes	NextAuth encryption secret
GOOGLE_CLIENT_ID	No	Google OAuth client ID
GOOGLE_CLIENT_SECRET	No	Google OAuth client secret
EMAIL_SERVER	No	SMTP server configuration
EMAIL_FROM	No	Sender email address
CLOUDINARY_CLOUD_NAME	No	Cloudinary cloud name
CLOUDINARY_API_KEY	No	Cloudinary API key
CLOUDINARY_API_SECRET	No	Cloudinary API secret

Security Notes
	1.	This application is not a medical or psychological treatment service
	•	It is intended solely for self-reflection and action planning
	•	It should not replace professional mental health services
	2.	Data privacy
	•	All user data is stored in your own database
	•	Gemini API usage follows Google’s privacy policy
	3.	API key protection
	•	Never hard-code API keys in source code
	•	Use environment variables for sensitive information
	•	Rotate API keys regularly

Contributing

Issues and Pull Requests are welcome.

License

MIT License

Support

If you have questions or suggestions:
	•	Submit a GitHub Issue
	•	Check DEPLOYMENT.md for detailed help

⸻

Note: Quantum Mirror is a self-reflection and action planning tool, not a medical or psychological treatment service. If you are experiencing self-harm thoughts or severe mental health issues, please contact professional medical services or an emergency hotline immediately.
