-- Turn14 Catalog Seed Data
-- Brands: GFB, EBC, Turbosmart, Snow Performance, aFe Power, Injen

BEGIN;

-- ============================================================
-- BRANDS
-- ============================================================
INSERT INTO brands (turn14_id, name, logo_url, active) VALUES
  ('GFB',   'GFB (Go Fast Bits)', 'https://www.gofastbits.com/assets/gfb-logo.svg', true),
  ('EBC',   'EBC Brakes',         'https://ebcbrakes.com/wp-content/themes/ebc/images/ebc-logo.svg', true),
  ('TURBO', 'Turbosmart',         'https://www.turbosmart.com/wp-content/uploads/turbosmart-logo.svg', true),
  ('SNOW',  'Snow Performance',   'https://www.snowperformance.net/images/snow-logo.png', true),
  ('AFE',   'aFe Power',          'https://afepower.com/media/logo/stores/1/afe-power-logo.svg', true),
  ('INJEN', 'Injen Technology',   'https://injen.com/media/logo/stores/1/injen-logo.svg', true)
ON CONFLICT (turn14_id) DO UPDATE SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url;

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (turn14_id, name, active) VALUES
  ('CAT-INTAKE',     'Air Intakes',              true),
  ('CAT-EXHAUST',    'Exhaust Systems',           true),
  ('CAT-BRAKE',      'Brakes',                    true),
  ('CAT-TURBO',      'Turbo & Supercharger',      true),
  ('CAT-BOV',        'Blow-Off Valves',            true),
  ('CAT-WG',         'Wastegates',                 true),
  ('CAT-BOOST',      'Boost Controllers',          true),
  ('CAT-FUEL',       'Fuel System',                true),
  ('CAT-INJECT',     'Water/Methanol Injection',   true),
  ('CAT-FILTER',     'Air Filters',                true),
  ('CAT-BPAD',       'Brake Pads',                 true),
  ('CAT-BROTOR',     'Brake Rotors',               true)
