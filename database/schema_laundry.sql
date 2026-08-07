-- =====================================================
-- SCHEMA DATABASE SISTEM LAUNDRY
-- Paste seluruh isi file ini ke Supabase SQL Editor, lalu Run.
-- =====================================================

-- ---------- 1. TIPE ENUM ----------
-- LAUNDRY = akun milik satu laundry, bukan jabatan seseorang. Database yang
-- dibuat sebelum database/peran_laundry.sql masih memakai nama lama 'PETUGAS'.
create type peran_pengguna    as enum ('SUPER_ADMIN', 'LAUNDRY');
create type status_pesanan    as enum ('MASUK', 'SIAP', 'DIAMBIL', 'BATAL');
create type status_pembayaran as enum ('BELUM', 'LUNAS');
create type sumber_pesanan    as enum ('BARU', 'DARI_BUKU');
create type jenis_notifikasi  as enum ('SIAP', 'REMINDER_H1', 'REMINDER_H3', 'REMINDER_H7', 'TERIMA_KASIH');
create type status_kirim      as enum ('PENDING', 'TERKIRIM', 'GAGAL');


-- ---------- 2. FUNGSI BANTU ----------

-- Normalisasi nomor HP jadi format 62xxxxxxxxxx
-- 0812... / +62812... / 62812... / 812...  ->  62812...
create or replace function normalisasi_hp(hp text)
returns text
language plpgsql
immutable
as $$
declare
  bersih text;
begin
  if hp is null then return null; end if;

  bersih := regexp_replace(hp, '[^0-9]', '', 'g');

  if bersih like '62%' then
    return bersih;
  elsif bersih like '0%' then
    return '62' || substring(bersih from 2);
  elsif bersih like '8%' then
    return '62' || bersih;
  else
    return bersih;
  end if;
end;
$$;


-- ---------- 3. TABEL ----------

create table laundry (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  alamat      text,
  telp        text,
  footer_nota text,
  created_at  timestamptz not null default now()
);

create table pengguna (
  id         uuid primary key references auth.users(id) on delete cascade,
  laundry_id uuid references laundry(id) on delete cascade,
  nama       text,
  peran      peran_pengguna not null default 'LAUNDRY',
  created_at timestamptz not null default now()
);

-- Satu laundry satu akun. Parsial supaya baris SUPER_ADMIN, yang laundry_id-nya
-- NULL, tidak saling bentrok. Lihat database/peran_laundry.sql.
create unique index idx_pengguna_satu_akun_per_laundry
  on pengguna (laundry_id)
  where laundry_id is not null;

create table pelanggan (
  id         uuid primary key default gen_random_uuid(),
  laundry_id uuid not null references laundry(id) on delete cascade,
  nama       text not null,
  no_hp      text not null,
  created_at timestamptz not null default now(),
  unique (laundry_id, no_hp)
);

create table layanan (
  id         uuid primary key default gen_random_uuid(),
  laundry_id uuid not null references laundry(id) on delete cascade,
  nama       text not null,
  satuan     text not null default 'kg',      -- 'kg' atau 'pcs'
  harga      numeric(12,2) not null,
  aktif      boolean not null default true,
  created_at timestamptz not null default now()
);

create table pesanan (
  id             uuid primary key default gen_random_uuid(),
  laundry_id     uuid not null references laundry(id) on delete cascade,
  pelanggan_id   uuid not null references pelanggan(id),
  kode           text not null,
  subtotal       numeric(12,2) not null default 0,
  diskon         numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  status         status_pesanan    not null default 'MASUK',
  status_bayar   status_pembayaran not null default 'BELUM',
  sumber         sumber_pesanan    not null default 'BARU',  -- mode berdampingan
  slot_rak       text,                                       -- disiapkan untuk fase IoT
  catatan        text,
  created_at     timestamptz not null default now(),
  unique (laundry_id, kode)
);

create table pesanan_item (
  id            uuid primary key default gen_random_uuid(),
  pesanan_id    uuid not null references pesanan(id) on delete cascade,
  layanan_id    uuid references layanan(id),
  nama_layanan  text not null,              -- snapshot, biar riwayat tidak berubah
  qty           numeric(10,2) not null,
  harga_satuan  numeric(12,2) not null,
  subtotal      numeric(12,2) not null
);

create table riwayat_status (
  id         bigserial primary key,
  pesanan_id uuid not null references pesanan(id) on delete cascade,
  status     status_pesanan not null,
  waktu      timestamptz not null default now(),
  oleh       uuid references auth.users(id)
);

create table notifikasi_log (
  id           bigserial primary key,
  pesanan_id   uuid not null references pesanan(id) on delete cascade,
  jenis        jenis_notifikasi not null,
  no_tujuan    text not null,
  isi          text,
  status       status_kirim not null default 'PENDING',
  keterangan   text,
  waktu        timestamptz not null default now(),
  unique (pesanan_id, jenis)                -- KUNCI: anti kirim dobel
);

create table template_pesan (
  id         uuid primary key default gen_random_uuid(),
  laundry_id uuid not null references laundry(id) on delete cascade,
  jenis      jenis_notifikasi not null,
  isi        text not null,
  aktif      boolean not null default true,
  unique (laundry_id, jenis)
);


-- ---------- 4. INDEX ----------
create index idx_pesanan_laundry_status on pesanan (laundry_id, status);
create index idx_pesanan_created        on pesanan (created_at desc);
create index idx_pelanggan_hp           on pelanggan (laundry_id, no_hp);
create index idx_riwayat_pesanan        on riwayat_status (pesanan_id, waktu desc);
create index idx_item_pesanan           on pesanan_item (pesanan_id);


