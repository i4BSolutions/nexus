-- Seed data for the supplier table in Supabase
insert into public.supplier (name, contact_person, email, phone, address, status)
values 
  ('Fresh Farm Ltd.', 'Alice Johnson', 'alice@freshfarm.com', '+1-555-123-4567', '123 Apple Lane, Greenfield', true),
  ('Tech Tools Inc.', 'Bob Smith', 'bob@techtools.io', '+1-555-234-5678', '456 Silicon Ave, Technoville', true),
  ('Golden Harvest', 'Carol Lee', 'carol@goldenharvest.com', '+1-555-345-6789', '789 Grain Rd, Midwest City', false),
  ('Metro Supplies', 'Dan Kim', 'dan@metrosupplies.biz', '+1-555-456-7890', '321 Metro Blvd, Urbania', true),
  ('Eco Paper Co.', 'Eva Brown', 'eva@ecopaper.org', null, '99 Recycle St, Paper Town', true);

-- Seed data for the product table in Supabase
insert into public.product (sku, name, category, unit_price, min_stock, stock, is_active)
values 
  ('SKU-1001-A', 'Wireless Mouse', 'Electronics', 19.99, 10, 20, true),
  ('SKU-1002-B', 'Mechanical Keyboard', 'Electronics', 49.99, 5, 6, true),
  ('SKU-1003-C', 'Reusable Water Bottle', 'Home & Kitchen', 12.50, 20, 22, true),
  ('SKU-1004-D', 'Notebook 200 Pages', 'Stationery', 3.25, 50, 56, true),
  ('SKU-1005-E', 'LED Desk Lamp', 'Home & Office', 24.95, 8, 23, true);

-- Seed data for the category table in Supabase
insert into public.category (category_name)
values
  ('Electronics'),
  ('Home & Kitchen'),
  ('Stationery');