ON CONFLICT (turn14_id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================
-- VEHICLE MAKES
-- ============================================================
INSERT INTO vehicle_makes (name) VALUES
  ('Ford'), ('Chevrolet'), ('Toyota'), ('Honda'), ('Subaru'),
  ('BMW'), ('Volkswagen'), ('Audi'), ('Nissan'), ('Mitsubishi'),
  ('Dodge'), ('Hyundai'), ('Mazda'), ('Jeep')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- VEHICLE MODELS
-- ============================================================
INSERT INTO vehicle_models (make_id, name)
SELECT m.id, v.model FROM (VALUES
  ('Ford', 'Mustang'), ('Ford', 'F-150'), ('Ford', 'Focus ST'), ('Ford', 'Focus RS'), ('Ford', 'Bronco'), ('Ford', 'Ranger'),
  ('Chevrolet', 'Camaro'), ('Chevrolet', 'Corvette'), ('Chevrolet', 'Silverado 1500'), ('Chevrolet', 'Colorado'),
  ('Toyota', 'Supra'), ('Toyota', 'GR86'), ('Toyota', 'Tacoma'), ('Toyota', 'Tundra'), ('Toyota', '4Runner'),
  ('Honda', 'Civic'), ('Honda', 'Civic Type R'), ('Honda', 'Accord'),
  ('Subaru', 'WRX'), ('Subaru', 'WRX STI'), ('Subaru', 'BRZ'), ('Subaru', 'Crosstrek'),
  ('BMW', '335i'), ('BMW', 'M3'), ('BMW', 'M4'), ('BMW', 'X3'),
  ('Volkswagen', 'Golf GTI'), ('Volkswagen', 'Golf R'), ('Volkswagen', 'Jetta GLI'),
  ('Audi', 'A4'), ('Audi', 'S4'), ('Audi', 'RS3'),
  ('Nissan', '370Z'), ('Nissan', 'GT-R'), ('Nissan', 'Frontier'),
  ('Mitsubishi', 'Lancer Evolution'), ('Mitsubishi', 'Eclipse Cross'),
  ('Dodge', 'Challenger'), ('Dodge', 'Charger'), ('Dodge', 'Ram 1500'),
  ('Hyundai', 'Veloster N'), ('Hyundai', 'Elantra N'),
  ('Mazda', 'MX-5 Miata'), ('Mazda', 'Mazda3'),
  ('Jeep', 'Wrangler'), ('Jeep', 'Gladiator')
) AS v(make, model)
JOIN vehicle_makes m ON m.name = v.make
ON CONFLICT (make_id, name) DO NOTHING;

-- ============================================================
-- VEHICLE SUBMODELS
-- ============================================================
INSERT INTO vehicle_submodels (model_id, name)
SELECT vm.id, s.submodel FROM (VALUES
  ('Mustang', 'GT'),  ('Mustang', 'EcoBoost'), ('Mustang', 'GT500'),
  ('Camaro', 'SS'), ('Camaro', 'ZL1'), ('Camaro', 'LT'),
  ('Civic', 'Si'), ('Civic', 'Sport'),
  ('WRX', 'Base'), ('WRX', 'Premium'), ('WRX', 'Limited'),
  ('Challenger', 'SRT Hellcat'), ('Challenger', 'R/T'), ('Challenger', 'Scat Pack'),
  ('Golf GTI', 'S'), ('Golf GTI', 'SE'), ('Golf GTI', 'Autobahn'),
  ('Tacoma', 'TRD Off-Road'), ('Tacoma', 'TRD Pro'), ('Tacoma', 'SR5'),
  ('F-150', 'Raptor'), ('F-150', 'XLT'), ('F-150', 'Lariat'),
  ('Wrangler', 'Rubicon'), ('Wrangler', 'Sahara'), ('Wrangler', 'Sport')
) AS s(model, submodel)
JOIN vehicle_models vm ON vm.name = s.model
ON CONFLICT (model_id, name) DO NOTHING;

-- ============================================================
-- VEHICLE ENGINES
-- ============================================================
INSERT INTO vehicle_engines (name, displacement, block_type, cylinders, fuel_type) VALUES
  ('2.0L Turbo I4',       '2.0L', 'I', 4, 'Gasoline'),
  ('2.3L EcoBoost I4',    '2.3L', 'I', 4, 'Gasoline'),
  ('2.5L Turbo Boxer H4', '2.5L', 'H', 4, 'Gasoline'),
  ('3.0L Twin-Turbo I6',  '3.0L', 'I', 6, 'Gasoline'),
  ('3.5L EcoBoost V6',    '3.5L', 'V', 6, 'Gasoline'),
  ('3.6L V6',             '3.6L', 'V', 6, 'Gasoline'),
  ('5.0L Coyote V8',      '5.0L', 'V', 8, 'Gasoline'),
  ('5.7L HEMI V8',        '5.7L', 'V', 8, 'Gasoline'),
  ('6.2L LT1 V8',         '6.2L', 'V', 8, 'Gasoline'),
  ('6.2L Supercharged V8', '6.2L', 'V', 8, 'Gasoline'),
  ('3.5L V6',             '3.5L', 'V', 6, 'Gasoline'),
  ('1.5L Turbo I4',       '1.5L', 'I', 4, 'Gasoline'),
  ('2.0L Naturally Aspirated I4', '2.0L', 'I', 4, 'Gasoline'),
  ('3.8L Twin-Turbo V6',  '3.8L', 'V', 6, 'Gasoline')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- PRODUCTS — GFB (Go Fast Bits)
-- ============================================================
INSERT INTO products (turn14_id, brand_id, category_id, part_number, mfr_part_number, name, short_description, description, active) VALUES
  ('GFB-T9351', (SELECT id FROM brands WHERE turn14_id='GFB'), (SELECT id FROM categories WHERE turn14_id='CAT-BOV'),
   'T9351', 'T9351', 'GFB Respons TMS Blow-Off Valve',
   'Dual-port adjustable blow-off valve for turbocharged vehicles',
   'The GFB Respons TMS is a hybrid blow-off valve that features both atmospheric and recirculating ports. Adjustable from full recirculation to full atmosphere. Direct bolt-on replacement for factory bypass valves on many turbo vehicles. CNC machined billet aluminum construction with brass piston for smooth, reliable operation.',
   true),
  ('GFB-T9352', (SELECT id FROM brands WHERE turn14_id='GFB'), (SELECT id FROM categories WHERE turn14_id='CAT-BOV'),
   'T9352', 'T9352', 'GFB Deceptor Pro II Blow-Off Valve',
   'Electronically adjustable dual-port BOV with in-cabin controller',
   'The Deceptor Pro II features an electronic controller that allows you to adjust the BOV from inside the cabin. Switch between quiet recirculating mode and loud atmospheric mode. Motorized adjustment mechanism. Direct bolt-on for factory turbo applications.',
   true),
  ('GFB-T9355', (SELECT id FROM brands WHERE turn14_id='GFB'), (SELECT id FROM categories WHERE turn14_id='CAT-BOV'),
   'T9355', 'T9355', 'GFB Mach 2 TMS Recirculating Blow-Off Valve',
   'High-performance recirculating BOV for daily driven turbo cars',
   'The Mach 2 TMS is a performance recirculating blow-off valve designed for daily driven turbocharged vehicles. It maintains factory ECU compatibility while providing improved boost response. Features a TMS (Turbo Management System) spring adjuster.',
   true),
  ('GFB-7001', (SELECT id FROM brands WHERE turn14_id='GFB'), (SELECT id FROM categories WHERE turn14_id='CAT-WG'),
   '7001', '7001', 'GFB External Wastegate 38mm',
   '38mm external wastegate for turbo applications',
   'GFB 38mm external wastegate with 7 PSI spring (other springs available). Compact lightweight design, V-band inlet and outlet for easy installation. Ideal for custom turbo setups.',
   true),
  ('GFB-3005', (SELECT id FROM brands WHERE turn14_id='GFB'), (SELECT id FROM categories WHERE turn14_id='CAT-BOOST'),
   '3005', '3005', 'GFB G-Force III Electronic Boost Controller',
   'Electronic boost controller with OLED display',
   'The G-Force III is a sophisticated electronic boost controller featuring an OLED display, gear-based boost mapping, overboost protection, and scramble boost function. Compact design with single solenoid for easy installation.',
   true),

-- ============================================================
-- PRODUCTS — EBC Brakes
-- ============================================================
  ('EBC-DP31210C', (SELECT id FROM brands WHERE turn14_id='EBC'), (SELECT id FROM categories WHERE turn14_id='CAT-BPAD'),
   'DP31210C', 'DP31210C', 'EBC Redstuff Ceramic Brake Pads Front',
   'High-performance ceramic brake pads for street and light track use',
   'EBC Redstuff ceramic pads deliver excellent braking power with very low dust. Designed for fast street cars and light track days. Effective from cold, no warm-up needed. Chamfered and slotted for quiet operation. ECE R90 approved.',
   true),
  ('EBC-DP32127C', (SELECT id FROM brands WHERE turn14_id='EBC'), (SELECT id FROM categories WHERE turn14_id='CAT-BPAD'),
   'DP32127C', 'DP32127C', 'EBC Redstuff Ceramic Brake Pads Rear',
   'Rear ceramic brake pads for sport sedans and coupes',
   'EBC Redstuff rear pads matched to front set for balanced braking. Low dust formula keeps wheels clean. Aramid fiber reinforced for long pad life and consistent feel.',
   true),
  ('EBC-GD7210', (SELECT id FROM brands WHERE turn14_id='EBC'), (SELECT id FROM categories WHERE turn14_id='CAT-BROTOR'),
   'GD7210', 'GD7210', 'EBC GD Sport Dimpled & Slotted Rotors Front',
   'Dimpled and slotted sport rotors for improved braking',
   'EBC GD Sport rotors feature wide aperture slots and blind-drilled dimples to improve wet and dry braking. The slot pattern sweeps water, gas, and pad debris away from the contact patch. G3000 grey iron casting, zinc plated for corrosion resistance.',
   true),
  ('EBC-USR7416', (SELECT id FROM brands WHERE turn14_id='EBC'), (SELECT id FROM categories WHERE turn14_id='CAT-BROTOR'),
   'USR7416', 'USR7416', 'EBC USR Slotted Rotors Front',
   'Fine-slotted sport rotors for daily drivers',
   'EBC USR series rotors use fine slots to degas and clean the pad surface without the aggressive bite of wider slots. Perfect for daily drivers wanting improved stopping power. Zinc plated for rust prevention.',
   true),
  ('EBC-S1KF1762', (SELECT id FROM brands WHERE turn14_id='EBC'), (SELECT id FROM categories WHERE turn14_id='CAT-BRAKE'),
   'S1KF1762', 'S1KF1762', 'EBC Stage 1 Premium Brake Kit Front',
   'Complete front brake kit with Ultimax pads and RK rotors',
   'EBC Stage 1 kit includes Ultimax2 pads and RK premium OE replacement rotors. Direct bolt-on with no modifications required. Designed to restore or exceed OEM braking performance. Includes all necessary hardware.',
   true),
  ('EBC-S5KF1866', (SELECT id FROM brands WHERE turn14_id='EBC'), (SELECT id FROM categories WHERE turn14_id='CAT-BRAKE'),
   'S5KF1866', 'S5KF1866', 'EBC Stage 5 SuperStreet Brake Kit Front',
   'Track-capable front brake kit with Yellowstuff pads and GD rotors',
   'EBC Stage 5 SuperStreet kit pairs aggressive Yellowstuff pads with GD dimpled/slotted rotors. Engineered for spirited street driving and track days. Significant improvement over stock braking. Includes stainless steel brake lines.',
   true),

-- ============================================================
-- PRODUCTS — Turbosmart
-- ============================================================
  ('TS-0205-1065', (SELECT id FROM brands WHERE turn14_id='TURBO'), (SELECT id FROM categories WHERE turn14_id='CAT-BOV'),
   'TS-0205-1065', 'TS-0205-1065', 'Turbosmart Kompact Plumb Back BOV',
   'Direct-fit recirculating blow-off valve',
   'The Turbosmart Kompact Plumb Back is a direct-fit replacement for the factory bypass valve. Fully recirculating design maintains MAF sensor calibration. Billet aluminum construction, no boost leaks. Significant improvement in boost response over stock valve.',
   true),
  ('TS-0205-1015', (SELECT id FROM brands WHERE turn14_id='TURBO'), (SELECT id FROM categories WHERE turn14_id='CAT-BOV'),
   'TS-0205-1015', 'TS-0205-1015', 'Turbosmart Kompact Dual Port BOV',
   'Dual-port blow-off valve with atmospheric and recirculating ports',
   'The Kompact Dual Port offers the best of both worlds with separate atmospheric and recirculating ports. Adjustable bias between full recirc and full atmosphere. Direct plug-and-play fitment.',
   true),
  ('TS-0501-3002', (SELECT id FROM brands WHERE turn14_id='TURBO'), (SELECT id FROM categories WHERE turn14_id='CAT-WG'),
   'TS-0501-3002', 'TS-0501-3002', 'Turbosmart IWG75 Internal Wastegate Actuator',
   'High-performance internal wastegate actuator',
   'The Turbosmart IWG75 replaces the factory wastegate actuator with a more precise, higher-quality unit. Available in multiple spring rates for different boost targets. CNC machined bracket and billet aluminum canister.',
   true),
  ('TS-0301-3017', (SELECT id FROM brands WHERE turn14_id='TURBO'), (SELECT id FROM categories WHERE turn14_id='CAT-WG'),
   'TS-0301-3017', 'TS-0301-3017', 'Turbosmart Hyper-Gate45 External Wastegate',
   '45mm external wastegate for high-performance turbo applications',
   'The Hyper-Gate45 is a premium 45mm external wastegate for custom turbo builds. Features liquid-cooled valve seat, ultra-responsive diaphragm, and 4-port boost control capability. V-band flanges for easy installation.',
   true),
  ('TS-0803-1002', (SELECT id FROM brands WHERE turn14_id='TURBO'), (SELECT id FROM categories WHERE turn14_id='CAT-FUEL'),
   'TS-0803-1002', 'TS-0803-1002', 'Turbosmart FPR800 Fuel Pressure Regulator',
   '1:1 rising rate fuel pressure regulator',
   'The FPR800 fuel pressure regulator provides precise 1:1 rising rate fuel pressure control. Supports up to 800HP. CNC billet aluminum body, Viton diaphragm. -6AN fittings included.',
   true),
  ('TS-0104-1010', (SELECT id FROM brands WHERE turn14_id='TURBO'), (SELECT id FROM categories WHERE turn14_id='CAT-BOOST'),
   'TS-0104-1010', 'TS-0104-1010', 'Turbosmart eBoost2 Electronic Boost Controller 60mm',
   'Full-color display electronic boost controller',
   'The eBoost2 features a 60mm full-color display, 6 boost presets, overboost shutdown, gate pressure display, and peak recall. Closed-loop control for precise boost targeting. Includes all solenoids and hardware.',
   true),

-- ============================================================
-- PRODUCTS — Snow Performance
-- ============================================================
  ('SNO-210', (SELECT id FROM brands WHERE turn14_id='SNOW'), (SELECT id FROM categories WHERE turn14_id='CAT-INJECT'),
   'SNO-210', 'SNO-210', 'Snow Performance Stage 2 MAF/MAP Water-Methanol Injection Kit',
   'Boost-referenced water/methanol injection for turbocharged vehicles',
   'The Stage 2 kit uses your vehicle''s boost pressure to progressively inject water/methanol mixture. Includes 3-quart reservoir, high-output pump, nozzle, check valve, and all hardware. Reduces intake temps by up to 70°F and suppresses detonation for safe power gains.',
   true),
  ('SNO-212', (SELECT id FROM brands WHERE turn14_id='SNOW'), (SELECT id FROM categories WHERE turn14_id='CAT-INJECT'),
   'SNO-212', 'SNO-212', 'Snow Performance Stage 2.5 Boost Cooler Water-Methanol Kit',
   'Progressive controller water/methanol injection with failsafe',
   'The Stage 2.5 includes the VC-50 progressive controller for precise injection mapping based on boost level. Features low-fluid failsafe (reduces boost if fluid runs out). Includes 3-quart reservoir, pump, nozzle, and complete wiring.',
   true),
  ('SNO-310', (SELECT id FROM brands WHERE turn14_id='SNOW'), (SELECT id FROM categories WHERE turn14_id='CAT-INJECT'),
   'SNO-310', 'SNO-310', 'Snow Performance Stage 3 DI Water-Methanol Injection Kit',
   'Direct-injection water/methanol kit with controller',
   'The Stage 3 DI kit is designed specifically for direct-injection turbocharged engines. Reduces carbon buildup on intake valves while adding performance. Progressive controller, stainless braided lines, and high-flow nozzle included.',
   true),
  ('SNO-40012', (SELECT id FROM brands WHERE turn14_id='SNOW'), (SELECT id FROM categories WHERE turn14_id='CAT-INJECT'),
   'SNO-40012', 'SNO-40012', 'Snow Performance Boost Juice 1 Gallon',
   'Pre-mixed 49% methanol / 51% water injection fluid',
   'Snow Performance Boost Juice is a pre-mixed 49% methanol and 51% de-ionized water solution. Optimized ratio for maximum performance and safety. Compatible with all Snow Performance injection kits. 1 gallon container.',
   true),

-- ============================================================
-- PRODUCTS — aFe Power
-- ============================================================
  ('AFE-54-12202', (SELECT id FROM brands WHERE turn14_id='AFE'), (SELECT id FROM categories WHERE turn14_id='CAT-INTAKE'),
   '54-12202', '54-12202', 'aFe Power Magnum FORCE Stage 2 Cold Air Intake',
   'Performance cold air intake with Pro 5R oiled filter',
   'The Magnum FORCE Stage 2 features a sealed airbox that isolates the filter from engine heat. Pro 5R oiled cotton gauze filter provides excellent filtration and airflow. Dyno-proven power gains. Roto-molded tube for smooth airflow. Includes all clamps and hardware.',
   true),
  ('AFE-54-13036D', (SELECT id FROM brands WHERE turn14_id='AFE'), (SELECT id FROM categories WHERE turn14_id='CAT-INTAKE'),
   '54-13036D', '54-13036D', 'aFe Power Momentum GT Cold Air Intake System',
   'Full enclosed intake system with one-piece sealed housing',
   'The Momentum GT features a massive one-piece sealed intake housing for maximum airflow. Large Pro DRY S filter (dry, no oil). 360-degree radial flow design. Constructed from cross-linked high-density polyethylene for heat resistance and durability.',
   true),
  ('AFE-54-12852', (SELECT id FROM brands WHERE turn14_id='AFE'), (SELECT id FROM categories WHERE turn14_id='CAT-INTAKE'),
   '54-12852', '54-12852', 'aFe Power Takeda Stage 2 Cold Air Intake',
   'Polished aluminum cold air intake for import vehicles',
   'The Takeda Stage 2 features a mandrel-bent polished aluminum intake tube with clear powder coat finish. Pro DRY S washable/reusable filter. Heat shield included for thermal protection. Direct bolt-on, no cutting required.',
   true),
  ('AFE-49-43086-B', (SELECT id FROM brands WHERE turn14_id='AFE'), (SELECT id FROM categories WHERE turn14_id='CAT-EXHAUST'),
   '49-43086-B', '49-43086-B', 'aFe Power MACH Force-Xp Cat-Back Exhaust 3"',
   'Stainless steel performance cat-back exhaust system',
   'The MACH Force-Xp cat-back exhaust features 3-inch mandrel-bent stainless steel tubing for unrestricted flow. Polished stainless tips. High-flow muffler with resonated design for deep tone without drone. Direct bolt-on replacement.',
   true),
  ('AFE-48-46206', (SELECT id FROM brands WHERE turn14_id='AFE'), (SELECT id FROM categories WHERE turn14_id='CAT-EXHAUST'),
   '48-46206', '48-46206', 'aFe Power Twisted Steel Downpipe 3"',
   'Performance downpipe for turbocharged engines',
   'aFe Twisted Steel downpipe with 3" mandrel-bent 304 stainless steel construction. High-flow catalytic converter maintains emissions compliance. Significant reduction in backpressure for improved turbo spool and power.',
   true),
  ('AFE-24-91203', (SELECT id FROM brands WHERE turn14_id='AFE'), (SELECT id FROM categories WHERE turn14_id='CAT-FILTER'),
   '24-91203', '24-91203', 'aFe Power Pro DRY S Drop-In Replacement Filter',
   'High-flow dry replacement air filter',
   'Direct drop-in replacement for factory air filter. Pro DRY S synthetic media provides excellent filtration without oil. Washable and reusable for the life of the vehicle. Outflows stock paper filters by up to 31%.',
   true),

-- ============================================================
-- PRODUCTS — Injen
-- ============================================================
  ('INJEN-SP1572BLK', (SELECT id FROM brands WHERE turn14_id='INJEN'), (SELECT id FROM categories WHERE turn14_id='CAT-INTAKE'),
   'SP1572BLK', 'SP1572BLK', 'Injen SP Series Cold Air Intake - Black',
   'Tuned cold air intake with MR Technology',
   'The Injen SP Series cold air intake features patented MR Technology tuning for safe and consistent power gains. Mandrel-bent 6061-T6 aluminum tubing with black powder coat finish. SuperNano-Web dry filter included. 50-state legal (CARB EO). Dyno tested.',
   true),
  ('INJEN-SP1583P', (SELECT id FROM brands WHERE turn14_id='INJEN'), (SELECT id FROM categories WHERE turn14_id='CAT-INTAKE'),
   'SP1583P', 'SP1583P', 'Injen SP Series Cold Air Intake - Polished',
   'Polished aluminum cold air intake with heat shield',
   'The SP Series polished cold air intake with integrated heat shield for optimal air temperature control. MR Technology tuned for maximum power without check engine lights. Includes SuperNano-Web dry filter, all brackets and hardware. CARB legal.',
   true),
  ('INJEN-EVO5301', (SELECT id FROM brands WHERE turn14_id='INJEN'), (SELECT id FROM categories WHERE turn14_id='CAT-INTAKE'),
   'EVO5301', 'EVO5301', 'Injen Evolution Cold Air Intake',
   'Roto-molded sealed cold air intake system',
   'The Injen Evolution features a fully sealed roto-molded intake housing that isolates the filter from engine heat. Large surface area dry filter for maximum filtration and flow. OEM quality construction with dyno-proven power gains. Direct bolt-on.',
   true),
  ('INJEN-SES1572', (SELECT id FROM brands WHERE turn14_id='INJEN'), (SELECT id FROM categories WHERE turn14_id='CAT-EXHAUST'),
   'SES1572', 'SES1572', 'Injen SES Intercooler Piping Kit - Polished',
   'Aluminum intercooler piping upgrade kit',
   'The Injen SES intercooler piping kit replaces restrictive factory rubber couplers with polished aluminum tubing. Reduces pressure drop between turbo and intercooler. Includes silicone couplers and T-bolt clamps. Direct replacement, no cutting.',
   true),
  ('INJEN-SP9060P', (SELECT id FROM brands WHERE turn14_id='INJEN'), (SELECT id FROM categories WHERE turn14_id='CAT-INTAKE'),
   'SP9060P', 'SP9060P', 'Injen SP Series Short Ram Intake - Polished',
   'Short ram intake for naturally aspirated engines',
   'The Injen SP Short Ram intake offers a simple bolt-on power increase for NA engines. Mandrel-bent polished aluminum tube. High-flow SuperNano-Web dry filter. Tuned with MR Technology. Easy 30-minute install. CARB EO legal.',
   true)
ON CONFLICT (turn14_id) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description;

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE turn14_id LIKE 'GFB%' OR turn14_id LIKE 'EBC%' OR turn14_id LIKE 'TS-%' OR turn14_id LIKE 'SNO-%' OR turn14_id LIKE 'AFE-%' OR turn14_id LIKE 'INJEN-%');

