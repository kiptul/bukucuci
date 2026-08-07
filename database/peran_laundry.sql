-- =====================================================
-- PERAN LAUNDRY — jalankan di Supabase SQL Editor
-- =====================================================
--
-- Dua perubahan:
--
-- 1. Nilai enum 'PETUGAS' diganti jadi 'LAUNDRY'. Nama lamanya menyesatkan —
--    akun itu tidak mewakili seorang pegawai, melainkan laundry-nya sendiri.
-- 2. Satu laundry hanya boleh punya satu akun. Sebelumnya tidak ada apa pun
--    yang menahan pembuatan akun kedua selain kebiasaan.
--
-- JALANKAN BERURUTAN. Bagian CEK di bawah dijalankan sendirian lebih dulu.

-- ---------- CEK DULU (jalankan sendirian) ----------
-- Kalau ada baris yang muncul, ada laundry yang terlanjur punya lebih dari
-- satu akun dan langkah 2 pasti gagal. Rapikan dulu — putuskan akun mana yang
-- dipakai, hapus sisanya lewat Authentication > Users — baru lanjut.
select laundry_id, count(*) as jumlah_akun
from pengguna
where laundry_id is not null
group by laundry_id
having count(*) > 1;


-- ---------- 1. GANTI NAMA PERAN ----------
alter type peran_pengguna rename value 'PETUGAS' to 'LAUNDRY';


-- ---------- 2. SATU AKUN PER LAUNDRY ----------
-- Sengaja parsial: baris SUPER_ADMIN ber-laundry_id NULL, dan kalau NULL ikut
-- dibatasi maka superadmin kedua tidak akan bisa dibuat.
create unique index if not exists idx_pengguna_satu_akun_per_laundry
  on pengguna (laundry_id)
  where laundry_id is not null;


-- ---------- CEK HASIL ----------
select p.nama, p.peran, coalesce(l.nama, '(semua laundry)') as laundry
from pengguna p
left join laundry l on l.id = p.laundry_id
order by p.peran, p.nama;
