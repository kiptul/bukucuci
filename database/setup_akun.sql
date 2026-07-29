-- Penautan akun login ke laundry (jalankan di Supabase SQL Editor).
--
-- Prasyarat: user sudah dibuat lewat Authentication > Users > Add user.
-- Ganti email di bawah kalau nanti pakai akun lain.
--
-- Perannya PETUGAS: akun ini kasir yang hanya mengurus satu laundry.
-- SUPER_ADMIN disiapkan untuk pemilik banyak cabang, belum dipakai.

insert into pengguna (id, laundry_id, nama, peran)
select u.id, l.id, 'Kasir Kilat', 'PETUGAS'
from auth.users u, laundry l
where u.email = 'user@gmail.com'
  and l.nama = 'Laundry Kilat Karawang'
on conflict (id) do update
  set laundry_id = excluded.laundry_id,
      nama       = excluded.nama,
      peran      = excluded.peran;

-- Cek hasil: harus muncul 1 baris
select p.id, p.nama, p.peran, l.nama as laundry
from pengguna p join laundry l on l.id = p.laundry_id;