INSERT INTO product_images (product_id, url, sort_order, is_primary)
SELECT p.id, i.url, i.sort, i.prime FROM (VALUES
  -- GFB
  ('GFB-T9351', 'https://images.turn14.com/getimage/?type=0&id=2905151', 0, true),
  ('GFB-T9351', 'https://images.turn14.com/getimage/?type=0&id=2905152', 1, false),
  ('GFB-T9352', 'https://images.turn14.com/getimage/?type=0&id=2905161', 0, true),
  ('GFB-T9352', 'https://images.turn14.com/getimage/?type=0&id=2905162', 1, false),
  ('GFB-T9355', 'https://images.turn14.com/getimage/?type=0&id=2905171', 0, true),
  ('GFB-7001',  'https://images.turn14.com/getimage/?type=0&id=2905201', 0, true),
  ('GFB-3005',  'https://images.turn14.com/getimage/?type=0&id=2905211', 0, true),
  -- EBC
  ('EBC-DP31210C',  'https://images.turn14.com/getimage/?type=0&id=3101001', 0, true),
  ('EBC-DP31210C',  'https://images.turn14.com/getimage/?type=0&id=3101002', 1, false),
  ('EBC-DP32127C',  'https://images.turn14.com/getimage/?type=0&id=3101011', 0, true),
  ('EBC-GD7210',    'https://images.turn14.com/getimage/?type=0&id=3101021', 0, true),
  ('EBC-GD7210',    'https://images.turn14.com/getimage/?type=0&id=3101022', 1, false),
  ('EBC-USR7416',   'https://images.turn14.com/getimage/?type=0&id=3101031', 0, true),
  ('EBC-S1KF1762',  'https://images.turn14.com/getimage/?type=0&id=3101041', 0, true),
  ('EBC-S5KF1866',  'https://images.turn14.com/getimage/?type=0&id=3101051', 0, true),
  -- Turbosmart
  ('TS-0205-1065',  'https://images.turn14.com/getimage/?type=0&id=3201001', 0, true),
  ('TS-0205-1015',  'https://images.turn14.com/getimage/?type=0&id=3201011', 0, true),
  ('TS-0501-3002',  'https://images.turn14.com/getimage/?type=0&id=3201021', 0, true),
  ('TS-0301-3017',  'https://images.turn14.com/getimage/?type=0&id=3201031', 0, true),
  ('TS-0803-1002',  'https://images.turn14.com/getimage/?type=0&id=3201041', 0, true),
  ('TS-0104-1010',  'https://images.turn14.com/getimage/?type=0&id=3201051', 0, true),
  -- Snow Performance
  ('SNO-210',    'https://images.turn14.com/getimage/?type=0&id=3301001', 0, true),
  ('SNO-210',    'https://images.turn14.com/getimage/?type=0&id=3301002', 1, false),
  ('SNO-212',    'https://images.turn14.com/getimage/?type=0&id=3301011', 0, true),
  ('SNO-310',    'https://images.turn14.com/getimage/?type=0&id=3301021', 0, true),
  ('SNO-40012',  'https://images.turn14.com/getimage/?type=0&id=3301031', 0, true),
  -- aFe Power
  ('AFE-54-12202',   'https://images.turn14.com/getimage/?type=0&id=3401001', 0, true),
  ('AFE-54-12202',   'https://images.turn14.com/getimage/?type=0&id=3401002', 1, false),
  ('AFE-54-13036D',  'https://images.turn14.com/getimage/?type=0&id=3401011', 0, true),
  ('AFE-54-12852',   'https://images.turn14.com/getimage/?type=0&id=3401021', 0, true),
  ('AFE-49-43086-B', 'https://images.turn14.com/getimage/?type=0&id=3401031', 0, true),
  ('AFE-49-43086-B', 'https://images.turn14.com/getimage/?type=0&id=3401032', 1, false),
  ('AFE-48-46206',   'https://images.turn14.com/getimage/?type=0&id=3401041', 0, true),
  ('AFE-24-91203',   'https://images.turn14.com/getimage/?type=0&id=3401051', 0, true),
  -- Injen
  ('INJEN-SP1572BLK', 'https://images.turn14.com/getimage/?type=0&id=3501001', 0, true),
  ('INJEN-SP1572BLK', 'https://images.turn14.com/getimage/?type=0&id=3501002', 1, false),
  ('INJEN-SP1583P',   'https://images.turn14.com/getimage/?type=0&id=3501011', 0, true),
  ('INJEN-EVO5301',   'https://images.turn14.com/getimage/?type=0&id=3501021', 0, true),
  ('INJEN-SES1572',   'https://images.turn14.com/getimage/?type=0&id=3501031', 0, true),
  ('INJEN-SP9060P',   'https://images.turn14.com/getimage/?type=0&id=3501041', 0, true)
) AS i(t14id, url, sort, prime)
JOIN products p ON p.turn14_id = i.t14id;

