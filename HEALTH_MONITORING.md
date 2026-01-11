# Health Monitoring: DashboardHealth Class

## Overview

The **DashboardHealth** class provides real-time monitoring of the dashboard's connection to the n8n webhook API, displaying system health status, latency measurements, and automatic fallback to Demo Mode on failures.

---

## Class Structure

### Constructor

```javascript
const health = new DashboardHealth(config);
```

**Parameters:**
- `config` (object): Configuration object from `NOVIS_CONFIG` with `api`, `auth`, `features` sections

**Properties:**
- `config`: Stores configuration
- `lastUpdateTime`: Timestamp of last successful health check
- `lastLatency`: HTTP response time in milliseconds
- `webhookStatus`: Current status ('healthy', 'degraded', 'error')
- `isDemoMode`: Boolean indicating if Demo Mode is active

---

## Methods

### `async checkHealth()`

Performs a GET request to the webhook endpoint and updates UI with health status.

**What it does:**
1. Checks if health checks are enabled in config
2. Measures request latency
3. Validates webhook response
4. Updates UI with status, latency, and mode
5. Activates Demo Mode on failure

**Error Handling:**
- Catches network errors, timeouts, and HTTP errors
- Logs errors to console
- Automatically activates Demo Mode as fallback

### `updateHealthUI(status, latency)`

Updates the HTML health status section with current system state.

**Parameters:**
- `status` (string): 'healthy', 'degraded', or 'error'
- `latency` (number): Response time in ms, or null if no response

**Updates:**
- Health indicator color (green/yellow/red)
- Status text message
- Latency display
- Mode badge (DEMO / REAL)
- Last update timestamp

### `activateDemoMode()`

Sets demo mode flag and logs activation to console.

### `generateCorrelationId()`

Generates unique request ID for tracing and debugging.

**Format:** `req_{timestamp}_{random}`

---

## UI Components

The health status section displays:

```html
<div id="health-status" class="health-section">
  <span id="health-indicator"></span>  <!-- Color indicator -->
  <span id="health-text"></span>        <!-- Status text -->
  <div id="last-update"></div>         <!-- Last update time -->
  <div id="latency-info"></div>        <!-- Latency + mode badge -->
</div>
```

### Status Colors

| Status | Color | Meaning |
|--------|-------|----------|
| healthy | Green (#10b981) | Webhook responding normally |
| degraded | Yellow (#f59e0b) | Webhook responding but slow |
| error | Red (#ef4444) | Webhook failed, using Demo Mode |

---

## Configuration

Health checks are controlled by `NOVIS_CONFIG.features`:

```javascript
features: {
  healthCheckEnabled: true,          // Enable/disable health checks
  healthCheckIntervalMs: 60000       // Check interval (default: 60 seconds)
}
```

---

## Demo Mode

When the webhook fails:
1. Dashboard automatically activates Demo Mode
2. UI shows "DEMO" badge instead of "REAL"
3. Example data is displayed (defined in `getDemoMetrics()`)
4. System continues to retry health checks
5. User is informed of the issue visually

---

## Correlation IDs

Each health check request includes a `x-correlation-id` header for:
- Request tracing in logs
- Debugging webhook issues
- Auditing and monitoring

**Example:** `x-correlation-id: req_1705008000000_a1b2c3d`

---

## Integration

### Automatic Initialization

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const config = window.NOVIS_CONFIG || getDefaultConfig();
  window.dashboardHealth = new DashboardHealth(config);
  await window.dashboardHealth.checkHealth();
  
  if (config.features?.healthCheckEnabled) {
    setInterval(() => window.dashboardHealth.checkHealth(), 
                config.features.healthCheckIntervalMs);
  }
});
```

### Access from Console

Once initialized, you can access health monitoring from the browser console:

```javascript
// Check health immediately
window.dashboardHealth.checkHealth();

// Get current status
console.log(window.dashboardHealth.webhookStatus);
console.log(window.dashboardHealth.lastLatency);
console.log(window.dashboardHealth.isDemoMode);
```

---

## Roadmap (v2+)

- 🔲 Persistent health history (charts of latency over time)
- 🔲 Alert thresholds (e.g., alert if latency > 1000ms)
- 🔲 Automatic retry exponential backoff
- 🔲 Health status webhooks (notify Slack/email on failures)
- 🔲 Load testing metrics
- 🔲 Integration with SIEM/monitoring systems

---

**Version:** 1.0  
**Last Updated:** January 2026
