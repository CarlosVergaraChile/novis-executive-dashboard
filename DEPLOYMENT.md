# Deployment Guide: NOVIS Executive Dashboard

Detailed step-by-step guide to deploy to production.

---

## Prerequisites

- Git installed locally
- GitHub account with access to this repo
- n8n instance with webhook `/webhook/executive-metrics` configured
- API Key for n8n authentication

---

## Step 1: Configure (2 minutes)

### 1.1 Clone the repository

```bash
git clone https://github.com/CarlosVergaraChile/novis-executive-dashboard.git
cd novis-executive-dashboard
```

### 1.2 Copy config template

```bash
cp config.example.js config.prod.js
```

**NOTE:** `config.prod.js` is in `.gitignore` and will NOT be committed to GitHub (safe!).

### 1.3 Edit configuration

```bash
# Use your favorite editor (nano, vim, vscode, etc.)
vim config.prod.js
```

**Find and replace these values:**

```javascript
const NOVIS_CONFIG = {
  api: {
    baseUrl: 'https://your-n8n-instance.com',  // ← REPLACE WITH YOUR n8n URL
    endpoint: '/webhook/executive-metrics',     // ← Leave as is
    version: '1.0',
    timeout: 10000,
    retryAttempts: 3,
    retryDelayMs: 2000
  },
  auth: {
    apiKey: 'sk_prod_your_api_key_here',      // ← REPLACE WITH YOUR API KEY
    method: 'header',
    headerName: 'x-api-key'
  },
  client: {
    id: 'your_client_id',                      // ← REPLACE WITH YOUR CLIENT ID
    name: 'Your Company Name',                 // ← REPLACE WITH YOUR COMPANY
    environment: 'production'
  },
  features: {
    demoMode: false,  // ← Set to FALSE for production
    offlineMode: true,
    healthCheckEnabled: true,
    healthCheckIntervalMs: 60000  // Health check every 60 seconds
  },
  ui: {
    refreshIntervalMs: 300000,  // Refresh every 5 minutes
    chartHistoryDays: 7,
    timeFormat: 'es-CL'  // Change to your locale (en-US, es-ES, etc.)
  },
  logging: {
    level: 'info',  // Can be 'debug', 'info', 'warn', 'error'
    enableConsole: true,
    enableRemote: false
  }
};
```

### 1.4 Verify configuration

Make sure you see your values in `config.prod.js`:

```bash
grep -n "baseUrl\|apiKey\|id:" config.prod.js
```

Expected output:
```
3:    baseUrl: 'https://your-n8n-instance.com',
...
12:    apiKey: 'sk_prod_your_api_key_here',
```

---

## Step 2: Deploy (1 minute)

### 2.1 Check git status

```bash
git status
```

Expected output:
```
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        config.prod.js

nothing added to commit but untracked files not staged for commit
```

**Good!** `config.prod.js` is NOT in the commit (it's in `.gitignore`).

### 2.2 Push to GitHub

```bash
git add .
git commit -m "chore: Deploy NOVIS dashboard with production configuration"
git push origin main
```

Expected output:
```
[main abc1234] chore: Deploy NOVIS dashboard with production configuration
 1 file changed, ...
remote: Create a pull request for 'main' on GitHub by visiting:
remote:      https://github.com/CarlosVergaraChile/novis-executive-dashboard/pull/...
```

### 2.3 Verify GitHub Pages deployment

GitHub Pages automatically deploys from the `main` branch.

**Your dashboard is now live at:**
```
https://<your-github-username>.github.io/novis-executive-dashboard
```

Replace `<your-github-username>` with your actual GitHub username.

---

## Step 3: Monitor (1 minute)

### 3.1 Open dashboard in browser

Navigate to your live dashboard:
```
https://<your-github-username>.github.io/novis-executive-dashboard
```

### 3.2 Check health status

Look at the top of the page for the **Health Status** section:

- ✅ **Green indicator** = Webhook is healthy (good!)
- ⚠️ **Yellow indicator** = Webhook is slow (latency > 500ms)
- 🔴 **Red indicator** = Webhook down (Demo Mode active)

### 3.3 Monitor with browser console

Press `F12` (or `Cmd+Option+I` on Mac) to open Developer Tools.

Go to the **Console** tab and run these commands:

```javascript
// Check health immediately
window.dashboardHealth.checkHealth();

// View health status
console.log('Webhook Status:', window.dashboardHealth.webhookStatus);
console.log('Last Latency:', window.dashboardHealth.lastLatency, 'ms');
console.log('Demo Mode:', window.dashboardHealth.isDemoMode);
```

Expected output:
```
Webhook Status: healthy
Last Latency: 234 ms
Demo Mode: false
```

### 3.4 Refresh automatically

Health checks run automatically every 60 seconds. Watch the "Last update" timestamp change.

---

## Troubleshooting

### Issue: Dashboard shows DEMO Mode

**Cause:** Webhook is not responding.

**Fix:**
1. Check `config.prod.js` - is `baseUrl` correct?
2. Check `apiKey` - is it valid for your n8n instance?
3. Check n8n webhook endpoint exists and returns valid JSON
4. Open browser console (F12) and look for CORS or 401/403 errors

### Issue: 404 error on dashboard

**Cause:** GitHub Pages not configured or domain wrong.

**Fix:**
1. Go to repo Settings → Pages
2. Verify "Source" is set to "Deploy from a branch"
3. Verify "Branch" is set to "main / (root)"
4. Wait 1 minute for GitHub Pages to rebuild
5. Try accessing the URL again

### Issue: Health check not updating

**Cause:** CORS (Cross-Origin Resource Sharing) error.

**Fix:**
1. Open browser console (F12)
2. Look for error: `Access to XMLHttpRequest blocked by CORS policy`
3. Ensure n8n webhook endpoint has CORS enabled
4. Try with `demoMode: true` in config temporarily to test dashboard

### Issue: Slow latency (>1 second)

**Cause:** n8n webhook is slow.

**Fix:**
1. Check n8n instance performance
2. Reduce `healthCheckIntervalMs` to check less frequently (e.g., 300000 = 5 min)
3. Monitor n8n logs for slow queries or timeouts

---

## Verification Checklist

Before considering production-ready, verify all items:

- [ ] `config.prod.js` is created and NOT in Git
- [ ] `baseUrl` in `config.prod.js` is correct (your n8n URL)
- [ ] `apiKey` in `config.prod.js` is valid
- [ ] Dashboard loads without 404 or CORS errors
- [ ] Health status shows green (healthy) indicator
- [ ] Health check updates every 60 seconds
- [ ] Browser console has no errors
- [ ] Team members can access the dashboard URL
- [ ] n8n webhook `/webhook/executive-metrics` returns valid JSON
- [ ] `demoMode` is set to `false` in `config.prod.js`

---

## Post-Deployment

### Monitor Daily

```javascript
// Paste in console every morning
window.dashboardHealth.checkHealth();
console.log('✅ Status:', window.dashboardHealth.webhookStatus);
```

### Update Config (if needed)

```bash
# Edit config
vim config.prod.js

# Commit and push
git add . && git commit -m "chore: Update dashboard config" && git push origin main
```

### Troubleshoot Issues

See troubleshooting section above or check:
- `QUICK_START.md` - Fast reference
- `HEALTH_MONITORING.md` - Health check deep dive
- `SECURITY_MODEL.md` - Security troubleshooting
- `README.md` - General FAQ

---

**Deployment Complete!** ✨

Your NOVIS Executive Dashboard is now live and monitoring your n8n automation metrics in real-time.

---

**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Status:** Production-Ready
