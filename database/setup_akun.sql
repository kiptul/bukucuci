-- Penautan akun login ke laundry (jalankan di Supabase SQL Editor).
--
-- Berkas ini hanya untuk memulihkan keadaan dari nol, mis. kalau database
-- dibuat ulang. Dalam pemakaian normal, akun petugas dibuat lewat konsol
-- superadmin di /admin — di sana akun auth dan barisnya dibuat sekaligus.
--
-- Prasyarat: akun sudah ada di Authentication > Users.
--
-- Peran:
--   PETUGAS      terikat satu laundry, hanya melihat data laundry itu
--   SUPER_ADMIN  laundry_id NULL, boleh melihat dan mengelola semuanya

-- Petugas: satu akun, satu laundry
insert into pengguna (id, laundry_id, nama, peran)
select u.id, l.id, x.nama, 'PETUGAS'
from (values
  ('semut@laundry.id',  'Nurul Laundry', 'Nurul Nuraeni'),
  ('baso@laudry.id',    'Dea Laundry',   'Dea Nurlaela'),
  ('rahman@laundry.id', 'Umew Laundry',  'Abdurrahman')
) as x(email, laundry, nama)
join auth.users u on u.email = x.email
join laundry l    on l.nama  = x.laundry
on conflict (id) do update
  set laundry_id = excluded.laundry_id,
      nama       = excluded.nama,
      peran      = excluded.peran;

-- Superadmin: tanpa laundry, berkuasa atas semuanya
insert into pengguna (id, laundry_id, nama, peran)
select u.id, null, 'Iptul', 'SUPER_ADMIN'
from auth.users u
where u.email = 'iptul@laundry.id'
on conflict (id) do update
  set laundry_id = null,
      nama       = excluded.nama,
      peran      = excluded.peran;

-- Cek hasil
select p.nama, p.peran, coalesce(l.nama, '(semua laundry)') as laundry
from pengguna p
left join laundry l on l.id = p.laundry_id
order by p.peran, p.nama;
