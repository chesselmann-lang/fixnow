-- ============================================================
-- FixNow – Schema v2 Migration
-- Ausführen nach schema.sql
-- ============================================================

-- ============================================================
-- Notifications
-- ============================================================
create type notification_type as enum (
  'new_offer', 'offer_accepted', 'offer_rejected',
  'new_message', 'booking_confirmed', 'booking_completed',
  'payment_received', 'new_review'
);

create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  body text,
  link text,         -- z.B. /customer/request/abc
  read boolean default false,
  data jsonb,        -- beliebige Zusatzdaten
  created_at timestamptz default now()
);

create index on notifications(user_id, read, created_at desc);

alter table notifications enable row level security;
create policy "Users see own notifications" on notifications
  for select using (auth.uid() = user_id);
create policy "System inserts notifications" on notifications
  for insert with check (true);
create policy "Users mark read" on notifications
  for update using (auth.uid() = user_id);

-- ============================================================
-- Payments (Stripe)
-- ============================================================
create type payment_status as enum ('pending', 'processing', 'succeeded', 'failed', 'refunded');

create table payments (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) on delete set null,
  customer_id uuid references profiles(id) on delete set null,
  provider_id uuid references profiles(id) on delete set null,
  stripe_payment_intent_id text unique,
  stripe_transfer_id text,
  amount int not null,           -- in Euro-Cent
  platform_fee int default 0,    -- 10% Provision in Cent
  currency text default 'eur',
  status payment_status default 'pending',
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table payments enable row level security;
create policy "Payment participants" on payments for select using (
  auth.uid() = customer_id or auth.uid() = provider_id
);

-- ============================================================
-- Reviews
-- ============================================================
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) on delete cascade unique,
  reviewer_id uuid references profiles(id) on delete cascade,
  provider_id uuid references provider_profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table reviews enable row level security;
create policy "Reviews are public" on reviews for select using (true);
create policy "Customers write reviews" on reviews for insert
  with check (auth.uid() = reviewer_id);

-- Trigger: Provider-Bewertung automatisch berechnen
create or replace function update_provider_rating()
returns trigger language plpgsql as $$
begin
  update provider_profiles
  set
    rating_avg = (select avg(rating) from reviews where provider_id = new.provider_id),
    rating_count = (select count(*) from reviews where provider_id = new.provider_id)
  where id = new.provider_id;
  return new;
end;
$$;

create trigger on_review_added
  after insert on reviews
  for each row execute procedure update_provider_rating();

-- ============================================================
-- Admin-Rolle
-- ============================================================
alter type user_role add value if not exists 'admin';

create table admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references profiles(id),
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- Automatische Notifications via DB-Trigger
-- ============================================================

-- Bei neuem Angebot → Kunde benachrichtigen
create or replace function notify_on_new_offer()
returns trigger language plpgsql security definer as $$
declare
  v_customer_id uuid;
  v_request_title text;
begin
  select r.customer_id, r.title into v_customer_id, v_request_title
  from service_requests r where r.id = new.request_id;

  insert into notifications(user_id, type, title, body, link)
  values (
    v_customer_id,
    'new_offer',
    'Neues Angebot erhalten!',
    'Du hast ein neues Angebot für "' || v_request_title || '" erhalten.',
    '/customer/request/' || new.request_id
  );
  return new;
end;
$$;

create trigger on_offer_created
  after insert on offers
  for each row execute procedure notify_on_new_offer();

-- Bei akzeptiertem Angebot → Dienstleister benachrichtigen
create or replace function notify_on_offer_accepted()
returns trigger language plpgsql security definer as $$
declare
  v_request_title text;
begin
  if new.status = 'accepted' and old.status = 'pending' then
    select title into v_request_title from service_requests where id = new.request_id;
    insert into notifications(user_id, type, title, body, link)
    values (
      new.provider_id,
      'offer_accepted',
      'Dein Angebot wurde angenommen! 🎉',
      'Für den Auftrag "' || v_request_title || '" wurde dein Angebot akzeptiert.',
      '/provider/request/' || new.request_id
    );
  end if;
  return new;
end;
$$;

create trigger on_offer_status_changed
  after update on offers
  for each row execute procedure notify_on_offer_accepted();

-- Bei neuer Chat-Nachricht → Empfänger benachrichtigen
create or replace function notify_on_new_message()
returns trigger language plpgsql security definer as $$
declare
  v_offer record;
  v_recipient_id uuid;
  v_sender_name text;
begin
  select o.*, r.customer_id, r.title as request_title
  into v_offer
  from offers o
  join service_requests r on r.id = o.request_id
  where o.id = new.offer_id;

  -- Empfänger ermitteln (nicht der Absender)
  if new.sender_id = v_offer.customer_id then
    v_recipient_id := v_offer.provider_id;
  else
    v_recipient_id := v_offer.customer_id;
  end if;

  select full_name into v_sender_name from profiles where id = new.sender_id;

  insert into notifications(user_id, type, title, body, link)
  values (
    v_recipient_id,
    'new_message',
    'Neue Nachricht von ' || v_sender_name,
    new.content,
    case
      when v_recipient_id = v_offer.customer_id
        then '/customer/request/' || v_offer.request_id
      else '/provider/request/' || v_offer.request_id
    end
  );
  return new;
end;
$$;

create trigger on_message_sent
  after insert on messages
  for each row execute procedure notify_on_new_message();
