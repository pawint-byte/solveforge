# App Deployment Checklist

## After App Development is Complete

### Step 1: Publish Your App on Replit

1. Click **"Publish"** button (top right)
2. Choose deployment type (Autoscale recommended)
3. Wait for deployment to complete
4. Your app is now live at `[app-name]--pawint.replit.app`

---

### Step 2: Connect Custom Domain (Subdomain)

**In Replit:**

1. Go to **Publishing → Domains**
2. Click **"Connect your own domain"**
3. Enter your subdomain: `appname.pawint-app.com`
4. Copy the **IP address** and **TXT verification code**

**In Squarespace DNS (domains.squarespace.com):**

1. Go to **pawint-app.com → DNS Settings**
2. Add **A Record:**
   - Host: `appname` (just the subdomain part, not the full domain)
   - IP: (paste from Replit)
3. Add **TXT Record:**
   - Host: `appname`
   - Data: (paste verification code from Replit)
4. Save both records

**Back in Replit:**

1. Click **"Link"** button
2. Wait for verification (few minutes to 48 hours)

---

### Step 3: Backup to GitHub

1. Click **Git** tab (branch icon in left sidebar, or + to add Git panel)
2. Click **gear icon (⚙️)** → Settings
3. First time only: Click **"Create Remote"** → name your repo
4. Go back to main Git view, click **"Push"**
5. Verify at github.com/pawint53

---

## Quick Reference

| Task | Where | Action |
|------|-------|--------|
| Publish app | Replit | Click Publish button |
| Add subdomain | Squarespace DNS + Replit Domains | Add A + TXT records, then Link |
| Backup code | Replit Git panel | Click Push |
| Verify backup | github.com/pawint53 | Check repository |

---

## Your Domain Structure

| URL | App | Status |
|-----|-----|--------|
| `pawint-app.com` | SolveForge | ✅ Done |
| `apphub.pawint-app.com` | App Hub | ✅ Done |
| `glammarket.pawint-app.com` | Glam Market | ✅ Done |
| `kinship.pawint-app.com` | Kinship Chronicle | ✅ Done |
| `dca.pawint-app.com` | DCA Portfolio | ✅ Done |
| `storyweaver.pawint-app.com` | Story Weaver | ✅ Done |
| `paygate.pawint-app.com` | Pay Gate Dating | To do |

---

## Giving Code to Clients

If a client requests their source code:

1. Go to **github.com/pawint53/[repo-name]**
2. Click **Code → Download ZIP**, or
3. Give them access to the GitHub repository

**What they'll need to self-host:**
- Node.js server
- PostgreSQL database
- Environment variables (API keys, etc.)
- Hosting platform (AWS, DigitalOcean, Vercel, etc.)

---

## DNS Record Examples

For each new app subdomain, add these to Squarespace DNS:

```
Type: A
Host: [subdomain]
IP: [from Replit]

Type: TXT
Host: [subdomain]
Data: replit-verify=[code from Replit]
```

**Example for Glam Market:**
```
Type: A
Host: glammarket
IP: 34.111.179.208

Type: TXT
Host: glammarket
Data: replit-verify=abc123-xyz789...
```

---

---

## Standard App Requirements Template

Use this checklist when building any new app to ensure all standard features are included.

### SEO & Social Sharing Meta Tags (client/index.html)

```html
<!-- Basic SEO -->
<title>[App Name] - [Tagline]</title>
<meta name="description" content="[Brief description of what the app does]" />

<!-- Open Graph (Facebook, LinkedIn, etc.) -->
<meta property="og:title" content="[App Name] - [Tagline]" />
<meta property="og:description" content="[Brief description]" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="[App Name]" />
<meta property="og:image" content="[URL to preview image - 1200x630px recommended]" />
<meta property="og:url" content="[Full URL like https://appname.pawint-app.com]" />

<!-- Twitter/X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="[App Name]" />
<meta name="twitter:description" content="[Brief description]" />
<meta name="twitter:image" content="[URL to preview image]" />
```

### PWA (Progressive Web App) Support

```html
<!-- Theme & Mobile App -->
<meta name="theme-color" content="[Primary brand color hex]" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="[App Name]" />

<!-- Icons & Manifest -->
<link rel="icon" type="image/png" href="/favicon.png" />
<link rel="apple-touch-icon" href="/favicon.png" />
<link rel="manifest" href="/manifest.json" />
```

### Google Analytics 4

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=[GA4-ID]"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '[GA4-ID]');
</script>
```

### Required Environment Variables / Secrets

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection | Yes (auto-provided by Replit) |
| `SESSION_SECRET` | Session encryption | Yes |
| `RESEND_API_KEY` | Email notifications | If email notifications |
| `STRIPE_SECRET_KEY` | Stripe payments (sk_live_...) | If payments enabled |
| `STRIPE_PUBLISHABLE_KEY` | Stripe frontend (pk_live_...) | If payments enabled |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks | If payments enabled |
| `BLUESKY_HANDLE` | Bluesky posting | If social sharing |
| `BLUESKY_APP_PASSWORD` | Bluesky auth | If social sharing |
| `HEYGEN_API_KEY` | AI video generation | If video features |
| `MAILCHIMP_API_KEY` | Newsletter | If email marketing |
| `MAILCHIMP_LIST_ID` | Newsletter list | If email marketing |

### Email Notifications Setup (Resend)

**Step 1: Install package**
```bash
npm install resend
```

**Step 2: Create server/email.ts**
```typescript
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAIL = 'pawint@pawint-app.com';
const FROM_EMAIL = 'notifications@pawint-app.com';

