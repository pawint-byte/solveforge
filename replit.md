# SolveForge - Crowdsourcing Problem-Solving Platform

## Overview

SolveForge is a web-based crowdsourcing platform where users submit problems, ideas, or challenges they need solved. Users can create detailed problem submissions with budget ranges and timelines, track their submission status, and communicate with admins through a built-in messaging system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React useState for local UI state
- **Styling**: Tailwind CSS with CSS variables for theming (blue/indigo professional branding)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Authentication**: Replit Auth (OpenID Connect) - supports Google, GitHub, X, Apple, email/password
- **Session Storage**: PostgreSQL with connect-pg-simple
- **Development**: tsx for running TypeScript directly
- **Production**: esbuild bundles server code, Vite bundles client

### Project Structure
```
client/                     # React frontend
  src/
    components/             # UI components (shadcn/ui)
    pages/                  # Route components
      home.tsx              # Landing page (logged out) or Dashboard (logged in)
      landing.tsx           # Marketing landing page
      dashboard.tsx         # User dashboard with submissions
      submit.tsx            # Problem submission form
      submission-detail.tsx # View submission with messaging
      admin.tsx             # Admin dashboard
    hooks/                  # Custom React hooks (use-auth.ts)
    lib/                    # Utilities and query client
server/                     # Express backend
  index.ts                  # Server entry point
  routes.ts                 # API route definitions
  storage.ts                # Data access layer (DatabaseStorage)
  db.ts                     # Database connection
  replit_integrations/      # Auth module
shared/                     # Shared types and schemas
  schema.ts                 # Drizzle ORM schema definitions
  models/                   # Auth models
```

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Session Storage**: PostgreSQL sessions table

### Database Schema
- **users**: User accounts (from Replit Auth)
- **sessions**: Express session storage
- **submissions**: Problem submissions with status workflow
- **payments**: Payment tracking for submissions (Stripe integrated)
- **reviews**: User reviews after completion
- **messages**: Admin-user messaging per submission
- **newsletter_subscribers**: Email subscribers for marketing
- **referrals**: Referral tracking with unique codes
- **user_credits**: Credit/rewards system for referrals
- **add_on_categories**: Admin-configurable add-on categories
- **add_on_items**: Configurable add-on items with price ranges and timelines
- **submission_add_ons**: Junction table linking submissions to selected add-ons

### Status Workflow
Submissions follow this status progression:
1. `pending` - Initial submission, awaiting review
2. `in_review` - Being reviewed by admin
3. `approved` - Approved for work
4. `in_progress` - Work has started
5. `solution_proposed` - Solution ready for review
6. `completed` - Successfully delivered
7. `cancelled` - Cancelled by user or admin

### Design System
- Professional blue/indigo branding (primary: 226 70% 50%)
- Card-based layout with clear visual hierarchy
- Material Design 3 principles adapted for web
- Trust-focused elements (security badges, clear pricing)
- Light/dark mode support

## API Routes

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout
- `GET /api/auth/user` - Get current user

### Submissions
- `POST /api/submissions` - Create new submission
- `GET /api/submissions/my` - Get user's submissions
- `GET /api/submissions/:id` - Get single submission

### Admin
- `GET /api/admin/check` - Check if user is admin
- `GET /api/admin/submissions` - Get all submissions
- `PATCH /api/admin/submissions/:id` - Update submission status

### Messages
- `GET /api/submissions/:id/messages` - Get messages
- `POST /api/submissions/:id/messages` - Send message

### Stripe Payments
- `GET /api/stripe/config` - Get Stripe publishable key
- `POST /api/submissions/:id/checkout` - Create checkout session for deposit (card)
- `POST /api/submissions/:id/crypto-checkout` - Create Coinbase Commerce checkout (crypto)
- `GET /api/submissions/:id/payments` - Get payments for submission
- `POST /api/admin/submissions/:id/milestone` - Create milestone payment (admin)
- `GET /api/crypto/available` - Check if crypto payments are available

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter

### Referrals
- `GET /api/referral/code` - Get or create referral code
- `GET /api/referral/stats` - Get referral statistics
- `POST /api/referral/track` - Track referral click
- `POST /api/referral/apply` - Apply referral after signup
- `GET /api/credits` - Get user's credit balance

