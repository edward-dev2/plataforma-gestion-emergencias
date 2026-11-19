# 🚨 Alerta Ciudadana
## Plataforma de Reporte y Gestión de Emergencias

**Prototipo académico — Universidad Nacional Abierta y a Distancia (UNAD)**

**Programa:** Ingeniería de Sistemas  
**Repositorio:** https://github.com/edward-dev2/plataforma-gestion-emergencias

---

## 1. Descripción del proyecto

Alerta Ciudadana es un prototipo de aplicación web diseñado para facilitar el registro, la visualización y la gestión de reportes de emergencias mediante una interfaz interactiva.

La plataforma permite registrar incidentes con información descriptiva y coordenadas geográficas, visualizar su ubicación en un mapa y gestionar su estado de atención mediante usuarios con permisos diferenciados.

Este proyecto se desarrolla con fines académicos, como parte de un proceso de construcción y validación de un prototipo tecnológico.

## 2. Objetivo general

Desarrollar un prototipo funcional de una plataforma web que permita registrar, visualizar y gestionar reportes de emergencias, integrando herramientas de geolocalización, almacenamiento persistente y control de acceso basado en roles.

## 3. Funcionalidades implementadas

- Registro de emergencias con tipo, descripción y ubicación.
- Selección de coordenadas mediante un mapa interactivo.
- Visualización de emergencias registradas mediante marcadores geográficos.
- Consulta de incidentes y sus estados.
- Panel del operador para gestionar reportes.
- Actualización de estados: Pendiente, En atención y Resuelta.
- Almacenamiento persistente mediante SQLite.
- Inicio de sesión con autenticación JWT.
- Contraseñas protegidas mediante hash.
- Roles diferenciados de Ciudadano y Operador.
- Validación de datos y protección de rutas de la API.

## 4. Tecnologías utilizadas

| Componente | Tecnología |
|---|---|
| Frontend | HTML5, CSS3 y JavaScript |
| Backend | Node.js y Express |
| Base de datos | SQLite (`node:sqlite`) |
| Mapas interactivos | Leaflet |
| Cartografía | Esri World Street Map |
| Autenticación | JSON Web Tokens (JWT) |
| Protección de contraseñas | bcryptjs |
| Control de versiones | Git y GitHub |

## 5. Estructura del proyecto

```text
plataforma-gestion-emergencias/
├── backend/
│   ├── data/
│   ├── crearUsuarios.js
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── database/
├── docs/
├── .gitignore
└── README.md
```

Los archivos `.env`, la base de datos local y las dependencias instaladas no deben publicarse en el repositorio.

## 6. Requisitos

Para ejecutar el prototipo se necesita:

- Node.js compatible con el módulo integrado `node:sqlite`. El desarrollo se ha probado con Node.js v26.13.1.
- npm.
- Un navegador web moderno.
- Conexión a Internet para cargar los recursos cartográficos externos.

## 7. Instalación y ejecución

### 7.1. Clonar el repositorio

```bash
git clone https://github.com/edward-dev2/plataforma-gestion-emergencias.git
cd plataforma-gestion-emergencias/backend
```

### 7.2. Instalar dependencias

```bash
npm install
```

### 7.3. Configurar variables de entorno

Crear un archivo `.env` dentro de `backend` con el siguiente contenido:

```dotenv
PORT=3000
JWT_SECRET=REEMPLAZAR_CON_UNA_CLAVE_ALEATORIA_SEGURA
```

Para generar una clave aleatoria con Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

No publicar el archivo `.env` ni compartir su clave secreta.

### 7.4. Crear usuarios de demostración

Desde la carpeta `backend`, ejecutar:

```bash
node crearUsuarios.js
```

El script crea dos usuarios de demostración, si todavía no existen, y genera contraseñas aleatorias.

Las credenciales deben conservarse de forma privada.

### 7.5. Iniciar el servidor

```bash
npm run dev
```

La API estará disponible en:

http://localhost:3000

### 7.6. Abrir el frontend

Abrir el archivo `frontend/index.html` en el navegador mientras el servidor esté ejecutándose.

El frontend utiliza la API local en `http://localhost:3000`.

## 8. Roles de usuario

### Ciudadano

- Iniciar sesión.
- Registrar emergencias.
- Consultar incidentes y su ubicación en el mapa.
- Visualizar los estados de los reportes.

### Operador

- Iniciar sesión.
- Consultar los incidentes registrados.
- Filtrar emergencias por estado.
- Actualizar el estado de atención de los reportes.

La API verifica los permisos del operador antes de permitir la actualización de estados.

## 9. API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Consultar el estado de la API |
| GET | `/api/emergencias` | Consultar emergencias |
| GET | `/api/emergencias/:id` | Consultar una emergencia |
| POST | `/api/emergencias` | Registrar una emergencia autenticada |
| PATCH | `/api/emergencias/:id/estado` | Actualizar estado (solo operador) |
| POST | `/api/auth/login` | Iniciar sesión |

Las rutas protegidas utilizan un token JWT enviado mediante el encabezado `Authorization: Bearer <token>`.

## 10. Pruebas funcionales

Durante el desarrollo local se realizaron comprobaciones de las siguientes funcionalidades:

- Registro de emergencias mediante formulario web.
- Visualización de reportes en el listado.
- Selección de coordenadas en el mapa.
- Visualización de marcadores de emergencias.
- Persistencia de los registros después de reiniciar el servidor.
- Inicio de sesión con las cuentas de demostración.
- Visualización del panel según el rol.
- Actualización de estados mediante un operador autenticado.
- Rechazo de solicitudes de actualización sin autenticación.
- Registro de emergencias mediante usuarios autenticados.

Estas comprobaciones corresponden a pruebas funcionales de desarrollo y no sustituyen una evaluación formal de seguridad o rendimiento.

## 11. Alcance académico y TRL 5

El prototipo se orienta a demostrar la integración de componentes tecnológicos para el reporte y la gestión de emergencias.

El trabajo incluye una API funcional, una interfaz web, un mapa interactivo, almacenamiento persistente y autenticación basada en roles.

Como parte de la documentación de la Fase 4, se podrán presentar evidencias de ejecución y pruebas en un entorno de demostración.

La clasificación formal como TRL 5 requiere demostrar la validación de la tecnología en un entorno relevante y cumplir los criterios de evaluación establecidos para la actividad académica.

## 12. Limitaciones actuales

- El prototipo está diseñado para ejecutarse localmente.
- No cuenta con un despliegue de producción.
- No dispone de notificaciones automáticas a organismos de emergencia.
- No incluye recuperación de contraseñas ni administración avanzada de usuarios.
- No se ha realizado una auditoría de seguridad.
- Los reportes y ubicaciones utilizados para las demostraciones deben ser ficticios.
- La interfaz requiere mejoras adicionales antes de considerar un uso público.

## 13. Aviso importante

**Esta plataforma es exclusivamente un prototipo académico. No debe utilizarse para reportar ni atender emergencias reales.**

En Colombia, ante una emergencia real, se debe contactar a los servicios de emergencia mediante la línea 123.

## 14. Estado del proyecto

**Versión:** 0.3.0 — Prototipo funcional académico.

Las funcionalidades principales se encuentran implementadas y probadas en el entorno local de desarrollo.

El proyecto podrá ampliarse posteriormente con mejoras de seguridad, diseño, despliegue, monitoreo y nuevas capacidades de gestión.

---

**Universidad Nacional Abierta y a Distancia — UNAD**  
**Programa de Ingeniería de Sistemas**  
**Proyecto académico de desarrollo de software**