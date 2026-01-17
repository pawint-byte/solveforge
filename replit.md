# App Idea Generator Quiz

## Overview

This is an interactive quiz application that helps users discover what kind of app they might enjoy building. Users answer questions about their interests, target users, and preferences, then receive personalized app ideas based on their responses. The app follows Material Design 3 principles with a modern quiz interface featuring smooth animations and clear visual feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React useState for local UI state
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for smooth transitions between quiz questions
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Development**: tsx for running TypeScript directly
- **Production**: esbuild bundles server code, Vite bundles client

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui)
    pages/        # Route components
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer
shared/           # Shared types and schemas
  schema.ts       # Drizzle ORM schema definitions
```

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Current Storage**: In-memory storage (MemStorage class) with interface for future database migration
- **Database Ready**: Schema and configuration prepared for PostgreSQL when DATABASE_URL is provided

### Design System
- Material Design 3 principles adapted for quiz interfaces
- Card-based layout with max-w-2xl centered container
- Large clickable radio options (min-height 60px) with clear selection states
- Progress indicator showing question number and completion bar
- Typography: System fonts with specific sizing for headlines (32-40px), questions (24px), and options (16-18px)

## External Dependencies

### UI Framework
- **Radix UI**: Accessible component primitives (dialog, radio-group, progress, toast, etc.)
- **shadcn/ui**: Pre-styled component library using Radix + Tailwind
- **Lucide React**: Icon library

### Data & State
- **TanStack React Query**: Server state management and caching
- **Zod**: Runtime type validation
- **Drizzle ORM**: Type-safe database queries (PostgreSQL ready)

### Animation
- **Framer Motion**: Page transitions and micro-interactions
- **Embla Carousel**: Carousel component support

### Development
- **Vite**: Frontend bundling and dev server
- **esbuild**: Production server bundling
- **TypeScript**: Type safety across full stack

### Database (When Provisioned)
- **PostgreSQL**: Primary database
- **connect-pg-simple**: Session storage
- **drizzle-kit**: Database migrations and schema push

## Content Creation Bot

The project includes an autonomous content creation bot (`bot/` directory) for promoting the App Ideas app on social media.

### Bot Architecture
```
bot/
  __init__.py         # Package init
  config.py           # Configuration and environment variables
  ideas_generator.py  # App idea generation (database + AI)
  script_generator.py # Video script generation
  video_generator.py  # Video/image creation (ElevenLabs TTS + MoviePy)
  social_poster.py    # Social media posting (Instagram, TikTok, X)
  notifications.py    # Email notifications (SendGrid)
  scheduler.py        # Daily scheduling
  dashboard.py        # Flask admin dashboard
  main.py             # Main workflow orchestrator
  data/               # Ideas database (JSON)
  output/             # Generated media and run logs
  logs/               # Application logs
```

### Bot Features
- **Idea Generation**: Pulls from 15+ built-in ideas or generates fresh ones via OpenAI
- **Script Generation**: Creates 15-second promo scripts with hook, pitch, and CTA
- **Video Creation**: ElevenLabs TTS voiceover with MoviePy video composition
- **Social Posting**: Instagram Reels, TikTok, X (Twitter) with media upload
- **Notifications**: Email alerts on success/failure via SendGrid
- **Admin Dashboard**: Flask-based monitoring at port 5001

### Required Environment Variables
```
# AI (uses Replit AI Integrations by default)
OPENAI_API_KEY              # Optional if using Replit AI

# Video Generation
ELEVENLABS_API_KEY          # Text-to-speech
ELEVENLABS_VOICE_ID         # Voice ID (default: Rachel)

# Social Media
INSTAGRAM_ACCESS_TOKEN      # Meta Graph API
INSTAGRAM_BUSINESS_ID       # Instagram Business ID
TIKTOK_ACCESS_TOKEN         # TikTok API
TIKTOK_OPEN_ID              # TikTok user ID
X_API_KEY                   # Twitter/X API
X_API_SECRET
X_ACCESS_TOKEN
X_ACCESS_TOKEN_SECRET
X_BEARER_TOKEN

# CDN for Instagram/TikTok (required for video hosting)
MEDIA_HOST_URL              # Public URL base for media hosting

# Notifications
SENDGRID_API_KEY            # SendGrid email API
NOTIFICATION_EMAIL          # Email to receive notifications
FROM_EMAIL                  # Sender email address
```

### Running the Bot
```bash
# Manual run
python -c "from bot.main import run_daily_workflow; run_daily_workflow()"

# Start scheduler (runs daily at 10 AM)
python bot/scheduler.py

# Run dashboard (port 5001)
python bot/dashboard.py
```

### Production Notes
- Instagram and TikTok APIs require videos hosted at public URLs
- Configure a CDN (S3, Cloudflare R2) for media hosting
- X (Twitter) supports direct file upload via Tweepy
- Bot gracefully falls back to static images if video generation fails