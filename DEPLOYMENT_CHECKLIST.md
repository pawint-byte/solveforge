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
| `apphub.pawint-app.com` | App Hub | Pending verification |
| `glammarket.pawint-app.com` | Glam Market | To do |
| `kinship.pawint-app.com` | Kinship Chronicle | To do |
| `dca.pawint-app.com` | DCA Portfolio | To do |
| `storyweaver.pawint-app.com` | Story Weaver | To do |

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

*Last updated: January 2026*
