-- =====================================================
-- MODUL RAK IoT — jalankan di Supabase SQL Editor
-- =====================================================

create table rak_slot (
  id              uuid primary key default gen_random_uuid(),
  laundry_id      uuid not null references laundry(id) on delete cascade,
  kode            text not null,                    -- A1, A2, A3
  terisi          boolean not null default false,
  pesanan_id      uuid references pesanan(id) on delete set null,
  terakhir_update timestamptz not null default now(),
  unique (laundry_id, kode)
);

create index idx_rak_laundry on rak_slot (laundry_id, kode);

-- Status perangkat: untuk tahu ESP32 masih hidup atau tidak
create table rak_perangkat (
  id              uuid primary key default gen_random_uuid(),
  laundry_id      uuid not null references laundry(id) on delete cascade,
  nama            text not null default 'ESP32 Rak A',
  terakhir_kontak timestamptz,
  unique (laundry_id, nama)
);

-- ---------- RLS ----------
alter table rak_slot      enable row level security;
alter table rak_perangkat enable row level security;

create policy p_rak_slot on rak_slot
  for all to authenticated
  using (laundry_id = laundry_saya()) with check (laundry_id = laundry_saya());

create policy p_rak_perangkat on rak_perangkat
  for all to authenticated
  using (laundry_id = laundry_saya()) with check (laundry_id = laundry_saya());

-- ---------- REALTIME ----------
-- Supaya perubahan status langsung tampil di layar tanpa refresh
alter publication supabase_realtime add table rak_slot;

-- ---------- DATA AWAL: 3 slot ----------
insert into rak_slot (laundry_id, kode)
select l.id, k
from laundry l, unnest(array['A1', 'A2', 'A3']) as k;

insert into rak_perangkat (laundry_id, nama)
select id, 'ESP32 Rak A' from laundry;

-- ---------- CEK ----------
select kode, terisi, terakhir_update from rak_slot order by kode;
