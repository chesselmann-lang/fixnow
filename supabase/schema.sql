-- ============================================================
-- FixNow – Supabase Datenbankschema
-- Ausführen in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Erweiterungen
create extension if not exists "uuid-ossp";
create extension if not exists "postgis" schema extensions;

-- ============================================================
-- ENUM-Typen
-- ============================================================
create type user_role as enum ('customer', 'provider');
create type request_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type offer_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type booking_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');

-- ============================================================
-- Tabelle: profiles (erweitert auth.users)
-- ============================================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role user_role not null default 'customer',
  full_name text not null,
  phone text,
  avatar_url text,
  city text,
  postal_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Tabelle: categories (Dienstleistungskategorien)
-- ============================================================
create table categories (
  id serial primary key,
  slug text unique not null,
  name text not null,
  icon text not null,   -- Lucide-Icon-Name
  description text,
  sort_order int default 0
);

insert into categories (slug, name, icon, description, sort_order) values
  ('sanitaer',        'Sanitär & Wasser',      'Droplets',       'Wasserhahn, Rohr, Toilette, Heizung', 1),
  ('elektro',         'Elektrik',              'Zap',            'Steckdose, Sicherung, Beleuchtung',   2),
  ('schreiner',       'Schreiner & Möbel',     'Hammer',         'Türen, Fenster, Möbel, Böden',        3),
  ('schloss',         'Schlüssel & Schloss',   'KeyRound',       'Aussperrung, Schloss tauschen',       4),
  ('maler',           'Maler & Tapete',        'PaintBucket',    'Streichen, Tapezieren, Spachteln',    5),
  ('umzug',           'Umzug & Transport',     'Truck',          'Möbeltransport, Umzugshilfe',         6),
  ('garten',          'Garten & Pflege',       'Leaf',           'Rasen, Hecke, Bäume, Pflaster',       7),
  ('reinigung',       'Reinigung',             'Sparkles',       'Haushaltsreinigung, Fenster',         8),
  ('hauswirtschaft',  'Hauswirtschaft',        'Home',           'Allgemeine Haushaltsarbeiten',        9),
  ('sonstiges',       'Sonstiges',             'Wrench',         'Alles andere',                       10);

-- ============================================================
-- Tabelle: provider_profiles (nur für Dienstleister)
-- ============================================================
create table provider_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  bio text,
  website text,
  hourly_rate_min int,    -- in Euro-Cent
  hourly_rate_max int,
  radius_km int default 20,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  verified boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- Tabelle: provider_categories (Welche Kategorien bietet wer an)
-- ============================================================
create table provider_categories (
  provider_id uuid references provider_profiles(id) on delete cascade,
  category_id int references categories(id) on delete cascade,
  primary key (provider_id, category_id)
);

-- ============================================================
-- Tabelle: service_requests (Kundenaufträge)
-- ============================================================
create table service_requests (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references profiles(id) on delete cascade not null,
  category_id int references categories(id),
  title text not null,
  description text,
  status request_status default 'open',
  city text,
  postal_code text,
  address text,
  photos text[],    -- Array von Storage-URLs
  budget_min int,   -- in Euro-Cent (optional)
  budget_max int,
  urgency text default 'normal',   -- 'asap', 'today', 'week', 'normal'
  offer_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Tabelle: offers (Angebote von Dienstleistern)
-- ============================================================
create table offers (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references service_requests(id) on delete cascade not null,
  provider_id uuid references provider_profiles(id) on delete cascade not null,
  price int not null,       -- in Euro-Cent
  message text,
  status offer_status default 'pending',
  available_from timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(request_id, provider_id)
);

-- ============================================================
-- Tabelle: messages (Chat zwischen Kunde und Dienstleister)
-- ============================================================
create table messages (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references offers(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- Tabelle: bookings (Gebuchte Aufträge)
-- ============================================================
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references offers(id) on delete cascade not null,
  status booking_status default 'scheduled',
  scheduled_at timestamptz,
  completed_at timestamptz,
  customer_rating int check (customer_rating between 1 and 5),
  customer_review text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table profiles enable row level security;
alter table provider_profiles enable row level security;
alter table provider_categories enable row level security;
alter table service_requests enable row level security;
alter table offers enable row level security;
alter table messages enable row level security;
alter table bookings enable row level security;

-- profiles: jeder kann lesen, nur selbst schreiben
create policy "Public profiles are viewable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- provider_profiles: jeder kann lesen
create policy "Provider profiles are viewable" on provider_profiles for select using (true);
create policy "Providers manage own profile" on provider_profiles for all using (auth.uid() = id);

-- provider_categories: jeder kann lesen
create policy "Provider categories viewable" on provider_categories for select using (true);
create policy "Providers manage own categories" on provider_categories for all using (auth.uid() = provider_id);

-- service_requests: Kunden sehen eigene, Dienstleister sehen offene
create policy "Customers see own requests" on service_requests for select using (
  auth.uid() = customer_id or status = 'open'
);
create policy "Customers insert requests" on service_requests for insert with check (auth.uid() = customer_id);
create policy "Customers update own requests" on service_requests for update using (auth.uid() = customer_id);

-- offers: Provider sehen eigene, Kunden sehen Angebote auf ihre Requests
create policy "Offers visibility" on offers for select using (
  auth.uid() = provider_id or
  exists (select 1 from service_requests r where r.id = request_id and r.customer_id = auth.uid())
);
create policy "Providers insert offers" on offers for insert with check (auth.uid() = provider_id);
create policy "Providers update own offers" on offers for update using (auth.uid() = provider_id);

-- messages
create policy "Message participants" on messages for select using (
  auth.uid() = sender_id or
  exists (select 1 from offers o
    join service_requests r on r.id = o.request_id
    where o.id = offer_id and (o.provider_id = auth.uid() or r.customer_id = auth.uid()))
);
create policy "Send messages" on messages for insert with check (auth.uid() = sender_id);

-- bookings: Beteiligte sehen Buchungen
create policy "Booking participants" on bookings for select using (
  exists (select 1 from offers o
    join service_requests r on r.id = o.request_id
    where o.id = offer_id and (o.provider_id = auth.uid() or r.customer_id = auth.uid()))
);

-- ============================================================
-- Funktion: Offer-Count automatisch aktualisieren
-- ============================================================
create or replace function update_offer_count()
returns trigger language plpgsql as $$
begin
  update service_requests
  set offer_count = (select count(*) from offers where request_id = new.request_id and status != 'withdrawn')
  where id = new.request_id;
  return new;
end;
$$;

create trigger on_offer_change
  after insert or update on offers
  for each row execute procedure update_offer_count();

-- ============================================================
-- Funktion: Profil automatisch bei Registrierung anlegen
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Unbekannt'),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