-- ============================================================
-- PRODUCT PRICING
-- ============================================================
INSERT INTO product_pricing (product_id, retail_price, jobber_price, map_price, cost, can_purchase)
SELECT p.id, pr.retail, pr.jobber, pr.map, pr.cost, true FROM (VALUES
  -- GFB
  ('GFB-T9351',  299.00, 239.00, 269.00, 179.00),
  ('GFB-T9352',  399.00, 319.00, 359.00, 239.00),
  ('GFB-T9355',  249.00, 199.00, 224.00, 149.00),
  ('GFB-7001',   349.00, 279.00, 314.00, 209.00),
  ('GFB-3005',   449.00, 359.00, 404.00, 269.00),
  -- EBC
  ('EBC-DP31210C',  159.99, 127.99, 143.99, 95.99),
  ('EBC-DP32127C',  139.99, 111.99, 125.99, 83.99),
  ('EBC-GD7210',    249.99, 199.99, 224.99, 149.99),
  ('EBC-USR7416',   219.99, 175.99, 197.99, 131.99),
  ('EBC-S1KF1762',  329.99, 263.99, 296.99, 197.99),
  ('EBC-S5KF1866',  549.99, 439.99, 494.99, 329.99),
  -- Turbosmart
  ('TS-0205-1065',  249.95, 199.95, 224.95, 149.95),
  ('TS-0205-1015',  299.95, 239.95, 269.95, 179.95),
  ('TS-0501-3002',  199.95, 159.95, 179.95, 119.95),
  ('TS-0301-3017',  449.95, 359.95, 404.95, 269.95),
  ('TS-0803-1002',  199.95, 159.95, 179.95, 119.95),
  ('TS-0104-1010',  599.95, 479.95, 539.95, 359.95),
  -- Snow Performance
  ('SNO-210',    399.00, 319.00, 359.00, 239.00),
  ('SNO-212',    549.00, 439.00, 494.00, 329.00),
  ('SNO-310',    649.00, 519.00, 584.00, 389.00),
  ('SNO-40012',   24.99,  19.99,  22.49,  14.99),
  -- aFe Power
  ('AFE-54-12202',   349.00, 279.00, 314.00, 209.00),
  ('AFE-54-13036D',  449.00, 359.00, 404.00, 269.00),
  ('AFE-54-12852',   329.00, 263.00, 296.00, 197.00),
  ('AFE-49-43086-B', 899.00, 719.00, 809.00, 539.00),
  ('AFE-48-46206',   599.00, 479.00, 539.00, 359.00),
  ('AFE-24-91203',    59.99,  47.99,  53.99,  35.99),
  -- Injen
  ('INJEN-SP1572BLK', 299.95, 239.95, 269.95, 179.95),
  ('INJEN-SP1583P',   319.95, 255.95, 287.95, 191.95),
  ('INJEN-EVO5301',   399.95, 319.95, 359.95, 239.95),
  ('INJEN-SES1572',   249.95, 199.95, 224.95, 149.95),
  ('INJEN-SP9060P',   249.95, 199.95, 224.95, 149.95)
) AS pr(t14id, retail, jobber, map, cost)
JOIN products p ON p.turn14_id = pr.t14id
ON CONFLICT (product_id) DO UPDATE SET
  retail_price = EXCLUDED.retail_price, jobber_price = EXCLUDED.jobber_price,
  map_price = EXCLUDED.map_price, cost = EXCLUDED.cost;

