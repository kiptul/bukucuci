-- =====================================================
-- PAGAR HAK AKSES PENGGUNA — jalankan di Supabase SQL Editor
-- =====================================================
--
-- Masalah yang ditutup berkas ini:
--
-- Policy p_pengguna berlaku `for all` (termasuk UPDATE) dengan
--   using      (id = auth.uid() or laundry_id = laundry_saya())
--   with check (laundry_id = laundry_saya())
--
-- Klausa `using` lolos lewat `id = auth.uid()`, dan `with check` sama sekali
-- tidak menguji kolom `peran`. Akibatnya akun laundry mana pun bisa memanggil
-- PostgREST langsung dengan publishable key yang memang dikirim ke browser:
--
--   update pengguna set peran = 'SUPER_ADMIN' where id = <uid sendiri>
--
-- lalu membuka /admin. Di sana pastikanSuperAdmin() (src/lib/admin.ts)
-- menyerahkan client secret key yang menembus seluruh RLS — satu akun laundry
-- mendapat kuasa penuh atas data semua laundry lain.
--
-- WITH CHECK tidak bisa membandingkan nilai lama dengan nilai baru, jadi
-- pagarnya dipasang sebagai trigger, bukan sebagai policy tambahan.

create or replace function jaga_hak_pengguna()
returns trigger
language plpgsql
as $$
begin
  -- Kunci keamanan fungsi ini ada di current_user, maka ia WAJIB tetap
  -- security invoker (bawaan). Jangan pernah menambahkan `security definer`:
  -- di dalam fungsi security definer, current_user berubah jadi pemilik
  -- fungsi (postgres), pemeriksaan di bawah selalu lolos, dan pagar ini
  -- berubah jadi hiasan tanpa satu pun error yang terlihat.
  --
  -- service_role  = konsol superadmin lewat secret key (membuat/mengelola akun)
  -- postgres      = SQL Editor dan skrip setup manual
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.peran = 'SUPER_ADMIN' then
      raise exception
        'Peran SUPER_ADMIN hanya bisa diberikan lewat konsol superadmin.';
    end if;
    return new;
  end if;

  if new.peran is distinct from old.peran then
    raise exception 'Peran tidak bisa diubah dari sesi login biasa.';
  end if;

  if new.laundry_id is distinct from old.laundry_id then
    raise exception 'Laundry tidak bisa dipindah dari sesi login biasa.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_jaga_hak_pengguna on pengguna;

create trigger trg_jaga_hak_pengguna
  before insert or update on pengguna
  for each row execute function jaga_hak_pengguna();

-- ---------- CEK ----------
-- Jalankan sebagai akun laundry biasa (bukan di SQL Editor, tapi lewat aplikasi
-- atau PostgREST dengan publishable key). Yang benar: kedua perintah ditolak.
--
--   update pengguna set peran = 'SUPER_ADMIN' where id = auth.uid();
--   -- ERROR: Peran tidak bisa diubah dari sesi login biasa.
--
-- Di SQL Editor perintah yang sama akan berhasil, dan itu memang disengaja:
-- current_user di sana adalah postgres.

select tgname, tgenabled
from pg_trigger
where tgrelid = 'pengguna'::regclass and not tgisinternal;
