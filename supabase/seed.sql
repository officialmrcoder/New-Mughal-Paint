-- ==========================================
-- New Mughal Paint - Supabase Seed Data
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ==========================================

-- Create admin and customer users in auth.users
-- Note: Supabase requires the auth.users insert; profiles trigger handles the rest
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@newmughal.com', '$2a$10$placeholderhash', NOW(), '{"name":"Mughal Admin"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'customer@test.com', '$2a$10$placeholderhash', NOW(), '{"name":"Anas Malik"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Update profiles with role and contact info (created by trigger)
INSERT INTO public.profiles (id, name, email, phone, address, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin', 'admin@newmughal.com', '+92 300 1234567', 'Lahore', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Anas Malik', 'customer@test.com', '+92 321 9876543', 'Gulberg III, Lahore', 'user')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, phone = EXCLUDED.phone, address = EXCLUDED.address;

-- Categories
INSERT INTO public.categories (id, name, slug)
VALUES
  ('cat-0001-0000-0000-000000000001', 'Interior', 'interior'),
  ('cat-0001-0000-0000-000000000002', 'Exterior', 'exterior'),
  ('cat-0001-0000-0000-000000000003', 'Wood Finish', 'wood-finish')
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO public.products (id, name, category_id, description, base_price, image_url)
VALUES
  (
    'prod-0001-0000-0000-000000000001',
    'Silk Emulsion',
    'cat-0001-0000-0000-000000000001',
    'A rich silk emulsion with a smooth velvet finish that reflects light elegantly. Splatter-resistant and highly washable.',
    3400,
    'https://picsum.photos/seed/paint1/600/400'
  ),
  (
    'prod-0001-0000-0000-000000000002',
    'Velvet Matt Finish',
    'cat-0001-0000-0000-000000000001',
    'An elegant, completely flat matt finish designed to hide plaster imperfections while delivering stunning, deep color. Highly breathable and durable.',
    2900,
    'https://picsum.photos/seed/paint2/600/400'
  ),
  (
    'prod-0001-0000-0000-000000000003',
    'Weather Shield Exterior',
    'cat-0001-0000-0000-000000000002',
    'Ultra-durable exterior paint with heat-reflective technology to resist extreme sun, monsoon rain, and pollution. Keeps your home cool and pristine.',
    4200,
    'https://picsum.photos/seed/paint3/600/400'
  ),
  (
    'prod-0001-0000-0000-000000000004',
    'All Weather Guard',
    'cat-0001-0000-0000-000000000002',
    'Advanced protective shell for exterior walls, guarding against mold, salt-bursting, algae, and UV-degradation. Long-lasting vibrant color retention.',
    3800,
    'https://picsum.photos/seed/paint4/600/400'
  ),
  (
    'prod-0001-0000-0000-000000000005',
    'High Gloss Enamel',
    'cat-0001-0000-0000-000000000003',
    'Superior oil-based high gloss enamel for wooden doors, windows, and steel structures. Rust-preventative and anti-yellowing.',
    2800,
    'https://picsum.photos/seed/paint5/600/400'
  ),
  (
    'prod-0001-0000-0000-000000000006',
    'Wood Lacquer',
    'cat-0001-0000-0000-000000000003',
    'A high-clarity protective polyurethane wood coating that accentuates natural wood grain while offering scratch and moisture resistance.',
    3200,
    'https://picsum.photos/seed/paint6/600/400'
  )
ON CONFLICT (id) DO NOTHING;

-- Product Shades (price_override null means base price applies)
INSERT INTO public.product_shades (id, product_id, shade_name, color_code, price_override)
VALUES
  -- Silk Emulsion shades
  ('shade-1-01-0000-0000-000000000001', 'prod-0001-0000-0000-000000000001', 'Ivory White', '#FDFBF7', NULL),
  ('shade-1-01-0000-0000-000000000002', 'prod-0001-0000-0000-000000000001', 'Deep Maroon', '#8B1E2A', 150),
  ('shade-1-01-0000-0000-000000000003', 'prod-0001-0000-0000-000000000001', 'Golden Ochre', '#D4AF37', 100),
  -- Velvet Matt Finish shades
  ('shade-2-01-0000-0000-000000000001', 'prod-0001-0000-0000-000000000002', 'Warm Gold', '#C5A059', 120),
  ('shade-2-01-0000-0000-000000000002', 'prod-0001-0000-0000-000000000002', 'Cream', '#FAF4E7', NULL),
  ('shade-2-01-0000-0000-000000000003', 'prod-0001-0000-0000-000000000002', 'Dusty Rose', '#D3A3A3', 80),
  -- Weather Shield Exterior shades
  ('shade-3-01-0000-0000-000000000001', 'prod-0001-0000-0000-000000000003', 'Fortress Gray', '#A79E92', NULL),
  ('shade-3-01-0000-0000-000000000002', 'prod-0001-0000-0000-000000000003', 'Off White', '#F7F4EB', NULL),
  ('shade-3-01-0000-0000-000000000003', 'prod-0001-0000-0000-000000000003', 'Terracotta', '#C05C46', 200),
  -- All Weather Guard shades
  ('shade-4-01-0000-0000-000000000001', 'prod-0001-0000-0000-000000000004', 'Sandstone Beige', '#E3DAC9', NULL),
  ('shade-4-01-0000-0000-000000000002', 'prod-0001-0000-0000-000000000004', 'Slate Blue', '#4A6984', 150),
  ('shade-4-01-0000-0000-000000000003', 'prod-0001-0000-0000-000000000004', 'Sage Green', '#8FA89B', NULL),
  -- High Gloss Enamel shades
  ('shade-5-01-0000-0000-000000000001', 'prod-0001-0000-0000-000000000005', 'Jet Black', '#1A1A1A', NULL),
  ('shade-5-01-0000-0000-000000000002', 'prod-0001-0000-0000-000000000005', 'Pure White', '#F5F5F0', NULL),
  ('shade-5-01-0000-0000-000000000003', 'prod-0001-0000-0000-000000000005', 'Walnut Brown', '#4B3621', 100),
  -- Wood Lacquer shades
  ('shade-6-01-0000-0000-000000000001', 'prod-0001-0000-0000-000000000006', 'Antique Oak', '#8B5A2B', NULL),
  ('shade-6-01-0000-0000-000000000002', 'prod-0001-0000-0000-000000000006', 'Warm Mahogany', '#6E2C00', 180),
  ('shade-6-01-0000-0000-000000000003', 'prod-0001-0000-0000-000000000006', 'Clear Gloss', '#FAF0E6', NULL)
ON CONFLICT (id) DO NOTHING;

-- Banners
INSERT INTO public.banners (id, image_url, title, subtitle, link, active)
VALUES
  (
    'banner-0001-0000-0000-000000000001',
    'https://picsum.photos/seed/banner1/1920/800',
    'Premium Paint Collections',
    'Discover our range of silk emulsions, weather guards, and premium finishes. Quality paints for every surface.',
    '/products',
    true
  ),
  (
    'banner-0001-0000-0000-000000000002',
    'https://picsum.photos/seed/banner2/1920/800',
    'Visualise Before You Paint',
    'Try our paint visualiser to see how colours look on your walls before you buy. Smart colour matching for the perfect finish.',
    '/visualizer',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Dealers
INSERT INTO public.dealers (id, name, city, address, contact)
VALUES
  ('deal-0001-0000-0000-000000000001', 'Lahore Paint Centre', 'Lahore', 'Circular Road, Near Lahori Gate', '+92 42 37654321'),
  ('deal-0001-0000-0000-000000000002', 'Karachi Paint & Hardware', 'Karachi', 'Golimar Chaurangi, F.B Area', '+92 21 36612345')
ON CONFLICT (id) DO NOTHING;
