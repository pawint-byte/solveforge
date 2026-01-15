# Design Guidelines: App Idea Generator Quiz

## Design Approach
**Selected System**: Material Design 3 with modern quiz interface patterns
**Rationale**: Quiz applications require clear visual hierarchy, intuitive selection states, and smooth progression feedback. Material Design's emphasis on clear interactions and feedback states aligns perfectly with this use case.

## Typography System
- **Headlines** (Quiz title, results): 32-40px, font-weight: 700, tight line-height (1.1)
- **Question text**: 24px, font-weight: 600, line-height: 1.3
- **Options/body**: 16-18px, font-weight: 400, line-height: 1.6
- **Helper text/info**: 14px, font-weight: 400, opacity: 0.7
- **Font Stack**: System fonts (Inter/SF Pro/Segoe UI fallbacks) for maximum readability

## Layout System
**Spacing Units**: Use Tailwind spacing of 4, 6, 8, 12, 16 (e.g., p-4, mb-8, gap-6)

**Container Strategy**:
- Quiz container: max-w-2xl, centered with mx-auto
- Vertical padding: py-12 for main container
- Card-based layout with rounded-2xl borders
- Questions and results contained in elevated cards (shadow-lg)

## Component Library

### Question Card
- White/neutral background with subtle shadow
- Padding: p-8 to p-12
- Progress indicator at top (e.g., "Question 2 of 4") with small text and progress bar
- Question text prominent with mb-8 spacing
- Radio options in vertical stack with gap-4

### Radio Options
- Large clickable areas (min-height: 60px)
- Clear border (2px) with rounded-xl corners
- Padding: px-6 py-4
- Hover state: subtle border color change + light background tint
- Selected state: bold border, filled background tint
- Transition: all states animate smoothly (150ms)
- Typography: 17px medium weight for readability

### Navigation Buttons
- Primary "Next" button: Large (px-8 py-4), rounded-xl, font-weight: 600
- "Start Over" button: Secondary style, outlined variant
- Positioned with mt-8 spacing from options
- Full-width on mobile, auto-width on desktop (min-w-[200px])

### Results Display
- Success message banner with rounded corners and icon
- "Top Interests" section: List with large bullet points, mb-12
- Each interest: 20px font size, includes score badge (rounded pill)
- App ideas list: Checkmark bullets, generous line spacing (leading-8)
- Ideas displayed in 2-column grid on desktop (grid-cols-1 md:grid-cols-2), gap-4

### Info/Helper Components
- Info boxes: Light background, rounded-lg, px-4 py-3
- Icons: 20-24px, inline with text or standalone
- Section dividers: Horizontal rules with opacity-20, my-12

## Visual Hierarchy
**Progressive Disclosure**:
- Single question visible at a time (minimizes cognitive load)
- Smooth transitions between questions (fade/slide effects at 200ms)
- Progress indicator always visible to show completion status

**Results Page**:
- Three-tier hierarchy: Success message → Top interests → App ideas
- Each section visually separated with spacing (mb-16 between major sections)
- Scannable list format with clear visual markers

## Animations & Interactions
- Question transitions: Subtle fade-in (300ms) when advancing
- Radio selection: Immediate visual feedback with smooth scale (1.02) on click
- Button states: Gentle hover lift (translateY: -2px) + shadow increase
- Progress bar: Animated fill on question advance
- NO distracting or continuous animations

## Mobile Optimization
- Radio options stack vertically with increased touch targets (min-height: 64px)
- Buttons full-width on mobile (w-full sm:w-auto)
- Reduced padding on cards (p-6 on mobile vs p-12 on desktop)
- Font sizes scale down slightly (question: 20px mobile, 24px desktop)

## Images
**No hero image required** - This is a utility application where functionality takes priority over visual marketing. The quiz interface itself is the primary content.

**Optional decorative elements**:
- Small celebratory icon/illustration on results page (positioned above success message, max-width: 120px)
- Category icons next to top interests (24px, inline-start)
- Consider emoji or simple line icons for visual interest without bulk

## Accessibility
- High contrast ratios (4.5:1 minimum for body text)
- Focus states: 3px outline offset with brand accent color
- Radio inputs maintain native functionality with enhanced visuals
- Clear error states if selection required (red border + error text)
- Labels properly associated with all interactive elements

## Key Design Principles
1. **Clarity Over Decoration**: Every element serves the quiz-taking experience
2. **Instant Feedback**: Users immediately see their selections and progress
3. **Minimal Friction**: Large touch targets, clear CTAs, obvious next steps
4. **Delightful Results**: The payoff (app ideas) feels rewarding and personalized
5. **Scannable Lists**: Results formatted for quick reading and inspiration