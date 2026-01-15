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