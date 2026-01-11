# Security Model: NOVIS Executive Dashboard

## 1. Principios de Seguridad

El modelo de seguridad se basa en:
1. **Defense in Depth**: múltiples capas de control (autenticación, autorización, encriptación, auditoría).
2. **Zero-Trust Architecture**: verificar todo, no confiar en nada por defecto.
3. **Least Privilege**: mínimos permisos necesarios para cada actor.
4. **Assume Breach**: diseñar como si los controles más externos ya fallaron.
5. **Privacy by Design**: proteger datos sensibles desde el diseño.

---

## 2. Amenazas Identificadas

### 2.1 Exposición de KPIs Sensibles
**Riesgo**: Los KPIs son información confidencial.

**Controles v1**:
- ✅ API Key en header `x-api-key`
- ✅ Validación de payload (schema JSON)
- ✅ localStorage con caché local
- ✅ Auditoría de accesos

**Controles v2+**:
- 🔲 CORS restrictivo
- 🔲 Rate Limiting
- 🔲 Encriptación end-to-end
- 🔲 IP allowlist
- 🔲 Firma digital de payload (HMAC-SHA256)

---

### 2.2 Scraping del Dashboard
**Riesgo**: Extracción sistemática de métricas.

**Controles v1**:
- ✅ Modo Demo con datos de ejemplo
- ✅ localStorage local
- ✅ Autenticación por API key

**Controles v2+**:
- 🔲 WAF (Web Application Firewall)
- 🔲 Behavioral analysis
- 🔲 Session binding
- 🔲 CAPTCHA en acceso repetido

---

### 2.3 Man-in-the-Middle (MITM) en Webhook
**Riesgo**: Intercepciones e inyecciones de datos falsos.

**Controles v1**:
- ✅ HTTPS obligatorio
- ✅ API Key en header
- ✅ Validación de payload

**Controles v2+**:
- 🔲 Firma digital de payload
- 🔲 Certificate pinning
- 🔲 Mutual TLS (mTLS)
- 🔲 Nonce + timestamp

---

### 2.4 Robo de API Key
**Riesgo**: Key expuesta en código, logs, historial de Git.

**Controles v1**:
- ✅ API Key en variable de entorno
- ✅ Auditoría de rotación
- ✅ `.gitignore` con archivo `config.prod.js`

**Controles v2+**:
- 🔲 Versionado de API keys (v1, v2, deprecated)
- 🔲 Rotación automática mensual
- 🔲 Alertas si key se usa desde IP no autorizada
- 🔲 Short-lived tokens (JWT con expiración)
- 🔲 Integración con secret manager corporativo

---

### 2.5 Disponibilidad (DoS / DDoS)
**Riesgo**: Dashboard no accesible.

**Controles v1**:
- ✅ Modo offline
- ✅ Demo Mode
- ✅ Caché local

**Controles v2+**:
- 🔲 Rate Limiting en n8n
- 🔲 DDoS mitigation (Cloudflare)
- 🔲 Health checks automáticos
- 🔲 SLA de n8n (>99.5% uptime)

---

### 2.6 Inyección de Código (XSS)
**Riesgo**: Código JavaScript malicioso en payload.

**Controles v1**:
- ✅ Validación de schema
- ✅ Renderización con textContent (no innerHTML)
- ✅ Sanitización de strings

**Controles v2+**:
- 🔲 Content Security Policy (CSP) headers
- 🔲 HTML sanitization library (DOMPurify)
- 🔲 Template literals con escaping

---

## 3. Matriz de Controles

