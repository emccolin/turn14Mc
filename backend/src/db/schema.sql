-- Turn14 Auto Parts Catalog - Database Schema

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
    id              SERIAL PRIMARY KEY,
    turn14_id       VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    logo_url        TEXT,
    active          BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_turn14_id ON brands(turn14_id);
CREATE INDEX idx_brands_name ON brands(name);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    turn14_id       VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    parent_id       INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    active          BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_turn14_id ON categories(turn14_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_name ON categories(name);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    turn14_id       VARCHAR(50) UNIQUE NOT NULL,
    brand_id        INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    part_number     VARCHAR(100),
    mfr_part_number VARCHAR(100),
    barcode         VARCHAR(50),
    name            VARCHAR(500) NOT NULL,
    short_description TEXT,
    description     TEXT,
    dimensions_length DECIMAL(10,2),
    dimensions_width  DECIMAL(10,2),
    dimensions_height DECIMAL(10,2),
    weight          DECIMAL(10,2),
    active          BOOLEAN DEFAULT true,
    prop_65         BOOLEAN DEFAULT false,
    carb_compliant  BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_turn14_id ON products(turn14_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_part_number ON products(part_number);
CREATE INDEX idx_products_mfr_part_number ON products(mfr_part_number);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_active ON products(active) WHERE active = true;
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_part_number_trgm ON products USING gin(part_number gin_trgm_ops);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    sort_order      INTEGER DEFAULT 0,
    is_primary      BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;

-- ============================================================
-- PRODUCT PRICING
-- ============================================================
CREATE TABLE IF NOT EXISTS product_pricing (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    retail_price    DECIMAL(10,2),
    jobber_price    DECIMAL(10,2),
    map_price       DECIMAL(10,2),
    cost            DECIMAL(10,2),
    can_purchase    BOOLEAN DEFAULT true,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_pricing_product_id ON product_pricing(product_id);

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse       VARCHAR(50) NOT NULL DEFAULT 'default',
    quantity        INTEGER DEFAULT 0,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, warehouse)
);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity) WHERE quantity > 0;

-- ============================================================
-- VEHICLE MAKES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_makes (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL
);

CREATE INDEX idx_vehicle_makes_name ON vehicle_makes(name);

-- ============================================================
-- VEHICLE MODELS
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_models (
    id              SERIAL PRIMARY KEY,
    make_id         INTEGER NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    UNIQUE(make_id, name)
);

CREATE INDEX idx_vehicle_models_make_id ON vehicle_models(make_id);
CREATE INDEX idx_vehicle_models_name ON vehicle_models(name);

-- ============================================================
-- VEHICLE SUBMODELS
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_submodels (
    id              SERIAL PRIMARY KEY,
    model_id        INTEGER NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    UNIQUE(model_id, name)
);

CREATE INDEX idx_vehicle_submodels_model_id ON vehicle_submodels(model_id);

-- ============================================================
-- VEHICLE ENGINES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_engines (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(300) NOT NULL,
    displacement    VARCHAR(20),
    block_type      VARCHAR(10),
    cylinders       INTEGER,
    fuel_type       VARCHAR(50),
    UNIQUE(name)
);

CREATE INDEX idx_vehicle_engines_name ON vehicle_engines(name);

-- ============================================================
-- PRODUCT FITMENT (links products to vehicles)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_fitment (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    year            SMALLINT NOT NULL,
    make_id         INTEGER NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    model_id        INTEGER NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
    submodel_id     INTEGER REFERENCES vehicle_submodels(id) ON DELETE SET NULL,
    engine_id       INTEGER REFERENCES vehicle_engines(id) ON DELETE SET NULL,
    qualifier       TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fitment_unique
    ON product_fitment(product_id, year, make_id, model_id, COALESCE(submodel_id, 0), COALESCE(engine_id, 0));
CREATE INDEX idx_fitment_product_id ON product_fitment(product_id);
CREATE INDEX idx_fitment_year ON product_fitment(year);
CREATE INDEX idx_fitment_make_id ON product_fitment(make_id);
CREATE INDEX idx_fitment_model_id ON product_fitment(model_id);
CREATE INDEX idx_fitment_submodel_id ON product_fitment(submodel_id);
CREATE INDEX idx_fitment_engine_id ON product_fitment(engine_id);
CREATE INDEX idx_fitment_vehicle_lookup ON product_fitment(year, make_id, model_id, submodel_id, engine_id);
CREATE INDEX idx_fitment_year_make ON product_fitment(year, make_id);
CREATE INDEX idx_fitment_year_make_model ON product_fitment(year, make_id, model_id);

-- ============================================================
-- SYNC LOG (tracks synchronization history)
-- ============================================================
CREATE TABLE IF NOT EXISTS sync_log (
    id              SERIAL PRIMARY KEY,
    sync_type       VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'running',
    items_processed INTEGER DEFAULT 0,
    items_created   INTEGER DEFAULT 0,
    items_updated   INTEGER DEFAULT 0,
    items_failed    INTEGER DEFAULT 0,
    error_message   TEXT,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    finished_at     TIMESTAMPTZ,
    metadata        JSONB
);

CREATE INDEX idx_sync_log_type_status ON sync_log(sync_type, status);

-- ============================================================
-- HELPER: Materialized view for total inventory per product
-- ============================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS product_inventory_totals AS
SELECT
    product_id,
    SUM(quantity) AS total_quantity
FROM inventory
GROUP BY product_id;

CREATE UNIQUE INDEX idx_pit_product_id ON product_inventory_totals(product_id);

-- ============================================================
-- HELPER: Function to update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pricing_updated_at BEFORE UPDATE ON product_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