### Affiliate Marketing
- `POST /api/affiliate/conversion` - Track affiliate conversion (ShareASale prep)

### Add-Ons Builder
- `GET /api/addons` - Get all add-on categories with items (public)
- `GET /api/submissions/:id/addons` - Get add-ons for a submission
- `POST /api/admin/addons/seed` - Seed default add-ons (admin)
- `POST /api/admin/addons/categories` - Create add-on category (admin)
- `PATCH /api/admin/addons/categories/:id` - Update category (admin)
- `DELETE /api/admin/addons/categories/:id` - Delete category (admin)
- `POST /api/admin/addons/items` - Create add-on item (admin)
- `PATCH /api/admin/addons/items/:id` - Update item (admin)
- `DELETE /api/admin/addons/items/:id` - Delete item (admin)

## Admin Configuration

To grant admin access, add user IDs to the `ADMIN_USER_IDS` set in `server/routes.ts`:

```typescript
const ADMIN_USER_IDS = new Set<string>([
  "your-user-id-here",  // Add after first login
]);
```

User IDs can be found in the database users table or from `req.user.claims.sub`.

## External Dependencies

### UI Framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-styled component library
- **Lucide React**: Icon library

### Data & State
- **TanStack React Query**: Server state management
- **Zod**: Runtime type validation
- **Drizzle ORM**: Type-safe database queries

### Authentication
- **openid-client**: OpenID Connect client
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Running the Project

The application runs via the "Start application" workflow which executes `npm run dev`:
- Express server handles API routes
- Vite serves the React frontend
- Both run on port 5000

## Marketing & Growth Features

### Google Analytics 4
- UTM parameter tracking for ad campaigns
- Custom event tracking (submissions, payments, signups, shares)
- Session storage for attribution

### Social Sharing
- Share buttons for X, Facebook, LinkedIn
- Pre-filled promo text for submissions and referrals
- Copy link functionality

### Referral System
- Unique referral codes per user
- Credit rewards (100 credits for referrer, 50 for referred)
- Referral tracking and stats

### Newsletter with Mailchimp
- Email subscription management synced with Mailchimp
- Automatic subscriber list sync on subscribe/unsubscribe
- Tag-based segmentation by source (website, reactivation)
- Unsubscribe functionality

### PWA Support
- Web app manifest for mobile installation
- App shortcuts for quick access
- Apple mobile web app support

### Multi-Language Support (i18n)
- React-i18next for internationalization
- Supported languages: English (en), Spanish (es), French (fr)
- Language switcher in the navigation header
- Translation files in `client/src/locales/`
- All key UI components fully translated

### Cryptocurrency Payments
- Coinbase Commerce integration for crypto payments
- Supports BTC, ETH, and other major cryptocurrencies
- Crypto payment option available alongside card payments
- Environment variable: `COINBASE_COMMERCE_API_KEY` (optional)

### Affiliate Marketing (Prepared)
- ShareASale integration hooks
- Conversion tracking structure
- Session-based affiliate attribution

### Menu-Driven Add-Ons Builder
- Admin-configurable add-on categories and items
- Default add-ons seeded with 6 categories: Authentication & Security, Payments & E-commerce, Analytics & SEO, UI/UX Enhancements, Integrations, Custom
- ~20 pre-configured items with price ranges and timelines (e.g., Social Login $200-300, Stripe Integration $400-700)
- Real-time pricing calculator showing min/max totals and estimated delivery time
- Collapsible category menu with search/filter functionality
- Popular badges and tooltips for user guidance
- Add-ons automatically saved to submission when created
- Admin interface for full CRUD operations on categories and items
- Key components: `AddOnsBuilder` (user-facing), `AdminAddOnsManager` (admin CRUD interface)

## Payment Structure

Milestone-based payments (30/40/30 split):
1. **Deposit (30%)** - Paid upfront when submission is approved
2. **Midpoint (40%)** - Paid when solution is proposed
3. **Final (30%)** - Paid upon completion

## Future Enhancements

- Mailchimp API integration for automated emails
- File attachments for submissions
- Email notifications
- Analytics dashboard
- Full ShareASale integration with merchant ID
