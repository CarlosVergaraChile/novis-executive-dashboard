// config.example.js - NOVIS Executive Dashboard Configuration
// Copy this file to config.prod.js and fill in with your production values

const NOVIS_CONFIG = {
  api: {
    baseUrl: 'https://n8n.your-domain.com',
    endpoint: '/webhook/executive-metrics',
    version: '1.0',
    timeout: 10000,
    retryAttempts: 3,
    retryDelayMs: 2000
  },
  auth: {
    apiKey: 'sk_prod_your_api_key_here',
    method: 'header',
    headerName: 'x-api-key'
  },
  client: {
    id: 'client_abc123',
    name: 'Finance Corp',
    environment: 'production'
  },
  features: {
    demoMode: false,
    offlineMode: true,
    healthCheckEnabled: true,
    healthCheckIntervalMs: 60000
  },
  ui: {
    refreshIntervalMs: 300000,
    chartHistoryDays: 7,
    timeFormat: 'es-CL'
  },
  logging: {
    level: 'info',
    enableConsole: true,
    enableRemote: false
  }
};

if (typeof NOVIS_CONFIG === 'undefined') {
  console.warn('[Dashboard] Config not loaded, using defaults');
  var NOVIS_CONFIG = {
    api: { baseUrl: 'http://localhost:5678', endpoint: '/webhook/executive-metrics', timeout: 10000 },
    auth: { apiKey: 'demo_key_12345', headerName: 'x-api-key' },
    features: { demoMode: true, offlineMode: true, healthCheckEnabled: true },
    logging: { level: 'info', enableConsole: true }
  };
}