export async function isEmailAvailable(): Promise<boolean> {
  return !!resend;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!resend) return false;
  try {
    const { error } = await resend.emails.send({
      from: `[App Name] <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    });
    return !error;
  } catch (e) {
    console.error('Email error:', e);
    return false;
  }
}

// Add app-specific email functions (customize templates per app)
export async function sendAdminNotification(subject: string, content: string) {
  return sendEmail(ADMIN_EMAIL, subject, content);
}
```

**Step 3: Add API endpoint in routes.ts**
```typescript
import * as email from "./email";

// Check email availability
app.get("/api/email/available", async (req, res) => {
  const available = await email.isEmailAvailable();
  res.json({ available });
});
```

**Step 4: Add RESEND_API_KEY secret**
- Use the same key across all apps: `re_JcAYcKVc_JsJVVnUcuivZC6gdyDPDDeMj`

**Step 5: Verify domain (one-time)**
- Go to resend.com/domains
- Add pawint-app.com
- Add DNS records in Squarespace

### Stripe Production Fix

**Problem:** App shows "Payment system not configured" (503 error) in production even though Stripe works in development.

**Root Cause:** Replit's Stripe connector doesn't carry over to production. Use environment variables instead.

**Step 1: Add Stripe Secrets**
In Replit Secrets, add:
- `STRIPE_SECRET_KEY` = your sk_live_... key
- `STRIPE_PUBLISHABLE_KEY` = your pk_live_... key

**Step 2: Update server/stripeClient.ts**
Update `getCredentials()` to check env vars FIRST:

```typescript
async function getCredentials() {
  // First, try environment variables (works in production)
  const envPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const envSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (envPublishableKey && envSecretKey) {
    console.log('Using Stripe credentials from environment variables');
    return {
      publishableKey: envPublishableKey,
      secretKey: envSecretKey,
    };
  }

  // Fall back to Replit connector (development)
  // ... rest of existing connector code ...
}
```

**Step 3: Republish the app**

**Note:** Use the same pk_live_ and sk_live_ keys from "Wint Ent" Stripe account across all apps.

### Cryptocurrency Payment Options

**Current Setup:** Stripe-only approach with Crypto.com partnership

**How to Enable Crypto via Stripe:**
1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Settings → Payment methods**
3. Enable **Crypto.com** integration (when available in your region)
4. Customers can pay with BTC, ETH, and other cryptocurrencies at checkout
5. No additional code changes required - Stripe handles the conversion

**Fallback: Coinbase Commerce (Backup Option)**

If Stripe's crypto option is unavailable or fails, Coinbase Commerce is pre-configured as a backup:

| Secret | Value |
|--------|-------|
| `COINBASE_COMMERCE_API_KEY` | 98b62b07-bf63-4434-acf0-d45224512566 |
| `COINBASE_COMMERCE_WEBHOOK_SECRET` | 4d0c276d-20c8-4b17-9b7f-d0e35578e79c |

**To Enable Coinbase Commerce:**
1. In `server/routes.ts`, update the `/api/crypto/available` endpoint:
   ```typescript
   app.get("/api/crypto/available", async (req, res) => {
     const { isCoinbaseCommerceConfigured } = await import("./coinbaseCommerce");
     res.json({ available: isCoinbaseCommerceConfigured() });
   });
   ```
2. The crypto button will automatically appear in the payment UI
3. Both Stripe and Coinbase Commerce can run simultaneously

**Customer FAQ:** The landing page includes a "How Payments Work" section explaining:
- Accepted payment methods (cards + crypto)
- Milestone payment structure (30/40/30)
- Security and refund policies

### manifest.json Template (public/manifest.json)

```json
{
  "name": "[App Full Name]",
  "short_name": "[App Name]",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "[Primary color hex]",
  "icons": [
    {
      "src": "/favicon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Standard Integrations Checklist

- [ ] **Replit Auth** - User login/signup
- [ ] **PostgreSQL Database** - Data persistence  
- [ ] **Stripe** - Payment processing (if needed)
- [ ] **Resend Email** - Notifications (if needed)
- [ ] **OpenAI** - AI features (if needed)
- [ ] **Favicon** - 192x192 PNG minimum
- [ ] **OG Image** - 1200x630 preview image for social shares

### Pre-Launch Verification

- [ ] All meta tags filled with actual content (no placeholders)
- [ ] Favicon uploaded and linked
- [ ] OG image created and hosted
- [ ] Test social share preview (use opengraph.xyz or similar)
- [ ] Mobile responsive design verified
- [ ] Dark mode support working
- [ ] All environment secrets configured
- [ ] Payment flow tested (if applicable)
- [ ] Email notifications tested (if applicable)
- [ ] API endpoints return correct responses

---

*Last updated: January 2026*
