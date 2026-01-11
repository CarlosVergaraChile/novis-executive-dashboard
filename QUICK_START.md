# Quick Start Guide: NOVIS Executive Dashboard

⚡ **5 minutes to production-ready dashboard**

---

## Step 1: Clone & Setup (1 min)

```bash
git clone https://github.com/CarlosVergaraChile/novis-executive-dashboard.git
cd novis-executive-dashboard
cp config.example.js config.prod.js
```

---

## Step 2: Configure Your API (2 min)

Edit `config.prod.js`:

```javascript
const NOVIS_CONFIG = {
  api: {
    baseUrl: 'https://your-n8n-instance.com',  // YOUR n8n URL HERE
    endpoint: '/webhook/executive-metrics',
    timeout: 10000
  },
  auth: {
    apiKey: 'sk_prod_your_api_key_here',  // YOUR API KEY HERE
    headerName: 'x-api-key'
  },
  client: {
    id: 'your_client_id',
    name: 'Your Company',
    environment: 'production'
  },
  features: {
    demoMode: false,  // Set to true for testing
    offlineMode: true,
    healthCheckEnabled: true,
    healthCheckIntervalMs: 60000  // Check every 60 seconds
  }
};
```

---

## Step 3: Deploy to GitHub Pages (1 min)

```bash
# .gitignore already protects config.prod.js
git add .
git commit -m "Deploy NOVIS dashboard with production config"
git push origin main

# GitHub Pages deploys automatically
# Access at: https://yourusername.github.io/novis-executive-dashboard
```

---

## Step 4: Verify Health & Monitor (1 min)

Open your dashboard URL in browser:

```
https://yourusername.github.io/novis-executive-dashboard
```

**Look for:**
- ✅ Green indicator = Webhook is healthy
- ⚠️ Yellow indicator = Webhook slow (>500ms)
- 🔴 Red indicator = Webhook down (Demo Mode active)

**Check health in browser console:**

```javascript
// Open DevTools (F12), paste in Console:
window.dashboardHealth.checkHealth();
console.log(window.dashboardHealth.webhookStatus);
console.log(window.dashboardHealth.lastLatency);
console.log(window.dashboardHealth.isDemoMode);
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard shows DEMO mode | Check API URL and Key in config.prod.js |
| 404 error on page load | Enable GitHub Pages in repo settings |
| Health check not updating | Open browser console, check for CORS errors |
| Slow latency (>1s) | Check n8n webhook endpoint performance |

---

## Next Steps

1. **Review Architecture**: Read `ECOSYSTEM_ARCHITECTURE.md`
2. **Understand Data Contract**: Review `METRICS_SCHEMA.md`
3. **Security Hardening**: Follow `SECURITY_MODEL.md`
4. **Monitor Health**: Use browser console commands above
5. **Plan v2 Roadmap**: See `ARCHITECTURE_IMPLEMENTATION_SUMMARY.md`

---

## Key Features You Now Have

✅ Real-time KPI dashboard (execution count, time saved, cost savings, ROI)  
✅ Automatic health checks every 60 seconds  
✅ Fallback to Demo Mode on webhook failure  
✅ Beautiful UI with color-coded health status  
✅ Externalized configuration (no secrets in repo)  
✅ Latency monitoring & request tracing  
✅ Offline mode with localStorage cache  

---

## Production Checklist

Before going live, verify:

- [ ] API URL and Key are correct in `config.prod.js`
- [ ] n8n webhook endpoint returns valid JSON
- [ ] Dashboard loads without console errors
- [ ] Health check shows green (healthy) status
- [ ] GitHub Pages is enabled in Settings → Pages
- [ ] Custom domain configured (if using one)
- [ ] HTTPS is enabled (GitHub Pages default)
- [ ] Team members have dashboard URL

---

## Support

**Questions?** Check these docs in order:
1. `README.md` - General overview
2. `HEALTH_MONITORING.md` - Health check questions
3. `METRICS_SCHEMA.md` - Data/metrics questions
4. `SECURITY_MODEL.md` - Security/compliance questions
5. `ECOSYSTEM_ARCHITECTURE.md` - Architecture questions

---

**Version:** 1.0  
**Time to Production:** ~5 minutes  
**Difficulty:** Beginner-Friendly  
**Status:** Ready Now ✨