-- ============================================================
-- INVENTORY
-- ============================================================
INSERT INTO inventory (product_id, warehouse, quantity)
SELECT p.id, inv.warehouse, inv.qty FROM (VALUES
  ('GFB-T9351', 'US-East', 24),  ('GFB-T9351', 'US-West', 18),
  ('GFB-T9352', 'US-East', 15),  ('GFB-T9352', 'US-West', 12),
  ('GFB-T9355', 'US-East', 30),  ('GFB-T9355', 'US-West', 22),
  ('GFB-7001',  'US-East', 10),  ('GFB-7001',  'US-West', 8),
  ('GFB-3005',  'US-East', 7),   ('GFB-3005',  'US-West', 5),
  ('EBC-DP31210C', 'US-East', 45), ('EBC-DP31210C', 'US-West', 38),
  ('EBC-DP32127C', 'US-East', 40), ('EBC-DP32127C', 'US-West', 35),
  ('EBC-GD7210',   'US-East', 20), ('EBC-GD7210',   'US-West', 16),
  ('EBC-USR7416',  'US-East', 25), ('EBC-USR7416',  'US-West', 20),
  ('EBC-S1KF1762', 'US-East', 12), ('EBC-S1KF1762', 'US-West', 10),
  ('EBC-S5KF1866', 'US-East', 8),  ('EBC-S5KF1866', 'US-West', 6),
  ('TS-0205-1065', 'US-East', 20), ('TS-0205-1065', 'US-West', 15),
  ('TS-0205-1015', 'US-East', 18), ('TS-0205-1015', 'US-West', 14),
  ('TS-0501-3002', 'US-East', 25), ('TS-0501-3002', 'US-West', 20),
  ('TS-0301-3017', 'US-East', 6),  ('TS-0301-3017', 'US-West', 4),
  ('TS-0803-1002', 'US-East', 15), ('TS-0803-1002', 'US-West', 12),
  ('TS-0104-1010', 'US-East', 5),  ('TS-0104-1010', 'US-West', 3),
  ('SNO-210',   'US-East', 22), ('SNO-210',   'US-West', 18),
  ('SNO-212',   'US-East', 14), ('SNO-212',   'US-West', 10),
  ('SNO-310',   'US-East', 8),  ('SNO-310',   'US-West', 6),
  ('SNO-40012', 'US-East', 100),('SNO-40012', 'US-West', 80),
  ('AFE-54-12202',   'US-East', 30), ('AFE-54-12202',   'US-West', 25),
  ('AFE-54-13036D',  'US-East', 20), ('AFE-54-13036D',  'US-West', 15),
  ('AFE-54-12852',   'US-East', 22), ('AFE-54-12852',   'US-West', 18),
  ('AFE-49-43086-B', 'US-East', 10), ('AFE-49-43086-B', 'US-West', 8),
  ('AFE-48-46206',   'US-East', 12), ('AFE-48-46206',   'US-West', 10),
  ('AFE-24-91203',   'US-East', 60), ('AFE-24-91203',   'US-West', 50),
  ('INJEN-SP1572BLK', 'US-East', 28), ('INJEN-SP1572BLK', 'US-West', 22),
  ('INJEN-SP1583P',   'US-East', 20), ('INJEN-SP1583P',   'US-West', 16),
  ('INJEN-EVO5301',   'US-East', 15), ('INJEN-EVO5301',   'US-West', 12),
  ('INJEN-SES1572',   'US-East', 18), ('INJEN-SES1572',   'US-West', 14),
  ('INJEN-SP9060P',   'US-East', 25), ('INJEN-SP9060P',   'US-West', 20)
) AS inv(t14id, warehouse, qty)
JOIN products p ON p.turn14_id = inv.t14id
ON CONFLICT (product_id, warehouse) DO UPDATE SET quantity = EXCLUDED.quantity;

