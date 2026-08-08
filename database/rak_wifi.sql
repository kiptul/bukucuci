-- =====================================================
-- MODUL RAK — penggantian WiFi dari aplikasi
-- Jalankan di Supabase SQL Editor SETELAH rak_lanjutan.sql
--
-- Perangkat punya portal masuk sendiri untuk keadaan darurat (WiFi sudah
-- terlanjur berganti). Kolom di bawah melayani keadaan sebaliknya: WiFi
-- BELUM berganti, perangkat masih online, dan penggantiannya bisa dititipkan
-- lewat balasan api/rak.
-- =====================================================

alter table rak_perangkat
  -- SSID yang sedang dipakai, dilaporkan perangkat di tiap kabar. Ini yang
  -- membuat penggantian bisa mengesahkan dirinya sendiri: titipan baru hanya
  -- dihapus setelah perangkat benar-benar melapor dari jaringan tujuan.
  add column if not exists wifi_ssid        text,

  add column if not exists wifi_ssid_baru   text,
  add column if not exists wifi_sandi_baru  text,

  -- Tanpa penghitung ini, sandi yang salah ketik menghasilkan lingkaran:
  -- perangkat gagal, jatuh ke portal, pemilik menyambungkannya ke jaringan
  -- lain lewat portal, lalu titipan yang salah tadi dikirim lagi dan
  -- memutusnya kembali. Setelah batas tercapai titipan dibatalkan sendiri.
  add column if not exists wifi_percobaan   smallint not null default 0,

  add column if not exists wifi_diminta     timestamptz,
  add column if not exists wifi_galat       text;

-- ---------- CEK ----------
select nama, wifi_ssid, wifi_ssid_baru, wifi_percobaan, wifi_galat
from rak_perangkat;
