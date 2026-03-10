# Documentación Completa — Turn14 Auto Parts Catalog

---

## Índice

1. [Resumen General](#resumen-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Archivos Raíz](#archivos-raíz)
6. [Backend — Detalle Completo](#backend--detalle-completo)
7. [Frontend — Detalle Completo](#frontend--detalle-completo)
8. [Nginx — Proxy Reverso](#nginx--proxy-reverso)
9. [Base de Datos — PostgreSQL](#base-de-datos--postgresql)
10. [Sistema de Sincronización con Turn14](#sistema-de-sincronización-con-turn14)
11. [API Endpoints](#api-endpoints)
12. [Variables de Entorno](#variables-de-entorno)
13. [Comandos Útiles](#comandos-útiles)

---

## Resumen General

Esta aplicación es un **catálogo de autopartes** que se conecta a la API de **Turn14 Distribution** para importar productos, marcas, precios, inventario y compatibilidad vehicular. Los datos se almacenan en PostgreSQL y se muestran a través de una interfaz web moderna con búsqueda, filtros por marca/categoría y filtro por vehículo (año/marca/modelo).

---

## Arquitectura del Sistema

```
┌─────────────────┐
│   Usuario        │
│   (Navegador)    │
└────────┬─────────┘
         │ HTTP :80
┌────────▼─────────┐
│     Nginx         │  ← Proxy reverso + caché + compresión gzip
│   (Puerto 80)     │
└──┬──────────┬─────┘
   │          │
   │ /api/*   │ / (todo lo demás)
   │          │
┌──▼────┐  ┌──▼──────────┐
│Backend│  │  Frontend    │
│Fastify│  │  Next.js     │
│:3001  │  │  :3000       │
└──┬────┘  └─────────────┘
   │
┌──▼───────────┐     ┌──────────────┐
│  PostgreSQL  │     │  Turn14 API  │
│  :5432       │     │  (externa)   │
└──────────────┘     └──────────────┘
```

**Flujo:**
1. El usuario abre el sitio web → Nginx recibe la petición
2. Si es `/api/*` → Nginx lo envía al Backend (Fastify)
3. Si es cualquier otra ruta → Nginx lo envía al Frontend (Next.js)
4. El Backend consulta PostgreSQL para devolver datos
5. Periódicamente, el Backend se conecta a la API de Turn14 para sincronizar datos

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js + React + TailwindCSS | Next.js 14, React 18 |
| Backend | Fastify (Node.js) | Node 20 |
| Base de Datos | PostgreSQL | 16 (Alpine) |
| Proxy | Nginx | Alpine |
| Contenedores | Docker + Docker Compose | - |
| Cron Jobs | node-cron | - |

---

## Estructura de Carpetas

```
Turn14/
├── docker-compose.yml          # Orquesta los 4 servicios
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Archivos ignorados por Git
├── README.md                   # Resumen del proyecto
├── DEPLOY.md                   # Guía de despliegue en VPS
├── DOCUMENTACION.md            # Este archivo
│
├── backend/                    # Servidor API (Fastify + Node.js)
│   ├── Dockerfile              # Imagen Docker del backend
│   ├── .dockerignore           # Archivos excluidos del build
│   ├── package.json            # Dependencias y scripts
│   └── src/
│       ├── index.js            # Punto de entrada del servidor
│       ├── config/
│       │   └── index.js        # Configuración centralizada
│       ├── db/
│       │   ├── connection.js   # Pool de conexiones PostgreSQL
│       │   └── schema.sql      # Esquema completo de la BD
│       ├── routes/
│       │   ├── products.js     # Rutas de productos
│       │   ├── brands.js       # Rutas de marcas
│       │   ├── categories.js   # Rutas de categorías
│       │   ├── vehicles.js     # Rutas de compatibilidad vehicular
│       │   ├── search.js       # Ruta de búsqueda
│       │   └── sync.js         # Rutas para disparar sincronización
│       ├── services/
│       │   ├── turn14Api.js    # Cliente HTTP para Turn14 API
│       │   ├── turn14Auth.js   # Autenticación OAuth con Turn14
│       │   └── syncService.js  # Lógica de sincronización
│       └── jobs/
│           ├── syncJobs.js     # Cron jobs programados
│           └── runSync.js      # CLI para ejecutar syncs manualmente
│
├── frontend/                   # Interfaz web (Next.js)
│   ├── Dockerfile              # Imagen Docker del frontend
│   ├── .dockerignore           # Archivos excluidos del build
│   ├── package.json            # Dependencias y scripts
│   ├── next.config.js          # Configuración de Next.js
│   ├── tailwind.config.js      # Configuración de TailwindCSS
│   ├── postcss.config.js       # PostCSS (requerido por Tailwind)
│   ├── public/                 # Archivos estáticos
│   └── src/
│       ├── app/
│       │   ├── layout.js       # Layout raíz (metadata, estilos)
│       │   ├── page.js         # Página principal (home)
│       │   ├── globals.css     # Estilos globales + clases Tailwind
│       │   └── products/
│       │       └── [id]/
│       │           └── page.js # Página de detalle de producto
│       ├── components/
│       │   ├── Header.jsx      # Encabezado con logo y buscador
│       │   ├── SearchBar.jsx   # Barra de búsqueda
│       │   ├── VehicleFilter.jsx # Filtro cascada: Año/Marca/Modelo
│       │   ├── FilterSidebar.jsx # Sidebar con filtros de marca/categoría
│       │   ├── ProductGrid.jsx   # Grilla de tarjetas de productos
│       │   ├── ProductCard.jsx   # Tarjeta individual de producto
│       │   └── Pagination.jsx    # Paginación
│       └── lib/
│           └── api.js          # Cliente API del frontend
│
└── nginx/
    └── nginx.conf              # Configuración de Nginx
```

---

## Archivos Raíz

### `docker-compose.yml`
Orquesta los 4 contenedores de la aplicación:
- **postgres** — Base de datos. Monta el `schema.sql` para inicialización automática. Tiene healthcheck para asegurar que está lista antes de que el backend arranque.
- **backend** — Servidor API. Depende de postgres (espera a que esté healthy). Recibe todas las variables de entorno de la API de Turn14 y la BD.
- **frontend** — Interfaz web. Depende del backend. Se construye como app standalone de Next.js.
- **nginx** — Proxy reverso. Depende de backend y frontend. Enruta `/api/` al backend y todo lo demás al frontend.

### `.env.example`
Plantilla con todas las variables de entorno necesarias. Se debe copiar como `.env` y llenar con valores reales antes de ejecutar `docker compose up`.

### `.gitignore`
Excluye: `node_modules/`, `.next/`, `.env`, `*.log`, `pgdata/`.

### `README.md`
Resumen del proyecto: arquitectura, stack, instrucciones de inicio rápido, endpoints de la API, horarios de sincronización.

### `DEPLOY.md`
Guía paso a paso para desplegar en un VPS (Hostinger o similar): configuración de Docker, clonación del repo, configuración de `.env`, SSL con Certbot, y comandos de mantenimiento.

---

## Backend — Detalle Completo

### `backend/src/index.js` — Punto de Entrada
El servidor Fastify arranca aquí. Lo que hace:
1. Registra **CORS** (permite peticiones de cualquier origen)
2. Registra **rate limiting** (máximo 200 peticiones por minuto por IP)
3. Registra el endpoint `/api/health` para verificar que el servidor y la BD están funcionando
4. Registra todas las rutas (products, brands, categories, vehicles, search, sync)
5. Inicia los **cron jobs** de sincronización automática
6. Maneja el **apagado limpio** (cierra conexiones al recibir SIGTERM/SIGINT)

### `backend/src/config/index.js` — Configuración
Centraliza toda la configuración de la app, leída desde variables de entorno:

| Propiedad | Descripción | Valor por defecto |
|-----------|-------------|-------------------|
| `port` | Puerto del servidor | 3001 |
| `nodeEnv` | Ambiente (development/production) | development |
| `db.connectionString` | URL de conexión a PostgreSQL | postgresql://turn14user:...@localhost:5432/turn14catalog |
| `db.pool` | Config del pool (min: 2, max: 20) | - |
| `turn14.clientId` | Client ID de Turn14 API | (vacío) |
| `turn14.clientSecret` | Client Secret de Turn14 API | (vacío) |
| `turn14.apiBase` | URL base de la API | https://api.turn14.com/v1 |
| `turn14.rateLimit` | Límites: 4/seg, 4500/hora, 28000/día | - |
| `sync.catalogCron` | Horario de sync de catálogo | 0 2 * * * (2:00 AM diario) |
| `sync.inventoryCron` | Horario de sync de inventario | */30 * * * * (cada 30 min) |
| `sync.pricingCron` | Horario de sync de precios | 0 */4 * * * (cada 4 horas) |
| `sync.fitmentCron` | Horario de sync de compatibilidad | 0 3 * * 0 (domingos 3:00 AM) |

### `backend/src/db/connection.js` — Conexión a PostgreSQL
Crea un **pool de conexiones** usando la librería `pg`. Exporta:
- `query(text, params)` — Ejecuta una consulta SQL
- `getClient()` — Obtiene un cliente del pool (para transacciones manuales)
- `transaction(callback)` — Ejecuta una función dentro de una transacción (BEGIN/COMMIT/ROLLBACK)
- `close()` — Cierra el pool

### `backend/src/db/schema.sql` — Esquema de Base de Datos
Define todas las tablas. Ver sección [Base de Datos](#base-de-datos--postgresql) para detalle completo.

---

### `backend/src/services/` — Servicios

#### `turn14Auth.js` — Autenticación
Maneja la obtención y renovación del token OAuth de Turn14:
- `requestToken()` — Hace POST a `/token` con client_credentials
- `getToken()` — Devuelve el token actual o solicita uno nuevo si expiró
- `clearToken()` — Limpia el token (usado tras recibir un 401)
- Los tokens se renuevan automáticamente cada 45 minutos

#### `turn14Api.js` — Cliente API de Turn14
Todas las llamadas a la API pasan por aquí. Incluye:
- **Rate limiting**: máximo 4 requests por segundo
- **Retry automático**: si recibe 401, renueva el token y reintenta
- **Manejo de 429**: si Turn14 limita las peticiones, espera el tiempo indicado
- **Paginación**: `fetchAllPages()` recorre todas las páginas automáticamente

Endpoints disponibles:
| Método | Descripción |
|--------|-------------|
| `getItems(page)` | Lista items paginados |
| `getItem(id)` | Detalle de un item |
| `getItemData(id)` | Datos extendidos (inventario, precios, media) |
| `getItemFitment(id)` | Compatibilidad vehicular del item |
| `getItemsByBrand(brandId, page)` | Items de una marca paginados |
| `getBrands()` | Lista todas las marcas |
| `getCategories()` | Lista categorías (puede no existir en la API) |

#### `syncService.js` — Lógica de Sincronización
Contiene toda la lógica para importar datos de Turn14 a PostgreSQL:

| Función | Descripción |
|---------|-------------|
| `syncBrands(logId)` | Importa/actualiza marcas |
| `syncCategories(logId)` | Intenta importar categorías (se salta si el endpoint no existe) |
| `syncCatalog()` | Sync completo: marcas → categorías → productos (por marca, paginado) |
| `syncBrandsOnly()` | Sync rápido de solo marcas |
| `syncInventory()` | Actualiza inventario de todos los productos |
| `syncPricing()` | Actualiza precios de todos los productos |
| `syncFitment()` | Importa compatibilidad vehicular |
| `syncProductImages(productId, turn14Id)` | Descarga imágenes de un producto |
| `getOrCreateCategory(catId, catName)` | Crea categorías al vuelo desde datos de productos |
| `upsertProduct(item, localBrandId)` | Inserta o actualiza un producto |

Cada sync registra su progreso en la tabla `sync_log`.

---

### `backend/src/routes/` — Rutas API

#### `products.js` — Productos
| Endpoint | Descripción |
|----------|-------------|
| `GET /api/products` | Lista productos paginada con filtros (brand_id, category_id, in_stock, sort, order) |
| `GET /api/products/:id` | Detalle de producto con imágenes, fitment, inventario y precios |

La lista soporta ordenamiento por: nombre, precio, marca, fecha de creación.

#### `brands.js` — Marcas
| Endpoint | Descripción |
|----------|-------------|
| `GET /api/brands` | Lista todas las marcas activas con conteo de productos |
| `GET /api/brands/:id` | Detalle de una marca |

#### `categories.js` — Categorías
| Endpoint | Descripción |
|----------|-------------|
| `GET /api/categories` | Lista todas las categorías activas con conteo de productos |
| `GET /api/categories/tree` | Categorías en estructura de árbol (padres → hijos) |

#### `vehicles.js` — Compatibilidad Vehicular
Filtro cascada: seleccionas año → te muestra marcas disponibles → modelos → submodelos → motores.

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/vehicles/years` | Años disponibles |
| `GET /api/vehicles/makes?year=` | Marcas de vehículo por año |
| `GET /api/vehicles/models?year=&make_id=` | Modelos por año y marca |
| `GET /api/vehicles/submodels?year=&make_id=&model_id=` | Submodelos |
| `GET /api/vehicles/engines?...` | Motores |
| `GET /api/vehicles/products?...` | Productos compatibles con el vehículo seleccionado |

#### `search.js` — Búsqueda
| Endpoint | Descripción |
|----------|-------------|
| `GET /api/search?q=...` | Busca en nombre, part_number, mfr_part_number y barcode. Soporta filtros de marca, categoría y vehículo. Usa `pg_trgm` para relevancia. |

#### `sync.js` — Sincronización (API)
| Endpoint | Descripción |
|----------|-------------|
| `POST /api/sync/catalog` | Inicia sync de catálogo en background |
| `POST /api/sync/inventory` | Inicia sync de inventario en background |
| `POST /api/sync/pricing` | Inicia sync de precios en background |
| `POST /api/sync/fitment` | Inicia sync de compatibilidad en background |
| `GET /api/sync/status` | Últimas 20 entradas del log de sincronización |
| `POST /api/sync/refresh-views` | Refresca la vista materializada de inventario |

---

### `backend/src/jobs/` — Jobs

#### `syncJobs.js` — Cron Jobs
Programa las sincronizaciones automáticas usando `node-cron`:
- **Catálogo**: diario a las 2:00 AM (EST)
- **Inventario**: cada 30 minutos
- **Precios**: cada 4 horas
- **Compatibilidad**: domingos a las 3:00 AM (EST)

#### `runSync.js` — CLI Manual
Permite ejecutar syncs manualmente desde la terminal:
```bash
node src/jobs/runSync.js catalog      # Sync completo
node src/jobs/runSync.js brands       # Solo marcas (rápido)
node src/jobs/runSync.js inventory    # Solo inventario
node src/jobs/runSync.js pricing      # Solo precios
node src/jobs/runSync.js fitment      # Solo compatibilidad
node src/jobs/runSync.js refresh-views # Refrescar vistas
```

---

## Frontend — Detalle Completo

### `frontend/next.config.js`
- `output: 'standalone'` — Genera un build optimizado para Docker
- `remotePatterns` — Permite cargar imágenes de cualquier dominio HTTPS
- `rewrites` — Redirige `/api/*` al backend (para desarrollo local)

### `frontend/tailwind.config.js`
Configura TailwindCSS con una paleta de colores personalizada (`brand`) para mantener consistencia visual.

### `frontend/src/lib/api.js` — Cliente API
Funciones para comunicarse con el backend:

| Función | Endpoint |
|---------|----------|
| `api.getProducts(params)` | GET /api/products |
| `api.getProduct(id)` | GET /api/products/:id |
| `api.searchProducts(params)` | GET /api/search |
| `api.getBrands()` | GET /api/brands |
| `api.getCategories()` | GET /api/categories |
| `api.getCategoryTree()` | GET /api/categories/tree |
| `api.getYears()` | GET /api/vehicles/years |
| `api.getMakes(params)` | GET /api/vehicles/makes |
| `api.getModels(params)` | GET /api/vehicles/models |
| `api.getSubmodels(params)` | GET /api/vehicles/submodels |
| `api.getEngines(params)` | GET /api/vehicles/engines |
| `api.getVehicleProducts(params)` | GET /api/vehicles/products |

Cada llamada incluye revalidación automática cada 60 segundos (caché de Next.js).

---

### `frontend/src/app/` — Páginas

#### `layout.js` — Layout Raíz
Define la metadata del sitio (título, descripción) y aplica los estilos globales. Todas las páginas se renderizan dentro de este layout.

#### `page.js` — Página Principal (Home)
La página principal del catálogo. Contiene:
1. **Header** con barra de búsqueda
2. **VehicleFilter** — filtro cascada por vehículo
3. **FilterSidebar** — filtros laterales por marca y categoría
4. **ProductGrid** — grilla de tarjetas de productos
5. **Pagination** — navegación entre páginas
6. **Ordenamiento** — por nombre, precio, marca, más recientes
7. **Checkbox** "In Stock Only" para filtrar solo productos con existencia

#### `products/[id]/page.js` — Detalle de Producto
Página dinámica que muestra:
- Galería de imágenes del producto
- Especificaciones (part number, barcode, dimensiones, peso)
- Precios (retail, MAP, jobber)
- Estado de inventario por almacén
- Tabla de compatibilidad vehicular (año, marca, modelo, submodelo, motor)

---

### `frontend/src/components/` — Componentes

| Componente | Descripción |
|------------|-------------|
| `Header.jsx` | Barra superior con logo de la app y SearchBar integrada. Links de navegación. |
| `SearchBar.jsx` | Campo de búsqueda controlado. Cuando el usuario escribe y presiona Enter (o hace clic), emite el término de búsqueda al componente padre. |
| `VehicleFilter.jsx` | Filtro cascada de 5 niveles: Año → Marca de vehículo → Modelo → Submodelo → Motor. Cada selector carga opciones dinámicamente desde la API basándose en la selección anterior. |
| `FilterSidebar.jsx` | Panel lateral con listas de marcas y categorías disponibles. Al hacer clic en una, filtra los productos. Muestra el conteo de productos por marca/categoría. |
| `ProductGrid.jsx` | Grilla responsive de ProductCards. Muestra skeleton loading mientras carga. Muestra mensaje de "no products found" si no hay resultados. |
| `ProductCard.jsx` | Tarjeta individual: imagen, nombre de marca, nombre de producto, precio, badge de stock (verde = en stock, rojo = agotado). Al hacer clic va al detalle. |
| `Pagination.jsx` | Componente de paginación con botones anterior/siguiente y números de página. |

---

## Nginx — Proxy Reverso

### `nginx/nginx.conf`
Configuración del proxy reverso que maneja todo el tráfico:

**Funciones principales:**
1. **Proxy reverso**: enruta `/api/` al backend y `/` al frontend
2. **Caché de API**: respuestas exitosas de `/api/` se cachean por 5 minutos. Si el backend falla, sirve la versión cacheada (stale).
3. **Compresión gzip**: comprime JSON, CSS, JS, XML, SVG para reducir tamaño de transferencia
4. **Caché de estáticos**: archivos de `/_next/static/` se cachean por 365 días con header `immutable`
5. **WebSocket support**: la conexión al frontend soporta upgrade para hot reload en desarrollo

**Upstreams:**
- `backend` → contenedor `backend:3001`
- `frontend` → contenedor `frontend:3000`

---

## Base de Datos — PostgreSQL

### Tablas

| Tabla | Descripción | Campos principales |
|-------|-------------|-------------------|
| `brands` | Marcas de autopartes | id, turn14_id, name, logo_url, active |
| `categories` | Categorías de productos | id, turn14_id, name, parent_id (árbol), active |
| `products` | Catálogo de productos | id, turn14_id, brand_id, category_id, part_number, mfr_part_number, barcode, name, description, dimensiones, peso |
| `product_images` | Imágenes de productos | id, product_id, url, sort_order, is_primary |
| `product_pricing` | Precios | id, product_id, retail_price, jobber_price, map_price, cost, can_purchase |
| `inventory` | Stock por almacén | id, product_id, warehouse, quantity |
| `vehicle_makes` | Marcas de vehículos | id, name (Ford, Chevy, etc.) |
| `vehicle_models` | Modelos de vehículos | id, make_id, name (Mustang, Camaro, etc.) |
| `vehicle_submodels` | Submodelos | id, model_id, name (GT, LT, etc.) |
| `vehicle_engines` | Motores | id, name, displacement, block_type, cylinders, fuel_type |
| `product_fitment` | Compatibilidad producto ↔ vehículo | product_id, year, make_id, model_id, submodel_id, engine_id |
| `sync_log` | Historial de sincronizaciones | sync_type, status, items_processed/created/updated/failed, timestamps |

### Vista Materializada
`product_inventory_totals` — Suma la cantidad total de inventario por producto (todas las bodegas). Se refresca automáticamente después del sync de inventario.

### Índices Especiales
- **pg_trgm**: búsqueda fuzzy en `products.name` y `products.part_number` (permite encontrar productos aunque haya typos)
- **Índice parcial**: `idx_products_active` solo indexa productos activos
- **Índice compuesto de fitment**: `idx_fitment_vehicle_lookup` optimiza búsquedas por vehículo

### Triggers
- `update_updated_at()` — Actualiza automáticamente el campo `updated_at` en: products, brands, categories, product_pricing, inventory.

---

## Sistema de Sincronización con Turn14

### Flujo de Sincronización del Catálogo
1. Crea entrada en `sync_log` con status "running"
2. Sync de marcas: llama a `GET /brands` de Turn14 → inserta/actualiza en tabla `brands`
3. Sync de categorías: intenta `GET /categories` → si falla (404), las crea al vuelo desde datos de productos
4. Sync de productos: por cada marca activa, recorre todas las páginas de `GET /items/brand/{id}` → inserta/actualiza en tabla `products`
5. Actualiza `sync_log` con status "completed" y estadísticas

### Horarios Automáticos (Cron)
| Sync | Frecuencia | Horario |
|------|-----------|---------|
| Catálogo completo | Diario | 2:00 AM EST |
| Inventario | Cada 30 min | :00 y :30 de cada hora |
| Precios | Cada 4 horas | 12:00, 4:00, 8:00 AM/PM |
| Compatibilidad | Semanal | Domingos 3:00 AM EST |

### Rate Limiting con Turn14
La API de Turn14 tiene límites estrictos:
- 4 requests por segundo
- 4,500 requests por hora
- 28,000 requests por día
- 8 requests de token por minuto

El sistema respeta estos límites automáticamente con throttling.

---

## API Endpoints

### Productos
```
GET /api/products?page=1&limit=24&brand_id=5&category_id=3&in_stock=true&sort=name&order=asc
GET /api/products/123
```

### Marcas
```
GET /api/brands
GET /api/brands/5
```

### Categorías
```
GET /api/categories
GET /api/categories/tree
```

### Vehículos (filtro cascada)
```
GET /api/vehicles/years
GET /api/vehicles/makes?year=2020
GET /api/vehicles/models?year=2020&make_id=1
GET /api/vehicles/submodels?year=2020&make_id=1&model_id=5
GET /api/vehicles/engines?year=2020&make_id=1&model_id=5&submodel_id=2
GET /api/vehicles/products?year=2020&make_id=1&model_id=5&page=1
```

### Búsqueda
```
GET /api/search?q=brake+pad&brand_id=5&year=2020&make_id=1
```

### Sincronización
```
POST /api/sync/catalog
POST /api/sync/inventory
POST /api/sync/pricing
POST /api/sync/fitment
GET  /api/sync/status
POST /api/sync/refresh-views
```

### Health Check
```
GET /api/health
→ { "status": "ok", "db": "connected" }
```

---

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `TURN14_CLIENT_ID` | Client ID de la API de Turn14 | abc123... |
| `TURN14_CLIENT_SECRET` | Client Secret de la API de Turn14 | xyz789... |
| `TURN14_API_BASE` | URL base de la API | https://api.turn14.com/v1 |
| `TURN14_ENV` | Ambiente de Turn14 | production |
| `POSTGRES_USER` | Usuario de PostgreSQL | turn14user |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | tuPasswordSegura |
| `POSTGRES_DB` | Nombre de la base de datos | turn14catalog |
| `DATABASE_URL` | URL completa de conexión | postgresql://turn14user:pass@postgres:5432/turn14catalog |
| `NODE_ENV` | Ambiente de Node.js | production |
| `BACKEND_PORT` | Puerto del backend | 3001 |
| `FRONTEND_PORT` | Puerto del frontend | 3000 |
| `NGINX_PORT` | Puerto de Nginx (público) | 80 |
| `SYNC_CRON_CATALOG` | Cron de catálogo | 0 2 * * * |
| `SYNC_CRON_INVENTORY` | Cron de inventario | */30 * * * * |
| `SYNC_CRON_PRICING` | Cron de precios | 0 */4 * * * |
| `SYNC_CRON_FITMENT` | Cron de compatibilidad | 0 3 * * 0 |

---

## Comandos Útiles

### Docker (en el servidor)
```bash
# Levantar todo
docker compose up -d --build

# Ver logs de un servicio
docker compose logs -f backend
docker compose logs -f postgres

# Reiniciar un servicio
docker compose restart backend

# Parar todo
docker compose down

# Parar todo y borrar datos de BD
docker compose down -v

# Ver estado de contenedores
docker compose ps
```

### Sincronización Manual
```bash
# Sync completo (puede tardar horas)
docker compose exec backend node src/jobs/runSync.js catalog

# Solo marcas (rápido, segundos)
docker compose exec backend node src/jobs/runSync.js brands

# Solo inventario
docker compose exec backend node src/jobs/runSync.js inventory

# Solo precios
docker compose exec backend node src/jobs/runSync.js pricing

# Solo compatibilidad vehicular
docker compose exec backend node src/jobs/runSync.js fitment

# Refrescar vista materializada
docker compose exec backend node src/jobs/runSync.js refresh-views
```

### Base de Datos
```bash
# Conectar a PostgreSQL
docker compose exec postgres psql -U turn14user -d turn14catalog

# Ver tablas
docker compose exec postgres psql -U turn14user -d turn14catalog -c "\dt"

# Contar productos
docker compose exec postgres psql -U turn14user -d turn14catalog -c "SELECT COUNT(*) FROM products"

# Ver últimos syncs
docker compose exec postgres psql -U turn14user -d turn14catalog -c "SELECT * FROM sync_log ORDER BY started_at DESC LIMIT 5"
```

### Sync en Background (no se corta si se cierra SSH)
```bash
# Opción 1: screen
screen -S sync
docker compose exec backend node src/jobs/runSync.js catalog
# Ctrl+A, D para desconectar
# screen -r sync para reconectar

# Opción 2: nohup
nohup docker compose exec backend node src/jobs/runSync.js catalog > sync.log 2>&1 &
tail -f sync.log
```