-- ============================================================
-- PRODUCT FITMENT (Vehicle Compatibility)
-- ============================================================

-- Helper: get IDs
-- GFB Respons TMS — fits WRX, Golf GTI, Golf R, Audi A4/S4, Focus ST
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id,
  (SELECT id FROM vehicle_submodels WHERE model_id = mo.id LIMIT 1),
  (SELECT id FROM vehicle_engines WHERE name LIKE '%2.0L Turbo%' LIMIT 1)
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Subaru', 'WRX'), ('Volkswagen', 'Golf GTI'), ('Volkswagen', 'Golf R'), ('Audi', 'A4'), ('Audi', 'S4'), ('Ford', 'Focus ST')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'GFB-T9351'
ON CONFLICT DO NOTHING;

-- GFB Deceptor Pro II — fits WRX, Evo, Golf GTI, Audi RS3
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL,
  (SELECT id FROM vehicle_engines WHERE name LIKE '%2.0L Turbo%' LIMIT 1)
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Subaru', 'WRX'), ('Volkswagen', 'Golf GTI'), ('Volkswagen', 'Golf R'), ('Audi', 'RS3')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'GFB-T9352'
ON CONFLICT DO NOTHING;

-- GFB Boost Controller — universal turbo fitment
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Subaru', 'WRX'), ('Ford', 'Mustang'), ('Volkswagen', 'Golf GTI'), ('Volkswagen', 'Golf R'), ('Ford', 'Focus ST'), ('Ford', 'Focus RS')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'GFB-3005'
ON CONFLICT DO NOTHING;

