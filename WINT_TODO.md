# Wint Enterprises — Project To-Do List

## ✅ Completed

### Branding & Landing Page
- [x] Rebrand landing page from SolveForge to Wint Enterprises, Inc.
- [x] Add Wint Enterprises logo (navy/gold interlocking W) to nav and footer
- [x] Update hero tagline: "Empowering Independence. Securing Legacies."
- [x] Add founder bio section — Peter Wint photo, credentials, background
- [x] Update bio to list all 9 platforms
- [x] Add Cornell Blockchain Essentials credential to bio

### Portfolio
- [x] Expand portfolio from 3 to 9 products with accurate descriptions
- [x] Fetch real content from each live site for accurate card descriptions
- [x] Products listed: CryptoOwnBank, FamilyRoots, Kinship Chronicle, Paygate Dating, SolveForge, Glam Market, DCA Portfolio, Story Weaver, App Hub

### Layout & UX
- [x] Restructure landing page from long-scroll to sidebar navigation layout
- [x] Desktop: left sidebar with 5 sections (Home, Portfolio, About, SolveForge, Newsletter)
- [x] Mobile: bottom tab bar navigation (fully responsive)
- [x] Remove full-page scrolling — each section fits within one view

### SEO
- [x] Update page title to Wint Enterprises, Inc.
- [x] Update meta description, keywords, author tags
- [x] Add canonical URL → https://wintenterprises.com
- [x] Update Open Graph tags (og:title, og:description, og:url, og:site_name)
- [x] Update Twitter card tags
- [x] Add JSON-LD structured data (Organization schema with founder info)
- [x] Update PWA manifest (name, short_name, description, categories, shortcuts)

### Infrastructure
- [x] Fix Stripe webhook handler (resilient, returns 400 not 404)
- [x] Confirm transactional email working via Resend (FROM: notifications@pawint-app.com)
- [x] Purchase wintenterprises.com domain through Replit
- [x] Add Google Workspace MX records to Replit DNS
- [x] Add Google Workspace TXT verification record to Replit DNS

---

## ⏳ In Progress / Waiting

- [ ] **wintenterprises.com DNS propagation** — domain purchased, waiting up to 24–48hrs to fully resolve
- [ ] **Google Workspace email verification** — TXT record added, retry verification tonight or tomorrow at admin.google.com

---

## 📋 To Do

### Email
- [ ] Once Google verifies domain, create @wintenterprises.com mailboxes in Google Workspace admin
- [ ] Update contact email in site footer from `pawint@me.com` → `peter@wintenterprises.com` (or preferred address)
- [ ] Update transactional email FROM address from `notifications@pawint-app.com` → `notifications@wintenterprises.com` (after domain verifies)

### Content & Portfolio
- [ ] Update portfolio descriptions for remaining sites as content evolves
- [x] Kinship Chronicle confirmed same app as FamilyRoots — removed from portfolio and bio
- [ ] DCA Portfolio app currently shows "Not Found" — confirm if still active or should be marked "Coming Soon"
- [ ] Add actual product screenshots or preview images to portfolio cards (optional enhancement)

### Branding
- [ ] Replace browser favicon with Wint Enterprises logo (currently still default)
- [ ] Consider adding a 512×512 Wint Enterprises icon for PWA installs

### Stripe
- [ ] Manually configure Stripe webhook URL in Stripe Dashboard (cannot be automated)
  - URL: https://wintenterprises.com/api/stripe/webhook
  - Events: payment_intent.succeeded, checkout.session.completed, etc.

### Future Enhancements
- [ ] Add individual sub-pages for each portfolio product (deeper SEO, dedicated landing)
- [ ] Set up Google Search Console for wintenterprises.com (submit sitemap after DNS resolves)
- [ ] Add sitemap.xml for SEO crawling
- [ ] ShareASale affiliate integration (hooks already in codebase, needs merchant ID)
