# Progress Portfolio CMS & Private Admin Dashboard

## Status saat ini

- Tahap 0 (audit/rencana) selesai. **Tahap 1 — fondasi env-auth** selesai di kode sesuai keputusan baru pengguna.
- Supabase Auth dan tabel kredensial dibatalkan. Auth akan berada di Next.js; Supabase dipakai hanya untuk data/media.
- Login belum siap dipublikasikan: env nyata belum dipasang dan WAF belum dikonfigurasi. Tahap DB/editor belum dimulai.
- Tahap 2 berikutnya menunggu pemilik menyiapkan env, WAF, dan akses Supabase/pooler seperti checklist di `PORTFOLIO_CMS_PLAN.md`.

## Git dan baseline

- Perubahan kecil sebelumnya (animasi nama `ARVAZEAN.`) di-commit dan di-push ke `main` sebagai `2b1d92e` (`Use period in portfolio name reveal`).
- Branch `feature/portfolio-cms-admin` dibuat dari commit tersebut dan remote branch saat ini sinkron pada commit dokumentasi `c35d781`.
- Kondisi setelah commit sebelum audit CMS: `main` sinkron dengan `origin/main`, dua perubahan ter-track sudah di-commit; `artifacts/mobile-text-audit/` tetap untracked dan tidak disentuh.
- Baseline CMS: `2b1d92e`.
- Implementasi env-auth berada di branch yang sama; branch tidak dipindah.

## Tahap 1 — Fondasi autentikasi berbasis environment

**Status:** implementasi selesai; pengujian kredensial nyata ditunda sampai pemilik mengisi secret di environment lokal. Admin belum boleh dipublikasikan sebelum WAF rate limit aktif.

Perubahan:

