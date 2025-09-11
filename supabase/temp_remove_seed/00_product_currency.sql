--  Seed data for the product currency table in Supabase
insert into
  public.product_currency (currency_code, currency_name, is_active)
values
  ('MMK', 'Myanmar Kyat', true),
  ('USD', 'United States Dollar', true),
  ('THB', 'Thai Baht', true),
  ('EUR', 'Euro', true);