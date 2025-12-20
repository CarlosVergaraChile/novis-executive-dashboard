# Phase 1 Security Hardening - Executive Dashboard API

Comprehensive implementation guide for Phase 1 security improvements (C1-C5) of the NOVIS Executive Dashboard n8n workflow.

## Overview

This document provides detailed implementation instructions for all Phase 1 security hardening requirements:
- **C1**: Input Validation
- **C2**: Rate Limiting
- **C3**: Audit Logging  
- **C4**: Error Handling
- **C5**: CORS & Security Headers

---

## C1: Input Validation Node

### Implementation in n8n

**Node Type**: Code in JavaScript  
**Position**: After Webhook, before metrics calculation

```javascript
// C1: Input Validation
// Validates all webhook parameters before processing

const validateInput = (data) => {
  const errors = [];
  
  // Required fields validation
  if (!data.api_key) errors.push('Missing api_key parameter');
  if (!data.request_type) errors.push('Missing request_type');
  
  // Request type validation
  const validTypes = ['METRICS', 'REPORT', 'FORECAST'];
  if (data.request_type && !validTypes.includes(data.request_type)) {
    errors.push(`Invalid request_type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  // Date format validation (if provided)
  if (data.date) {
    if (isNaN(Date.parse(data.date))) {
      errors.push('Invalid date format. Use ISO 8601');
    }
  }
  
  // Numeric validation for optional parameters
  if (data.limit !== undefined) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      errors.push('Invalid limit. Must be numeric between 1-1000');
    }
  }
  
  return errors;
};

// Process all input items
for (const item of $input.all()) {
  const errors = validateInput(item.json);
  
  if (errors.length > 0) {
    // Mark as invalid with detailed error info
    item.json.valid = false;
    item.json.validation_errors = errors;
    item.json.http_status = 400;  // Bad Request
  } else {
    // Mark as valid and add processing metadata
    item.json.valid = true;
    item.json.processed_at = new Date().toISOString();
    item.json.validation_passed = true;
  }
}

