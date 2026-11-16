# Parqueadero-Pro — integración React + Express + MongoDB

Este paquete conserva la interfaz React/Vite original y añade el backend Express.

## Instalación en Windows (PowerShell)
1. Haz una copia de seguridad de tu carpeta original `parquedero - copia`.
2. Extrae este ZIP en una carpeta nueva. No sobrescribas tu proyecto sin respaldo.
3. Arranca MongoDB como ya lo hacías en otra terminal.
4. En una terminal: `cd backend`; `npm install`; `npm run dev` (puerto 3000).
5. En otra terminal desde la raíz: `npm install`; `npm run dev` (puerto 5173).
6. Abre `http://localhost:5173`.

El formulario original se conserva visualmente. Los campos Propietario y Hora de ingreso de la interfaz son solo de referencia; el backend registra automáticamente la hora real de entrada y no persiste propietario.

Se añadieron rutas GET/POST/PUT/DELETE `/api/registros`, GET `/api/registros/ocupacion`, GET `/api/salidas/cotizar/:placa`, POST `/api/salidas/:id`, GET `/api/reportes`.

Importante: el botón eliminar borra registros activos (solo para desarrollo); no es un mecanismo de auditoría. El login del frontend aún es demostrativo y no constituye autenticación segura. Antes de producción se requieren autenticación, autorización, pruebas de concurrencia y validaciones adicionales.

El ZIP no incluye `node_modules`, ni altera los datos de MongoDB. La colección ya creada en tu máquina se conserva.
