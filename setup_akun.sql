-- Penautan akun login ke laundry (jalankan di Supabase SQL Editor).
--
-- Prasyarat: user sudah dibuat lewat Authentication > Users > Add user.
-- Ganti email di bawah kalau nanti pakai akun lain.

insert into pengguna (id, laundry_id, nama, peran)
select u.id, l.id, 'Admin Demo', 'SUPER_ADMIN'
from auth.users u, laundry l
where u.email = 'user@gmail.com'
  and l.nama = 'Laundry Demo'
on conflict (id) do update
  set laundry_id = excluded.laundry_id,
      peran      = excluded.peran;

-- Cek hasil: harus muncul 1 baris
select p.id, p.nama, p.peran, l.nama as laundry
from pengguna p join laundry l on l.id = p.laundry_id;