| Amenaza | Severidad | v1 | v2+ | Responsable |
|---------|-----------|-----|-----|-------------|
| Exposición de KPIs | 🔴 Alta | API Key + Schema | CORS + Rate Limiting | Seg/DevOps |
| Scraping | 🟡 Media | API Key + Demo | WAF + Behavioral | Seg/DevOps |
| MITM | 🔴 Alta | HTTPS + API Key | Firma + mTLS | DevOps/Seg |
| Robo de Key | 🟡 Media | .gitignore | Secret Manager | DevOps |
| DoS / DDoS | 🟡 Media | Offline + Cache | Rate Limiting | DevOps/Inf |
| XSS | 🔴 Alta | Schema + textContent | CSP + DOMPurify | Dev/Seg |

---

## 4. Ciclo de Vida de Seguridad

```
1. DISEÑO SEGURO (Security by Design)
   → Threat modeling (STRIDE)
   → Arquitectura defensiva
   → Matriz de riesgos

2. IMPLEMENTACIÓN SEGURA
   → Code review con foco en seguridad
   → Testing de controles
   → SAST (Static Application Security Testing)

3. HARDENING OPERACIONAL
   → API Key rotación
   → Auditoría de logs
   → Parches de dependencias
   → Pentesting periódico

4. MONITOREO & RESPUESTA A INCIDENTES
   → Alertas de eventos anómalos
   → Playbooks de respuesta
   → Post-mortem de incidentes
   → Auditoría anual (SOC 2, ISO 27001)
```

---

## 5. Auditoría y Logging

### 5.1 Eventos a Auditar

| Evento | Datos Capturados | Destino | Retención |
|--------|-----------------|---------|----------|
| GET /webhook success | timestamp, user_id, api_key_hash, response_code | Syslog/SIEM | 1 año |
| GET /webhook fail | timestamp, user_id, error_code, error_msg | Syslog/SIEM | 1 año |
| API Key rotation | timestamp, old_hash, new_hash, rotated_by | Audit log | 3 años |
| Auth failure | timestamp, user_id, role, ip_address | Syslog/SIEM | 6 meses |
| Access from unusual IP | timestamp, user_id, ip_address, country | SIEM alert | 1 año |

### 5.2 Alertas Automáticas

```yaml
alert_rules:
  - name: "High error rate"
    condition: "error_rate > 5% in 5min"
    severity: "CRITICAL"
    action: "Page on-call engineer"
  
  - name: "Unusual API key usage"
    condition: "api_key used from 3+ IPs in 1min"
    severity: "HIGH"
    action: "Immediately revoke key"
  
  - name: "Auth failures spike"
    condition: "failed_auths > 10 in 1min from same IP"
    severity: "HIGH"
    action: "Rate limit IP, trigger SIEM investigation"
  
  - name: "Stale data"
    condition: "last_execution_age > 1 hour"
    severity: "MEDIUM"
    action: "Alert ops team, dashboard shows warning"
```

---

## 6. Conformidad y Estándares

### 6.1 Marcos Aplicables

| Marco | Requerimientos | Estado |
|-------|----------------|--------|
| **OWASP Top 10** | Broken Access Control, Cryptographic Failures, etc. | ✅ Diseñado con OWASP |
| **NIST CSF** | Identify, Protect, Detect, Respond, Recover | 🟡 Phase1 (Protect) |
| **ISO 27001** | 230 controles de seguridad de información | 🔲 Roadmap (auditoría SOC 2) |
| **GDPR** | Protección de datos personales | ✅ No almacena datos sensibles |
| **SOC 2 Tipo II** | Auditoría anual de controles | 🔲 Roadmap (Q2 2026) |

---

## 7. Responsabilidades

| Rol | Responsabilidades |
|-----|-------------------|
| **CISO / Seguridad** | Aprobación de cambios, review de amenazas, pentesting, roadmap |
| **DevOps / Infra** | n8n actualizado, HTTPS/TLS, rotación de keys, monitoreo SIEM |
| **Desarrollo** | Secure coding, code review, testing, dependencias actualizadas |
| **Product Manager** | Alineamiento de seguridad con features, priorizar roadmap |

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Próxima revisión**: Abril 2026 (trimestral)  
**Estado**: Activo