return $input.all();
```

### Error Response Handling

When validation fails, the Respond node should return:

```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "Input validation failed",
  "errors": ["Missing api_key parameter"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## C2: Rate Limiting

### Implementation Strategy

**Approach**: In-memory request tracking with sliding window  
**Limits**: 100 requests per minute per API key  

```javascript
// C2: Rate Limiting (Add to a new Code node after Webhook)

const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms
const MAX_REQUESTS_PER_WINDOW = 100;

// Initialize or retrieve request tracking (use n8n global state)
global.requestTracking = global.requestTracking || {};

for (const item of $input.all()) {
  const apiKey = item.json.api_key;
  const now = Date.now();
  
  // Initialize tracking for this API key if needed
  if (!global.requestTracking[apiKey]) {
    global.requestTracking[apiKey] = {
      requests: [],
      blocked_until: null
    };
  }
  
  const tracking = global.requestTracking[apiKey];
  
  // Clean up old requests outside the window
  tracking.requests = tracking.requests.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  // Check if currently blocked
  if (tracking.blocked_until && now < tracking.blocked_until) {
    item.json.rate_limited = true;
    item.json.retry_after_seconds = Math.ceil((tracking.blocked_until - now) / 1000);
    item.json.http_status = 429;  // Too Many Requests
    continue;
  }
  
  // Check if adding this request exceeds limit
  if (tracking.requests.length >= MAX_REQUESTS_PER_WINDOW) {
    // Block for next 30 seconds
    tracking.blocked_until = now + 30000;
    item.json.rate_limited = true;
    item.json.retry_after_seconds = 30;
    item.json.http_status = 429;
  } else {
    // Accept request
    tracking.requests.push(now);
    item.json.rate_limited = false;
    item.json.requests_remaining = MAX_REQUESTS_PER_WINDOW - tracking.requests.length;
  }
}

return $input.all();
```

### Rate Limit Response

```json
{
  "status": "error",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please retry after 30 seconds",
  "retry_after_seconds": 30
}
```

---

## C3: Audit Logging

### Logging Strategy

Log all API requests and responses for compliance and debugging.

```javascript
// C3: Audit Logging (Add after metrics calculation)

for (const item of $input.all()) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    api_key_hash: item.json.api_key ? item.json.api_key.substring(0, 8) + '***' : 'unknown',
    request_type: item.json.request_type || 'unknown',
    status: item.json.valid ? 'VALID' : 'INVALID',
    http_status: item.json.http_status || 200,
    rate_limited: item.json.rate_limited || false,
    processing_time_ms: item.json.processing_time_ms || 0,
    user_agent: item.json.headers?.['user-agent'] || 'unknown',
    ip_address: item.json.headers?.['x-forwarded-for'] || 'unknown'
  };
  
  // Add audit log to output
  item.json.audit_log = auditLog;
}

return $input.all();
```

### Log Storage

For production, integrate with a logging service:
- **Cloud**: Google Cloud Logging, CloudWatch
- **Self-hosted**: ELK Stack, Splunk
- **n8n Integration**: Create separate workflow to forward logs

---

## C4: Enhanced Error Handling

### Error Handling Node

```javascript
// C4: Error Handling (Add after response node)

const buildErrorResponse = (item) => {
  const errors = item.json.validation_errors || [];
  
  return {
    status: 'error',
    code: 'UNKNOWN_ERROR',
    message: 'An error occurred processing your request',
    details: process.env.NODE_ENV === 'development' ? errors : [],
    request_id: item.json.request_id || 'unknown',
    timestamp: new Date().toISOString()
  };
};

// Wrap each item with error handling
for (const item of $input.all()) {
  try {
    // Metrics calculation or other processing
    if (item.json.valid) {
      item.json.processing_status = 'SUCCESS';
    } else {
      item.json.processing_status = 'VALIDATION_FAILED';
      item.json.error_response = buildErrorResponse(item);
    }
  } catch (error) {
    item.json.processing_status = 'PROCESSING_ERROR';
    item.json.error_message = error.message;
    item.json.error_response = buildErrorResponse(item);
  }
}

return $input.all();
```

---

## C5: CORS & Security Headers

### Webhook Configuration

**In n8n Webhook node > Settings**:

1. **Enable Header Auth**: ✓ (Already configured)  
2. **Add to Respond node**:

```javascript
// C5: Security Headers (Add in Respond node custom headers)
{
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache"
}
```

### CORS Policy

For dashboard integration:

```javascript
// C5: CORS Handling (Add before Respond node)

const allowedOrigins = [
  'https://carlosvergarachile.github.io',
  'https://your-domain.com',
  'http://localhost:3000'  // Development only
];

for (const item of $input.all()) {
  const origin = item.json.headers?.['origin'] || 'unknown';
  
  if (allowedOrigins.includes(origin)) {
    item.json.cors_allowed = true;
    item.json.response_headers = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      'Access-Control-Max-Age': '3600'
    };
  } else {
    item.json.cors_allowed = false;
  }
}

return $input.all();
```

---

## Implementation Checklist

- [ ] C1: Input Validation node created and connected
- [ ] C2: Rate Limiting node created and tracking initialized
- [ ] C3: Audit Logging implemented
- [ ] C4: Error Handling enhanced
- [ ] C5: Security Headers and CORS configured
- [ ] Workflow tested with valid/invalid inputs
- [ ] Rate limiting verified
- [ ] Error responses validated
- [ ] Security headers confirmed in response
- [ ] Workflow republished and versioned

---

## Testing

### Test Cases

1. **Valid Request**
   ```bash
   curl -X GET "https://orquesta.app.n8n.cloud/webhook/executive-metrics?request_type=METRICS&api_key=valid_key"
   -H "x-api-key: NOVIS_EXEC_DASHBOARD_KEY"
   ```

2. **Invalid Request (Missing Parameter)**
   ```bash
   curl -X GET "https://orquesta.app.n8n.cloud/webhook/executive-metrics"
   -H "x-api-key: NOVIS_EXEC_DASHBOARD_KEY"
   ```

3. **Rate Limited**
   - Send 100+ requests in 60 seconds
   - Expect 429 response on 101st request

---

## Next Steps

After Phase 1 completion:
- Phase 2: Advanced Monitoring & Analytics
- Phase 3: Disaster Recovery & Backup
- Phase 4: Performance Optimization
