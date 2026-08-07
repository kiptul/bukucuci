-- Penautan akun login ke laundry (jalankan di Supabase SQL Editor).
--
-- Berkas ini hanya untuk memulihkan keadaan dari nol, mis. kalau database
-- dibuat ulang. Dalam pemakaian normal, akun laundry dibuat lewat konsol
-- superadmin di /admin — di sana akun auth dan barisnya dibuat sekaligus.
--
-- Prasyarat: akun sudah ada di Authentication > Users.
--
-- Peran:
--   LAUNDRY      akun milik satu laundry, hanya melihat data laundry itu.
--                Satu laundry hanya boleh punya satu akun.
--   SUPER_ADMIN  laundry_id NULL, boleh melihat dan mengelola semuanya

-- Akun laundry: satu akun, satu laundry
insert into pengguna (id, laundry_id, nama, peran)
select u.id, l.id, x.nama, 'LAUNDRY'
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

-- ---------- CEK: berteriak kalau ada yang gagal diam-diam ----------
--
-- Kedua insert di atas menautkan lewat `join auth.users on email = ...`.
-- Kalau akun auth-nya belum dibuat di Authentication > Users, join-nya tidak
-- dapat baris, insert-nya menulis nol baris, dan SQL menganggap itu sukses.
-- Ini pernah terjadi: superadmin tidak ikut terbuat, /admin tak bisa dibuka
-- siapa pun, dan tidak ada satu pun pesan galat yang menandainya.
do $$
declare
  jml_superadmin int;
  jml_laundry    int;
begin
  select count(*) into jml_superadmin from pengguna where peran = 'SUPER_ADMIN';
  select count(*) into jml_laundry    from pengguna where peran = 'LAUNDRY';

  if jml_superadmin = 0 then
    raise exception 'Tidak ada SUPER_ADMIN. Buat akunnya dulu di Authentication > Users (centang Auto Confirm User), pastikan emailnya sama persis dengan yang tertulis di berkas ini, lalu jalankan ulang.';
  end if;

  raise notice 'Terpasang: % superadmin, % akun laundry.', jml_superadmin, jml_laundry;
end;
$$;

select p.nama, p.peran, coalesce(l.nama, '(semua laundry)') as laundry
from pengguna p
left join laundry l on l.id = p.laundry_id
order by p.peran, p.nama;
