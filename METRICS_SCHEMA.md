# Metrics Schema: NOVIS Executive Dashboard

## 1. Propósito

Este documento define el **contrato de datos** (schema JSON) que intercambian n8n (productor) y el Executive Dashboard (consumidor).

---

## 2. Endpoint del Webhook

```
GET /webhook/executive-metrics
Host: {n8n_instance}
Header: x-api-key: {API_KEY}
```

---

## 3. Respuesta JSON (Schema v1)

```json
{
  "api_version": "1.0",
  "timestamp": "2026-01-11T10:00:00Z",
  "period": {
    "start": "2026-01-10T00:00:00Z",
    "end": "2026-01-11T10:00:00Z",
    "granularity": "last_24h"
  },
  "metrics": {
    "total_executions": 1248,
    "total_time_saved_hours": 156.75,
    "total_cost_savings_usd": 4702.50,
    "roi_percent": 234.5,
    "success_rate_percent": 98.76,
    "average_execution_time_seconds": 45.2,
    "processes_automated": 12,
    "manual_effort_avoided": {
      "hours": 156.75,
      "ftes_equivalent": 0.2
    },
    "cost_breakdown": {
      "labor_saved_usd": 3500.00,
      "infrastructure_cost_usd": -500.00,
      "license_cost_usd": -297.50
    }
  },
  "health": {
    "data_freshness_minutes": 5,
    "last_execution": "2026-01-11T10:00:00Z",
    "webhook_status": "healthy",
    "data_quality_score": 0.99
  },
  "metadata": {
    "client_id": "client_abc123",
    "environment": "production",
    "source_system": "n8n_ai_core"
  }
}
```

---

## 4. Especificación de Campos

### 4.1 Nivel Raíz

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|----------|
| `api_version` | string | ✅ | Versión del contrato (ej: "1.0"). |
| `timestamp` | ISO8601 | ✅ | Timestamp UTC de generación del payload. |
| `period` | object | ✅ | Período de datos agregados. |
| `metrics` | object | ✅ | KPIs de negocio. |
| `health` | object | ✅ | Indicadores técnicos de salud. |
| `metadata` | object | ✅ | Contexto (cliente, ambiente, sistema origen). |

### 4.2 Objeto `metrics`

| Campo | Tipo | Unidad | Descripción |
|-------|------|--------|----------|
| `total_executions` | integer | - | Total de automatizaciones ejecutadas. |
| `total_time_saved_hours` | float | horas | Horas de trabajo manual evitadas. |
| `total_cost_savings_usd` | float | USD | Ahorro neto total. |
| `roi_percent` | float | % | Retorno sobre inversión (>100% es ganancia neta). |
| `success_rate_percent` | float | % | Tasa de éxito (0-100). |
| `average_execution_time_seconds` | float | segundos | Tiempo promedio por ejecución. |
| `processes_automated` | integer | - | Número de procesos únicos automatizados. |

### 4.3 Objeto `health`

| Campo | Tipo | Valores | Descripción |
|-------|------|--------|----------|
| `data_freshness_minutes` | integer | 0-NN | Minutos desde la última actualización. |
| `last_execution` | ISO8601 | - | Timestamp de la última ejecución. |
| `webhook_status` | string | `healthy`, `degraded`, `error` | Estado del endpoint webhook. |
| `data_quality_score` | float | 0.0-1.0 | Puntuación de integridad de datos. |

---

## 5. Reglas de Validación

### 5.1 Umbrales de Alerta (Dashboard)

| Condición | Severidad | Acción |
|-----------|-----------|--------|
| `data_freshness_minutes` > 60 | ⚠️ WARNING | Banner: "Datos desactualizados" |
| `success_rate_percent` < 95% | ⚠️ WARNING | Banner: "Tasa de éxito baja" |
| `webhook_status` = "error" | 🔴 CRITICAL | Modal: "No hay conexión con n8n" |
| `roi_percent` < 0 | 🔴 CRITICAL | Banner: "ROI negativo" |

---

## 6. Versionado y Evolución

### 6.1 Política de Cambios

- **Adición de campo nuevo**: bump minor version (ej: 1.0 → 1.1). Clientes antiguos lo ignoran.
- **Cambio de tipo de campo**: bump major version (ej: 1.0 → 2.0). Requiere actualización de cliente.
- **Eliminación de campo**: Solo en major version.

### 6.2 Histórico de Versiones

| Versión | Fecha | Cambios |
|---------|-------|----------|
| 1.0 | 2026-01-11 | Inicial: total_executions, time_saved, cost_savings, roi, health metadata |
| 1.1 (Roadmap) | Q1 2026 | Agregar cost_breakdown detallado, success_rate |
| 2.0 (Roadmap) | Q2 2026 | Cambio de granularity: de string a object |

---

## 7. Validación en Dashboard

```javascript
function validateMetricsSchema(data) {
  const required = ['api_version', 'timestamp', 'metrics', 'health', 'metadata'];
  return required.every(field => field in data) &&
         typeof data.metrics.total_executions === 'number' &&
         typeof data.metrics.total_time_saved_hours === 'number' &&
         typeof data.metrics.total_cost_savings_usd === 'number';
}
```

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Estado**: Activo
