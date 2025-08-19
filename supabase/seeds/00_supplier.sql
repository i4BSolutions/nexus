-- Seed data for the supplier table in Supabase
insert into
  public.supplier (
    name,
    contact_person,
    email,
    phone,
    address,
    status
  )
values
  (
    'Fresh Farm Ltd.',
    'Alice Johnson',
    'alice@freshfarm.com',
    '+1-555-123-4567',
    '123 Apple Lane, Greenfield',
    true
  ),
  (
    'Tech Tools Inc.',
    'Bob Smith',
    'bob@techtools.io',
    '+1-555-234-5678',
    '456 Silicon Ave, Technoville',
    true
  ),
  (
    'Golden Harvest',
    'Carol Lee',
    'carol@goldenharvest.com',
    '+1-555-345-6789',
    '789 Grain Rd, Midwest City',
    false
  ),
  (
    'Metro Supplies',
    'Dan Kim',
    'dan@metrosupplies.biz',
    '+1-555-456-7890',
    '321 Metro Blvd, Urbania',
    true
  ),
  (
    'Eco Paper Co.',
    'Eva Brown',
    'eva@ecopaper.org',
    null,
    '99 Recycle St, Paper Town',
    true
  );