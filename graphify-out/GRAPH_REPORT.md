# Graph Report - kelar  (2026-07-30)

## Corpus Check
- 60 files · ~14,550 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 254 nodes · 381 edges · 24 communities (18 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c88f5ea0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- dashboard/page.tsx
- profil.ts
- types.ts
- package.json
- devDependencies
- getProfil
- reminder.ts
- Modul Rak IoT — Kelar
- TombolAksi.tsx
- RAB Modul Rak IoT — Kelar
- Kelar
- Rangka.tsx
- app/layout.tsx
- TASKS — Kelar
- Kelar
- proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `getProfil` - 15 edges
3. `Dashboard()` - 8 edges
4. `kirimNotifikasi()` - 8 edges
5. `RAB Modul Rak IoT — Kelar` - 8 edges
6. `Kelar` - 8 edges
7. `simpanOrder()` - 7 edges
8. `rupiah()` - 7 edges
9. `include` - 7 edges
10. `TASKS — Kelar` - 7 edges

## Surprising Connections (you probably didn't know these)
- `LayoutApl()` --calls--> `getProfil`  [EXTRACTED]
  src/app/(app)/layout.tsx → src/lib/profil.ts
- `Dashboard()` --calls--> `normalisasiHp()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/format.ts
- `Dashboard()` --calls--> `getProfil`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/profil.ts
- `kirimUlangWa()` --calls--> `kirimNotifikasi()`  [EXTRACTED]
  src/app/(app)/order/[id]/actions.ts → src/lib/notifikasi.ts
- `kirimUlangWa()` --calls--> `getProfil`  [EXTRACTED]
  src/app/(app)/order/[id]/actions.ts → src/lib/profil.ts

## Import Cycles
- None detected.

## Communities (24 total, 6 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 1 - "dashboard/page.tsx"
Cohesion: 0.15
Nodes (19): amankan(), BarisPesanan, Dashboard(), Detail, DetailOrder(), gaya, pitaStatus, StatusBadge() (+11 more)

### Community 2 - "profil.ts"
Cohesion: 0.15
Nodes (13): LayoutApl(), keluar(), masuk(), JANJI, FormLogin(), Header(), MENU, menuAktif() (+5 more)

### Community 3 - "types.ts"
Cohesion: 0.13
Nodes (18): LANJUTAN, PESAN_OTOMATIS, PesananKirim, ubahStatus(), kirimWhatsApp(), HasilNotifikasi, isiTemplate(), kirimNotifikasi() (+10 more)

### Community 4 - "package.json"
Cohesion: 0.10
Nodes (19): next, dependencies, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, name (+11 more)

### Community 5 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 6 - "getProfil"
Cohesion: 0.25
Nodes (13): cariPelanggan(), HasilSimpan, prefixKode(), simpanOrder(), tanggalBuku(), OrderBaru(), FormOrder(), hariIniJakarta() (+5 more)

### Community 7 - "reminder.ts"
Cohesion: 0.26
Nodes (8): GET(), POST(), SlotMasuk, HasilReminder, jalankanReminder(), PesananSiap, supabaseAdmin(), tahapReminder()

### Community 8 - "Modul Rak IoT — Kelar"
Cohesion: 0.18
Nodes (10): 1. Database, 2. Environment variable, 3. File aplikasi, 4. ESP32, Catatan Rancangan, Langkah Pemasangan, Modul Rak IoT — Kelar, Pengujian Bertahap (+2 more)

### Community 9 - "TombolAksi.tsx"
Cohesion: 0.29
Nodes (5): kirimUlangWa(), Putaran(), GAYA, TombolAksi(), TombolKirimUlang()

### Community 10 - "RAB Modul Rak IoT — Kelar"
Cohesion: 0.22
Nodes (8): 1. Prototipe — untuk demo lomba, 2. HPP produksi — per unit, 3 slot, 3. Biaya bertambah jauh lebih lambat daripada nilainya, 4. Usulan harga jual, 5. Pendapatan berulang dari WhatsApp, 6. Ringkasan modal awal, 7. Asumsi yang harus diuji, RAB Modul Rak IoT — Kelar

### Community 11 - "Kelar"
Cohesion: 0.22
Nodes (8): Database, Gaya Kode, JANGAN dibuat, Kelar, Konteks Penting, Posisi Produk (memengaruhi keputusan desain), Scope — HANYA INI, Stack

### Community 13 - "app/layout.tsx"
Cohesion: 0.29
Nodes (5): metadata, plexMono, plexSans, viewport, DaftarkanSW()

### Community 14 - "TASKS — Kelar"
Cohesion: 0.25
Nodes (7): Cara Kerja (WAJIB DIIKUTI), Catatan, Tahap 1 — Fondasi, Tahap 2 — Inti Order, Tahap 3 — WhatsApp (ini nilai jual produk), Tahap 4 — Pembeda & Finishing, TASKS — Kelar

### Community 15 - "Kelar"
Cohesion: 0.50
Nodes (3): Kelar, Pengaman yang gampang terlanggar, Peta folder

## Knowledge Gaps
- **104 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProfil` connect `getProfil` to `dashboard/page.tsx`, `profil.ts`, `types.ts`, `TombolAksi.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `kirimNotifikasi()` connect `types.ts` to `TombolAksi.tsx`, `reminder.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dashboard/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14532019704433496 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12987012987012986 - nodes in this community are weakly interconnected._