# Design Guidelines: SolveForge Platform

## Design Approach
**Selected System**: Material Design 3 with Upwork-inspired professional patterns
**Rationale**: Enterprise crowdsourcing platforms require trustworthy visual language, clear data hierarchy, and scalable component systems. Material Design's structured approach ensures consistency across complex dashboards while maintaining professional credibility.

## Typography System
- **Page Titles**: 36-48px, font-weight: 700, line-height: 1.1
- **Section Headers**: 24-32px, font-weight: 600, line-height: 1.2
- **Card Titles**: 18-20px, font-weight: 600, line-height: 1.3
- **Body/Description**: 15-16px, font-weight: 400, line-height: 1.6
- **Metadata/Labels**: 13-14px, font-weight: 500, uppercase tracking-wide
- **Font Stack**: Inter, -apple-system, Segoe UI, sans-serif

## Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12, 16, 24 (e.g., p-6, gap-8, mb-24)

**Container Strategy**:
- Max-width: max-w-7xl for dashboards, max-w-6xl for content pages
- Section padding: py-16 desktop, py-12 mobile
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for cards
- Sidebar dashboards: 280px fixed sidebar + flex-1 main content

## Component Library

### Navigation Header
- Fixed top position, backdrop-blur with border-bottom
- Height: h-16, contains logo + nav links + user menu
- Desktop: horizontal menu with gap-8 links
- Mobile: Hamburger menu with slide-in drawer
- User avatar: 40px circle with dropdown menu

### Hero Section (Landing Page)
- Full-width background image showing collaborative workspace/professionals
- Height: 70vh minimum
- Overlay: gradient from transparent to dark (60% opacity)
- Content: Centered, max-w-4xl
- CTA buttons with backdrop-blur-md and semi-transparent bg
- Headline: 48-56px bold white text with shadow
- Subheadline: 20px, opacity-90

### Problem/Idea Submission Cards
- White background (dark mode: dark gray), rounded-xl, shadow-md
- Padding: p-6
- Header: Avatar (48px) + Name + Timestamp in flex layout
- Title: 20px semibold, mb-3
- Description: 15px regular, text-gray-700, line-clamp-3
- Footer: Category badge + Price tag + Status indicator, flex gap-3
- Hover: shadow-lg, scale-101, transition-all 200ms

### Dashboard Layout
- Left sidebar: Navigation with icons + labels, w-72
- Main area: Grid of cards with filters at top
- Filter bar: Horizontal scrolling chips on mobile, flex wrap desktop
- Stats row: 4-column grid showing key metrics (submissions, active, earnings, etc.)
- Each stat card: Large number (32px) + label (14px) + trend indicator

### Payment/Transaction Components
- Price display: Large bold number (24-28px) with currency symbol
- Payment badges: Rounded-full pills with status colors
- Transaction history: Table layout with alternating row backgrounds
- Action buttons: "Accept", "Reject" with clear visual hierarchy

### Admin Dashboard
- Multi-tab interface with underline active states
- Data tables: Striped rows, sortable headers, inline actions
- User management cards: Avatar + info + role badge + action menu
- Analytics charts: Simple bar/line charts with tooltips (placeholder areas)

### Form Inputs
- Height: h-12, rounded-lg borders
- Label: 14px semibold, mb-2
- Focus state: 2px ring with primary color
- Textarea: min-h-32 for descriptions
- File upload: Dashed border dropzone with icon + instructions

### Buttons
- Primary: px-6 py-3, rounded-lg, font-semibold, shadow-sm
- Secondary: Outlined with 2px border
- Ghost: No background, hover shows subtle fill
- Icon buttons: 40px square, rounded-lg
- Button groups: Connected with shared borders

### Status Indicators
- Badges: Rounded-full, px-3 py-1, 12px text, uppercase
- States: Open (blue), In Progress (amber), Completed (green), Cancelled (gray)
- Notification dots: 8px circle, positioned absolute top-right

## Visual Hierarchy

**Landing Page Flow**:
1. Hero with impactful imagery and primary CTA
2. "How It Works" - 3-column feature grid with icons
3. "Recent Problems" - Horizontal scrolling card carousel
4. "Why SolveForge" - 2-column layout with image + benefits list
5. Pricing/Plans - 3-column comparison cards
6. CTA section - Centered with secondary actions
7. Footer - 4-column layout with links, contact, social

**Dashboard Priority**:
- Stats overview → Filter controls → Content grid → Pagination
- Sidebar navigation always visible (collapsed on mobile)
- Primary actions prominently positioned in top-right

## Dark Mode Strategy
- Background: #0f172a (slate-900) for main, #1e293b (slate-800) for cards
- Text: white at opacity-90 for primary, opacity-70 for secondary
- Borders: white at opacity-10
- Cards: subtle elevation with lighter backgrounds, not shadows
- Inputs: Dark backgrounds with lighter borders, white text
- Toggle in header user menu with smooth transition-colors 300ms

## Images
**Hero Image**: Professional collaborative workspace with diverse team working together, bright and aspirational. Full-width, 70vh height, positioned behind content with dark overlay gradient.

**Feature Section Images**: Abstract tech/innovation graphics or platform screenshots showing the interface in use. Positioned in alternating left/right layouts with rounded-xl borders.

**User Avatars**: Circular, 40-48px for cards, 32px for compact views, colored background with initials when no image.

**Empty States**: Friendly illustrations for "no submissions yet", "no results found" - centered with helpful action text.

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation with visible focus rings (3px offset)
- Color contrast 4.5:1 minimum, 7:1 for important actions
- Screen reader announcements for status changes
- Skip navigation link for keyboard users

## Mobile Optimization
- Sidebar collapses to hamburger menu
- Cards stack to single column
- Stats grid: 2 columns on mobile vs 4 on desktop
- Bottom tab navigation for primary actions
- Reduced padding: p-4 mobile vs p-6 desktop
- Touch targets: Minimum 44px height

## Key Design Principles
1. **Trust Through Clarity**: Clean layouts with clear information hierarchy build confidence
2. **Efficient Workflows**: Minimize clicks, surface key actions, provide contextual information
3. **Scalable Systems**: Components work across problem submissions, user management, and payments
4. **Professional Polish**: Consistent spacing, refined interactions, premium feel without excess