# Turn14 Auto Parts Catalog

Professional auto parts catalog web application powered by the Turn14 Distribution API. Built for speed, large catalogs (100k+ products), and easy VPS deployment via Docker.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Nginx     │────▶│   Next.js    │     │   Turn14     │
│   (Proxy +  │     │   Frontend   │     │   API        │
│    Cache)   │────▶│              │     │              │
└─────────────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │            ┌──────────────┐              │
       └───────────▶│   Fastify    │◀─────────────┘
                    │   Backend    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL  │
                    │  (Catalog    │
                    │   + Fitment) │
                    └──────────────┘
```

## Stack

| Layer      | Technology             |
|------------|------------------------|
| Frontend   | Next.js 14 + TailwindCSS |
| Backend    | Fastify (Node.js)      |
| Database   | PostgreSQL 16          |
| Proxy      | Nginx (caching + gzip) |
| Deploy     | Docker + Docker Compose |

## Features

- Vehicle fitment search (Year → Make → Model → Submodel → Engine)
- Full-text product search by name, part number, MFR number
- Filter by brand, category, stock availability
- Product detail pages with image gallery, specs, and fitment table
- Automated sync from Turn14 API (catalog, inventory, pricing, fitment)
- Rate-limiting compliant with Turn14 API policies
- Nginx reverse proxy with response caching
- Optimized for 100k+ product catalogs

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url> turn14-catalog
cd turn14-catalog

# 2. Create environment file
cp .env.example .env
# Edit .env with your Turn14 API credentials and a strong DB password

# 3. Start all services
docker compose up -d --build

# 4. Run initial catalog sync
docker compose exec backend node src/jobs/runSync.js catalog

# 5. Access the application
# http://localhost (via Nginx)
```

## Detailed Deployment

See [DEPLOY.md](DEPLOY.md) for step-by-step VPS deployment instructions.

## API Endpoints

### Products
- `GET /api/products` — List products (paginated, filterable)
- `GET /api/products/:id` — Product detail with images, fitment, inventory

### Search
- `GET /api/search?q=keyword` — Full-text search

### Brands & Categories
- `GET /api/brands` — List all brands
- `GET /api/categories` — List all categories
- `GET /api/categories/tree` — Category tree

### Vehicle Fitment (cascading dropdowns)
- `GET /api/vehicles/years` — Available years
- `GET /api/vehicles/makes?year=2023` — Makes for year
- `GET /api/vehicles/models?year=2023&make_id=1` — Models
- `GET /api/vehicles/submodels?year=2023&make_id=1&model_id=5` — Submodels
- `GET /api/vehicles/engines?...` — Engines
- `GET /api/vehicles/products?year=2023&make_id=1&...` — Products for vehicle

### Sync Management
- `POST /api/sync/catalog` — Trigger catalog sync
- `POST /api/sync/inventory` — Trigger inventory sync
- `POST /api/sync/pricing` — Trigger pricing sync
- `POST /api/sync/fitment` — Trigger fitment sync
- `GET  /api/sync/status` — View sync history

## Sync Schedule (Default)

| Job       | Cron Expression   | Frequency            |
|-----------|-------------------|----------------------|
| Catalog   | `0 2 * * *`       | Daily at 2:00 AM     |
| Inventory | `*/30 * * * *`    | Every 30 minutes     |
| Pricing   | `0 */4 * * *`     | Every 4 hours        |
| Fitment   | `0 3 * * 0`       | Weekly Sunday 3:00 AM|

## Environment Variables

See [.env.example](.env.example) for all configuration options.

## License

Private — All rights reserved.
