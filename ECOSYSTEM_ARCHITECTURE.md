# Ecosystem Architecture: NOVIS Executive Dashboard

## 1. Propósito y Alineamiento Estratégico

El **NOVIS Executive Dashboard** es la interfaz ejecutiva del ecosistema de automatización **NOVIS AI CORE**, diseñada para alinear explícitamente las capacidades de orquestación de procesos (n8n) con objetivos de negocio del cliente:
- Reducción de costos operacionales mediante automatización.
- Mejora de ciclos de proceso y reducción de errores manuales.
- Visibilidad en tiempo real de ROI y valor entregado.

Este dashboard no es un artefacto aislado, sino el "front-door" del ecosistema, conectando datos, orquestación y decisión ejecutiva.

---

## 2. Contexto de Negocio

### Drivers de Valor
| Driver | Descripción | Métrica del Dashboard |
|--------|-------------|----------------------|
| **Eficiencia operacional** | Reducción de horas manuales en procesos | `total_time_saved_hours` |
| **Reducción de costos** | Ahorro en mano de obra y procesos | `total_cost_savings_usd` |
| **Escalabilidad** | Volumen de transacciones automatizadas sin aumento de headcount | `total_executions` |
| **Calidad y compliance** | Reducción de errores, auditoría y trazabilidad | *N/A en v1 (roadmap)* |

### Stakeholders Clave
- **CFO / Finanzas**: ROI, ahorro acumulado, payback period.
- **COO / Operaciones**: Ejecuciones automatizadas, tiempo ahorrado, procesos in-flight.
- **CIO / TI**: Uptime del dashboard, disponibilidad de datos, seguridad y auditoría.

---

## 3. Arquitectura de Ecosistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE EXPERIENCIA                          │
│          Executive Dashboard (GitHub Pages / HTML+JS)            │
│  - KPI Cards (Ejecuciones, Ahorro, ROI)                        │
│  - Gráficos históricos (24h, 7d, 30d)                          │
│  - Health & Observabilidad                                      │
│  - Demo Mode & Configuración de API                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │ GET /webhook/executive-metrics
                          │ (header: x-api-key)
┌─────────────────────────▼───────────────────────────────────────┐
│              CAPA DE ORQUESTACIÓN & DATOS                        │
│              n8n AI CORE (Webhooks & Flujos)                    │
│  - Flujo: Consolidación de métricas de automatización           │
│  - Flujo: Cálculo de ROI (tiempo, costos, ahorro)              │
│  - Flujo: Agregar ejecuciones, errores, duración               │
│  - Flujo: Publicar payload a webhook de dashboard               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│ Data Warehouse│  │ Operational │  │  AI Models  │
│  (BigQuery)   │  │   DB (SQL)  │  │   (n8n)    │
└───────────────┘  └─────────────┘  └─────────────┘
```

---

## 4. Dominios de Arquitectura

### Dominio de Negocio
- **Procesos automatizados**: backoffice, finanzas, logística, RH, compliance.
- **Métricas de éxito**: ejecuciones completadas, tiempo ahorrado, ROI %.

### Dominio de Datos
- **Productores**: n8n (flujos que cuentan ejecuciones, tiempos, costos).
- **Consumidores**: Executive Dashboard, SAC/Power BI, Data Warehouse.
- **Contrato**: JSON con KPIs (ver `METRICS_SCHEMA.md`), versión de API, timestamps.

### Dominio de Aplicaciones
- **Orquestación**: n8n (flujos, webhooks, cálculos de KPI).
- **Experiencia**: Dashboard HTML5 + JavaScript (GitHub Pages o CDN).
- **Integración**: API REST, webhooks, headers de seguridad.

### Dominio Técnico
- **Backend**: n8n self-hosted o cloud, con webhook `/webhook/executive-metrics`.
- **Frontend**: `index.html` + configuración externalizada (`config.prod.js`).
- **Almacenamiento**: localStorage para caché local, modo offline.
- **Seguridad**: API Key por header, CORS, IP allowlist, Zero-Trust (roadmap).

---

## 5. Flujos de Datos

### Happy Path: Webhook → Dashboard

```
[n8n Flujo]
  → Agrega ejecuciones de último período
  → Calcula tiempo ahorrado (horas)
  → Calcula ahorro ($USD)
  → Calcula ROI (%)
  → POST a /webhook/executive-metrics con payload JSON

[Dashboard en cliente navegador]
  → GET /webhook/executive-metrics (con x-api-key)
  → Recibe { total_executions, total_time_saved_hours,
             total_cost_savings_usd, roi_percent, updated_at, api_version }
  → Renderiza KPI Cards
  → Guarda en localStorage
  → Muestra última actualización y health
```

---

## 6. Ciclo de Vida

| Fase | Descripción | Artefacto |
|------|-------------|----------|
| **Diseño & Validación** | Alineamiento con cliente, métricas de éxito | `PROJECT_SUMMARY.md` |
| **Implementación & Integración** | Setup n8n, endpoint webhook, config dashboard | `IMPLEMENTATION_GUIDE.md` |
| **Hardening & Seguridad** | API Key, auditoría, logging, Zero-Trust | `SECURITY_MODEL.md` |
| **Go-Live & Operación** | Checklist final, monitoreo, alertas | `GO_LIVE_CHECKLIST.md` |
| **Auditoría & Mejora** | Auditoría post-despliegue, deuda técnica | `SYSTEM_AUDIT_COMPLETE.md` |

---

## 7. Roadmap

### v1 (Actual)
- ✅ Dashboard HTML + JS con KPI Cards
- ✅ Integración webhook con n8n
- ✅ Modo Demo
- ✅ Seguridad básica (API Key)

### v2
- 🔲 Externalizar config (env vars, config.js)
- 🔲 Health & observabilidad avanzada
- 🔲 Zero-Trust / IAM corporativo
- 🔲 Integración con SAC/Fabric para BI avanzado

### v3
- 🔲 Alertas automáticas (Slack, email)
- 🔲 Comparativa multi-cliente (benchmark)
- 🔲 Predicción de ROI con ML
- 🔲 Integración con sistemas de compliance

---

## 8. Referencias

- `METRICS_SCHEMA.md`: Contrato formal de KPIs y payload JSON.
- `SECURITY_MODEL.md`: Modelo de seguridad de ecosistema (Zero-Trust, IAM).
- `PHASE1_SECURITY_HARDENING.md`: Medidas de seguridad implementadas.
- `GO_LIVE_CHECKLIST.md`: Validación pre-producción.
- `SYSTEM_AUDIT_COMPLETE.md`: Auditoría post-despliegue.

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Estado**: Activo
