# Novis AI Core - Executive Dashboard

**Dashboard ejecutivo en tiempo real** para visualizar KPIs de automatizacion, ROI y metricas de negocio desde **n8n**.

## Caracteristicas

- KPIs de Negocio: Ejecuciones, tiempo ahorrado, ahorro de costos, ROI %
- Integracion n8n: Webhook API securizado con autenticacion por header
- Modo Demo: Datos de prueba incluidos para testing
- Diseno Ejecutivo: Interfaz limpia y profesional

## Inicio Rapido

### 1. Abrir el Dashboard

```bash
git clone https://github.com/carlosvergarachile/novis-executive-dashboard.git
cd novis-executive-dashboard
open index.html
```

### 2. Configurar API Connection

En `index.html`, busca estas lineas:

```javascript
const API_URL = 'https://orquesta.app.n8n.cloud/webhook/executive-metrics';
const API_KEY = 'NOVIS_EXEC_DASHBOARD_KEY';
```

Cambia estos valores a los tuyos.

### 3. Desactivar Modo Demo

Al cargar, inicia en DEMO MODE. Para conectar a la API real, haz clic en "Toggle Demo Mode".

## Configuracion del Webhook n8n

```
Header: x-api-key
Value: NOVIS_EXEC_DASHBOARD_KEY
Metodo: GET
Path: /webhook/executive-metrics
```

## Desplegar en GitHub Pages

1. Ve a Settings del repo
2. GitHub Pages > Branch: main, Folder: / (root)
3. Accede en: https://carlosvergarachile.github.io/novis-executive-dashboard/

## Licencia

MIT - Libre para usar, modificar y distribuir.

---

**Ready to visualize your automation ROI!**