-- EBC Redstuff Front — Mustang GT, Camaro SS, Challenger, WRX
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id,
  (SELECT id FROM vehicle_submodels WHERE model_id = mo.id LIMIT 1),
  NULL
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Ford', 'Mustang'), ('Chevrolet', 'Camaro'), ('Dodge', 'Challenger'), ('Subaru', 'WRX'), ('BMW', '335i'), ('BMW', 'M3')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'EBC-DP31210C'
ON CONFLICT DO NOTHING;

-- EBC Redstuff Rear — same fitment as front
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Ford', 'Mustang'), ('Chevrolet', 'Camaro'), ('Dodge', 'Challenger'), ('Subaru', 'WRX'), ('BMW', '335i'), ('BMW', 'M3')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'EBC-DP32127C'
ON CONFLICT DO NOTHING;

-- EBC GD Rotors — Mustang, Camaro, WRX, Civic Type R
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2016, 2024) AS y(yr)
CROSS JOIN (VALUES ('Ford', 'Mustang'), ('Chevrolet', 'Camaro'), ('Subaru', 'WRX'), ('Honda', 'Civic Type R')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'EBC-GD7210'
ON CONFLICT DO NOTHING;

-- EBC Stage 5 Kit — Mustang GT, Camaro SS
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id,
  (SELECT id FROM vehicle_submodels WHERE model_id = mo.id LIMIT 1),
  NULL
FROM products p
CROSS JOIN generate_series(2018, 2024) AS y(yr)
CROSS JOIN (VALUES ('Ford', 'Mustang'), ('Chevrolet', 'Camaro'), ('Dodge', 'Challenger')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'EBC-S5KF1866'
ON CONFLICT DO NOTHING;

-- Turbosmart Kompact BOV — WRX, Golf GTI, Golf R, Focus ST, RS3
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL,
  (SELECT id FROM vehicle_engines WHERE name LIKE '%2.0L Turbo%' LIMIT 1)
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Subaru', 'WRX'), ('Volkswagen', 'Golf GTI'), ('Volkswagen', 'Golf R'), ('Ford', 'Focus ST'), ('Audi', 'RS3'), ('Audi', 'S4')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id IN ('TS-0205-1065', 'TS-0205-1015')
ON CONFLICT DO NOTHING;

-- Turbosmart eBoost2 — universal turbo
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Subaru', 'WRX'), ('Ford', 'Mustang'), ('Volkswagen', 'Golf R'), ('Ford', 'Focus RS'), ('Mitsubishi', 'Lancer Evolution'), ('BMW', '335i')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'TS-0104-1010'
ON CONFLICT DO NOTHING;

-- Snow Performance Stage 2 — WRX, Golf GTI, Focus ST, Mustang EcoBoost
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Subaru', 'WRX'), ('Volkswagen', 'Golf GTI'), ('Volkswagen', 'Golf R'), ('Ford', 'Focus ST'), ('Ford', 'Mustang'), ('BMW', '335i')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id IN ('SNO-210', 'SNO-212', 'SNO-310')
ON CONFLICT DO NOTHING;

-- aFe Magnum FORCE Intake — F-150, Tacoma, Silverado, Mustang GT
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id,
  (SELECT id FROM vehicle_submodels WHERE model_id = mo.id LIMIT 1),
  NULL
FROM products p
CROSS JOIN generate_series(2017, 2024) AS y(yr)
CROSS JOIN (VALUES ('Ford', 'F-150'), ('Toyota', 'Tacoma'), ('Chevrolet', 'Silverado 1500'), ('Ford', 'Mustang')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'AFE-54-12202'
ON CONFLICT DO NOTHING;

-- aFe Momentum GT — Wrangler, Gladiator, 4Runner, Bronco
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id,
  (SELECT id FROM vehicle_submodels WHERE model_id = mo.id LIMIT 1),
  NULL
FROM products p
CROSS JOIN generate_series(2018, 2024) AS y(yr)
CROSS JOIN (VALUES ('Jeep', 'Wrangler'), ('Jeep', 'Gladiator'), ('Toyota', '4Runner'), ('Ford', 'Bronco')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'AFE-54-13036D'
ON CONFLICT DO NOTHING;

-- aFe Takeda Intake — Civic Type R, WRX, BRZ, GR86, Accord
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2017, 2024) AS y(yr)
CROSS JOIN (VALUES ('Honda', 'Civic Type R'), ('Subaru', 'WRX'), ('Subaru', 'BRZ'), ('Toyota', 'GR86'), ('Honda', 'Accord')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'AFE-54-12852'
ON CONFLICT DO NOTHING;

-- aFe MACH Force Exhaust — Mustang GT, Camaro SS, Challenger
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id,
  (SELECT id FROM vehicle_submodels WHERE model_id = mo.id LIMIT 1),
  NULL
FROM products p
CROSS JOIN generate_series(2018, 2024) AS y(yr)
CROSS JOIN (VALUES ('Ford', 'Mustang'), ('Chevrolet', 'Camaro'), ('Dodge', 'Challenger')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'AFE-49-43086-B'
ON CONFLICT DO NOTHING;

-- aFe Downpipe — WRX, Golf GTI, Golf R, Focus ST, Focus RS, A4
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL,
  (SELECT id FROM vehicle_engines WHERE name LIKE '%2.0L Turbo%' LIMIT 1)
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Subaru', 'WRX'), ('Volkswagen', 'Golf GTI'), ('Volkswagen', 'Golf R'), ('Ford', 'Focus ST'), ('Ford', 'Focus RS'), ('Audi', 'A4')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'AFE-48-46206'
ON CONFLICT DO NOTHING;

-- aFe Drop-In Filter — universal popular cars
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES
  ('Ford', 'Mustang'), ('Ford', 'F-150'), ('Chevrolet', 'Camaro'), ('Toyota', 'Tacoma'),
  ('Honda', 'Civic'), ('Subaru', 'WRX'), ('Volkswagen', 'Golf GTI'), ('Toyota', 'Tundra')
) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'AFE-24-91203'
ON CONFLICT DO NOTHING;

-- Injen SP Black — Civic Type R, WRX, Golf GTI, Veloster N
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2017, 2024) AS y(yr)
CROSS JOIN (VALUES ('Honda', 'Civic Type R'), ('Subaru', 'WRX'), ('Volkswagen', 'Golf GTI'), ('Hyundai', 'Veloster N')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'INJEN-SP1572BLK'
ON CONFLICT DO NOTHING;

-- Injen SP Polished — Mustang EcoBoost, Focus ST, Civic Si, Accord
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2016, 2024) AS y(yr)
CROSS JOIN (VALUES ('Ford', 'Mustang'), ('Ford', 'Focus ST'), ('Honda', 'Civic'), ('Honda', 'Accord')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'INJEN-SP1583P'
ON CONFLICT DO NOTHING;

-- Injen Evolution — F-150, Tacoma, Silverado, Ram 1500, Tundra
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id,
  (SELECT id FROM vehicle_submodels WHERE model_id = mo.id LIMIT 1),
  NULL
FROM products p
CROSS JOIN generate_series(2017, 2024) AS y(yr)
CROSS JOIN (VALUES ('Ford', 'F-150'), ('Toyota', 'Tacoma'), ('Chevrolet', 'Silverado 1500'), ('Dodge', 'Ram 1500'), ('Toyota', 'Tundra')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'INJEN-EVO5301'
ON CONFLICT DO NOTHING;

-- Injen SES IC Piping — WRX, Golf R, Focus RS, Mustang EcoBoost
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL, NULL
FROM products p
CROSS JOIN generate_series(2015, 2024) AS y(yr)
CROSS JOIN (VALUES ('Subaru', 'WRX'), ('Volkswagen', 'Golf R'), ('Ford', 'Focus RS'), ('Ford', 'Mustang')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'INJEN-SES1572'
ON CONFLICT DO NOTHING;

-- Injen SP Short Ram — MX-5 Miata, BRZ, GR86, 370Z
INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id)
SELECT p.id, y.yr, mk.id, mo.id, NULL,
  (SELECT id FROM vehicle_engines WHERE name LIKE '%2.0L Naturally%' LIMIT 1)
FROM products p
CROSS JOIN generate_series(2016, 2024) AS y(yr)
CROSS JOIN (VALUES ('Mazda', 'MX-5 Miata'), ('Subaru', 'BRZ'), ('Toyota', 'GR86'), ('Nissan', '370Z')) AS v(make, model)
JOIN vehicle_makes mk ON mk.name = v.make
JOIN vehicle_models mo ON mo.name = v.model AND mo.make_id = mk.id
WHERE p.turn14_id = 'INJEN-SP9060P'
ON CONFLICT DO NOTHING;

-- ============================================================
-- REFRESH MATERIALIZED VIEW
-- ============================================================
REFRESH MATERIALIZED VIEW product_inventory_totals;

COMMIT;
