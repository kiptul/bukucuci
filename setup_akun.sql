-- Penautan akun login ke laundry (jalankan di Supabase SQL Editor).
--
-- Sebelumnya: buat user dulu lewat dashboard
--   Authentication > Users > Add user (isi email + password, centang auto-confirm).
--
-- Lalu ganti email di bawah dengan email user tadi, dan Run.

insert into pengguna (id, laundry_id, nama, peran)
select u.id, l.id, 'Admin Demo', 'SUPER_ADMIN'
from auth.users u, laundry l
where u.email = 'GANTI_DENGAN_EMAIL_KAMU'
  and l.nama = 'Laundry Demo'
on conflict (id) do update
  set laundry_id = excluded.laundry_id,
      peran      = excluded.peran;

-- Cek hasil: harus muncul 1 baris
select p.id, p.nama, p.peran, l.nama as laundry
from pengguna p join laundry l on l.id = p.laundry_id;
