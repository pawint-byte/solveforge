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
| `STRIPE_SECRET_KEY` | Stripe payments | If payments enabled |
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
