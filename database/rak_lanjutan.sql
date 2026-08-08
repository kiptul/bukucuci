-- =====================================================
-- MODUL RAK — tahap lanjutan
-- Jalankan di Supabase SQL Editor SETELAH rak_slot.sql
--
-- Menambah dua hal yang sudah disiapkan skema tapi belum dipakai:
-- tautan slot ke pesanan, dan penghitung lama sebuah slot terisi.
-- =====================================================

-- ---------- Lama terisi ----------
-- terakhir_update tidak bisa dipakai menghitung ini. Perangkat menimpanya
-- tiap heartbeat 30 detik, jadi nilainya selalu "barusan" walaupun cucian
-- sudah menginap tiga hari. Kolom di bawah hanya bergerak saat statusnya
-- benar-benar berubah.
alter table rak_slot add column if not exists terisi_sejak timestamptz;

create or replace function jaga_terisi_sejak()
returns trigger
language plpgsql
as $$
begin
  if new.terisi is distinct from old.terisi then
    new.terisi_sejak := case when new.terisi then now() else null end;

    -- Slot yang dikosongkan tidak boleh menyisakan tautan ke pesanan lama.
    -- Kalau dibiarkan, cucian berikutnya yang ditaruh di slot itu akan tampil
    -- atas nama pelanggan sebelumnya — salah yang tidak kelihatan salah.
    if not new.terisi then
      new.pesanan_id := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_terisi_sejak on rak_slot;
create trigger trg_terisi_sejak
  before update on rak_slot
  for each row execute function jaga_terisi_sejak();

-- Slot yang sudah terisi sebelum kolom ini ada tidak punya titik mulai.
-- terakhir_update adalah tebakan terbaik yang tersedia; sekali ini saja.
update rak_slot
set terisi_sejak = terakhir_update
where terisi and terisi_sejak is null;

-- ---------- Tautan ke pesanan ----------
-- Kolomnya sudah ada sejak rak_slot.sql, indeksnya belum. Halaman rak
-- membaca lewat kolom ini di setiap muat.
create index if not exists idx_rak_slot_pesanan on rak_slot (pesanan_id);

-- Satu pesanan tidak boleh menempati dua slot sekaligus. Tanpa ini, salah
-- pilih slot meninggalkan tautan lama menggantung dan satu order tampil di
-- dua tempat. Partial index supaya slot kosong (null) tidak saling bentrok.
create unique index if not exists idx_rak_slot_pesanan_tunggal
  on rak_slot (laundry_id, pesanan_id)
  where pesanan_id is not null;

-- ---------- CEK ----------
select kode, terisi, terisi_sejak, pesanan_id
from rak_slot
order by kode;