- Plan/progress dibaca ulang dan keputusan baru dicatat di plan sebelum source diubah.
- `.env.example` berisi nama env tanpa secret: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_DB_WRITER_URL`.
- `lib/admin-auth.ts` memvalidasi format env server-only, membandingkan password scrypt secara constant-time, membuat/memvalidasi session HMAC expiry 8 jam, menyediakan guard untuk halaman/actions, dan menolak session jika password hash berubah.
- `scripts/hash-admin-password.mjs` menerima password tersembunyi dua kali dan menghasilkan salted hash scrypt tanpa menulis password ke file.
- `app/api/admin/login/route.ts` membatasi ukuran/content-type form, memeriksa Origin, memverifikasi username/password di server, memberi cookie HttpOnly/SameSite=Strict/Secure di production, serta memberi respons generic.
- `lib/admin-login-rate-limit.ts` membatasi 5 kegagalan per 15 menit dan lockout proses 15 menit. Ini hanya lapisan lokal; WAF Vercel wajib menjadi rate limiter bersama sebelum endpoint publik.
- `app/admin/login/page.tsx` adalah form login minimal; `app/admin/page.tsx` memanggil guard session dan logout lewat route handler terpisah.
- `app/api/admin/logout/route.ts` memeriksa Origin dan menghapus cookie.
- Tidak ada CSS, layout publik, komponen portfolio, Supabase Auth, schema, migration, atau database yang berubah.

Env yang belum diisi:

- Tiga `ADMIN_*` belum memiliki nilai di `.env.local`/Vercel. Generate hash dengan `node scripts/hash-admin-password.mjs`; generate session key dengan `node -p "require('node:crypto').randomBytes(32).toString('base64url')"`. Jangan kirim nilai tersebut lewat chat atau commit ke Git.
- Supabase env belum disiapkan; digunakan pada tahap database nanti.
- WAF untuk `POST /api/admin/login` belum dikonfigurasi. Rate limit in-process tidak bertahan lintas serverless instance dan tidak cukup sendiri.

Validasi yang benar-benar dijalankan:

- `npm run lint` — lulus.
- `npm run typecheck` — lulus.
- `npm run build` — lulus; Next.js mengenali `/admin`, `/admin/login`, `/api/admin/login`, dan `/api/admin/logout` sebagai route dinamis.
- `git diff --check` — lulus.
- Tidak ada browser/manual login flow atau tes dengan env rahasia yang dijalankan. Build bukan bukti autentikasi runtime sudah lolos.

Sebelum Tahap 2, pemilik perlu mengisi env lokal untuk smoke test login/logout, mengonfigurasi WAF rate limit di Vercel, dan menyediakan project Supabase/pooler serta role writer terbatas. Jangan kirim password/hash/secret/connection string ke chat.

## Tahap 0 — Audit dan rencana

**Status:** selesai untuk sesi perencanaan.

Yang dilakukan:

- Membaca panduan repository, README, implementation plan, master prompt, package scripts, struktur aplikasi, halaman, data, komponen interaktif, layout, dan konfigurasi Git.
- Memastikan Next.js App Router 16.4.2, React 19.3.1, TypeScript 5.9.3; belum ada Supabase SDK, auth, schema, atau environment Supabase di repository.
- Mengidentifikasi sumber konten halaman, proyek, sertifikat, perjalanan belajar, kontak, metadata, media, serta pengayaan GitHub runtime.
- Menyusun batas desain final, rancangan data/auth/RLS, strategi migrasi/fallback, urutan tahap, risiko, pengujian, dan keputusan yang masih perlu pemilik.
- Memeriksa dokumentasi resmi Supabase dan Next.js untuk SSR cookie auth, password sign-in, RLS/grants, secret keys, dan Next.js 16 Proxy.

Dokumen yang dibuat pada tahap ini:

- `docs/PORTFOLIO_CMS_PLAN.md`
- `docs/PORTFOLIO_CMS_PROGRESS.md`

Perubahan yang tidak dilakukan:

- Tidak membuat UI admin atau client Supabase.
- Tidak membuat/menjalankan migrasi SQL dan tidak menyentuh project Supabase.
- Tidak menambah dependency atau membaca/mengubah nilai secret.
- Tidak mengubah tampilan, CSS, data source aplikasi, animasi, maupun gambar.
- Tidak melakukan deployment.

Validasi sesi perencanaan:

- Audit Git dan struktur repository dilakukan.
- Belum menjalankan test/build untuk CMS karena belum ada implementasi CMS.
- Tidak melakukan pemeriksaan browser untuk CMS.
- `git diff --check` dijalankan setelah dokumen ditulis dan tidak melaporkan masalah whitespace.

## Persetujuan/keputusan yang masih dibutuhkan

Auth environment variables, tanpa Supabase Auth, sudah diputuskan. Pemilik tidak perlu mengirim password/hash/secret lewat chat. Sebelum tahap DB/write, pemilik perlu menyiapkan `.env.local` dan Vercel env, WAF rate limit untuk endpoint login, serta akses Supabase/pooler. Keputusan lain yang masih terbuka: publish vs draft, apakah tanggal/link RuangLagi CMS-authoritative atau GitHub-derived, media lokal atau upload, dan perlakuan placeholder timeline.

Jangan lanjut ke tahap DB/write sebelum konfigurasi lingkungan dan role database writer least-privilege siap serta diverifikasi.

## Riwayat sesi

| Tanggal | Branch / commit | Hasil |
| --- | --- | --- |
| 2026-10-25 | `feature/portfolio-cms-admin` / baseline `2b1d92e` | Audit dan dua dokumen perencanaan dibuat; menunggu review dan persetujuan. |
| 2026-10-25 | `feature/portfolio-cms-admin` / `c35d781` | Pengguna mengganti keputusan auth ke env-based Next.js. Plan diperbarui sebelum implementasi; Tahap 1 fondasi sedang dikerjakan. |
| 2026-10-25 | `feature/portfolio-cms-admin` / Tahap 1 | Fondasi env-auth, hash generator, login/logout, `.env.example`, dan protected `/admin` dibuat. Menunggu konfigurasi env/WAF pemilik untuk tes alur dan tahap database. |
