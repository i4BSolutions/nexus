-- Seed data for the supplier table in Supabase
insert into public.supplier (name, contact_person, email, phone, address, status)
values 
  ('Fresh Farm Ltd.', 'Alice Johnson', 'alice@freshfarm.com', '+1-555-123-4567', '123 Apple Lane, Greenfield', true),
  ('Tech Tools Inc.', 'Bob Smith', 'bob@techtools.io', '+1-555-234-5678', '456 Silicon Ave, Technoville', true),
  ('Golden Harvest', 'Carol Lee', 'carol@goldenharvest.com', '+1-555-345-6789', '789 Grain Rd, Midwest City', false),
  ('Metro Supplies', 'Dan Kim', 'dan@metrosupplies.biz', '+1-555-456-7890', '321 Metro Blvd, Urbania', true),
  ('Eco Paper Co.', 'Eva Brown', 'eva@ecopaper.org', null, '99 Recycle St, Paper Town', true);

--  Seed data for the product currency table in Supabase
insert into public.product_currency (currency_code, currency_name, is_active)
values
  ('MMK', 'Myanmar Kyat', true),
  ('USD', 'United States Dollar', true),
  ('EUR', 'Euro', true);
  
-- Seed data for the product table in Supabase
insert into public.product (sku, name, category, unit_price, min_stock, stock, currency_code_id, is_active)
values 
  ('AA-100000', 'Wireless Mouse', 'Electronics', 19.99, 10, 11, 1, true),
  ('AA-100001', 'Mechanical Keyboard', 'Electronics', 49.99, 5, 4, 1, true),
  ('AA-100002', 'Reusable Water Bottle', 'Home & Kitchen', 12.50, 20, 20, 1, true),
  ('AA-100003', 'Notebook 200 Pages', 'Stationery', 3.25, 50, 55, 1, true),
  ('AA-100004', 'LED Desk Lamp', 'Home & Office', 24.95, 8, 10, 1, true);

-- Seed data for the category table in Supabase
insert into public.category (category_name)
values
  ('Electronics'),
  ('Home & Kitchen'),
  ('Stationery');