-- ---------- 5. TRIGGER ----------

-- Nomor HP pelanggan otomatis dinormalisasi sebelum disimpan
create or replace function trg_normalisasi_hp()
returns trigger language plpgsql as $$
begin
  new.no_hp := normalisasi_hp(new.no_hp);
  return new;
end;
$$;

create trigger pelanggan_normalisasi_hp
  before insert or update of no_hp on pelanggan
  for each row execute function trg_normalisasi_hp();


-- Setiap perubahan status otomatis dicatat waktunya
create or replace function trg_catat_status()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into riwayat_status (pesanan_id, status, oleh)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger pesanan_catat_status
  after insert or update of status on pesanan
  for each row execute function trg_catat_status();


-- ---------- 6. ROW LEVEL SECURITY ----------

-- Ambil laundry_id milik user yang sedang login
create or replace function laundry_saya()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select laundry_id from pengguna where id = auth.uid();
$$;

alter table laundry        enable row level security;
alter table pengguna       enable row level security;
alter table pelanggan      enable row level security;
alter table layanan        enable row level security;
alter table pesanan        enable row level security;
alter table pesanan_item   enable row level security;
alter table riwayat_status enable row level security;
alter table notifikasi_log enable row level security;
alter table template_pesan enable row level security;

-- Tabel yang punya kolom laundry_id langsung
create policy p_laundry on laundry
  for all to authenticated
  using (id = laundry_saya()) with check (id = laundry_saya());

-- Policy ini TIDAK cukup sendirian: `with check` tak bisa membandingkan nilai
-- lama dengan nilai baru, jadi ia tidak mampu mencegah pengguna mengubah
-- kolom `peran` miliknya sendiri jadi SUPER_ADMIN. Pagarnya ada di trigger
-- pada database/jaga_hak_pengguna.sql — berkas itu wajib ikut dijalankan.
create policy p_pengguna on pengguna
  for all to authenticated
  using (id = auth.uid() or laundry_id = laundry_saya())
  with check (laundry_id = laundry_saya());

create policy p_pelanggan on pelanggan
  for all to authenticated
  using (laundry_id = laundry_saya()) with check (laundry_id = laundry_saya());

create policy p_layanan on layanan
  for all to authenticated
  using (laundry_id = laundry_saya()) with check (laundry_id = laundry_saya());

create policy p_pesanan on pesanan
  for all to authenticated
  using (laundry_id = laundry_saya()) with check (laundry_id = laundry_saya());

create policy p_template on template_pesan
  for all to authenticated
  using (laundry_id = laundry_saya()) with check (laundry_id = laundry_saya());

-- Tabel turunan: ikut izin pesanan induknya
create policy p_pesanan_item on pesanan_item
  for all to authenticated
  using (exists (
    select 1 from pesanan p
    where p.id = pesanan_item.pesanan_id and p.laundry_id = laundry_saya()))
  with check (exists (
    select 1 from pesanan p
    where p.id = pesanan_item.pesanan_id and p.laundry_id = laundry_saya()));

create policy p_riwayat on riwayat_status
  for all to authenticated
  using (exists (
    select 1 from pesanan p
    where p.id = riwayat_status.pesanan_id and p.laundry_id = laundry_saya()))
  with check (exists (
    select 1 from pesanan p
    where p.id = riwayat_status.pesanan_id and p.laundry_id = laundry_saya()));

create policy p_notifikasi on notifikasi_log
  for all to authenticated
  using (exists (
    select 1 from pesanan p
    where p.id = notifikasi_log.pesanan_id and p.laundry_id = laundry_saya()))
  with check (exists (
    select 1 from pesanan p
    where p.id = notifikasi_log.pesanan_id and p.laundry_id = laundry_saya()));


-- ---------- 7. DATA CONTOH ----------
do $$
declare
  v_laundry uuid;
begin
  insert into laundry (nama, alamat, telp, footer_nota)
  values (
    'Laundry Demo',
    'Jl. Contoh No. 1, Karawang',
    '0800000000',
    'Pengaduan komplain maksimal 2x24 jam setelah cucian diambil.'
  )
  returning id into v_laundry;

  insert into layanan (laundry_id, nama, satuan, harga) values
    (v_laundry, 'Cuci Setrika Reguler', 'kg',  7000),
    (v_laundry, 'Cuci Setrika Express', 'kg', 12000),
    (v_laundry, 'Bed Cover',            'pcs', 25000);

  insert into pelanggan (laundry_id, nama, no_hp) values
    (v_laundry, 'Pelanggan Satu', '081234567890'),
    (v_laundry, 'Pelanggan Dua',  '+6285211112222');

  insert into template_pesan (laundry_id, jenis, isi) values
    (v_laundry, 'SIAP',
      'Halo {nama}, cucian Anda ({kode}) sudah selesai dan siap diambil. Terima kasih.'),
    (v_laundry, 'REMINDER_H1',
      'Halo {nama}, cucian Anda ({kode}) sudah siap sejak kemarin. Kami tunggu ya.'),
    (v_laundry, 'REMINDER_H3',
      'Halo {nama}, cucian Anda ({kode}) masih kami simpan. Silakan diambil kapan saja.'),
    (v_laundry, 'REMINDER_H7',
      'Halo {nama}, cucian Anda ({kode}) sudah seminggu siap diambil. Mohon dikonfirmasi ya.'),
    (v_laundry, 'TERIMA_KASIH',
      'Terima kasih {nama} sudah menggunakan layanan kami. Sampai jumpa lagi!');
end $$;
