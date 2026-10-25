# Rencana Portfolio CMS & Private Admin Dashboard

**Status:** Tahap 1 — fondasi env-auth diimplementasikan; pemilik perlu mengisi env dan mengaktifkan WAF sebelum endpoint login dibuka ke publik

**Branch perencanaan:** `feature/portfolio-cms-admin`

**Baseline branch:** commit `2b1d92e` (`Use period in portfolio name reveal`), dibuat dari `main` setelah perubahan lokal sebelumnya di-commit dan di-push.

## 1. Tujuan dan ruang lingkup

Mengalihkan teks dan data portofolio yang disepakati dari source code ke Supabase agar pemilik dapat memperbaruinya melalui dashboard privat. Hanya satu akun admin, tanpa pendaftaran publik, multi-user, role editor, backend tambahan, atau fitur CMS yang tidak diperlukan.

Autentikasi admin berbasis environment variables telah diputuskan secara eksplisit pada 2026-10-25. Tahap 1 hanya mencakup fondasi autentikasi dan validasi konfigurasi. CMS database/editor tetap menunggu konfigurasi dan keputusan pemilik; tidak ada perubahan pada visual publik.

## 2. Batas desain final

Desain publik yang ada adalah baseline final. Migrasi data harus mempertahankan markup, urutan, class, CSS, layout, breakpoint, foto, visual proyek, animasi, Canvas 2D, pointer, scroll, preloader, dan reduced motion.

Perubahan UI hanya boleh menghubungkan nilai dinamis ke slot teks/data yang sudah ada. Bila data kosong atau Supabase gagal, gunakan salinan lokal yang sama dengan konten saat ini agar halaman tetap tampil dan tidak bergeser. Tidak ada redesign atau perubahan estetika dalam tahap CMS.

## 3. Audit arsitektur saat ini

- Framework: Next.js App Router 16.4.2, React 19.3.1, TypeScript 5.9.3. Halaman utama adalah async Server Component di `app/page.tsx`.
- Styling: CSS utama di `app/globals.css`; belum ada sistem CMS atau form library.
- Konten: salinan halaman ada langsung di JSX `app/page.tsx`, sebagian besar data berulang ada di `app/data/portfolio.ts`, copy navbar/preloader/typing ada di `app/components/PortfolioChrome.tsx`, dan label/perilaku timeline di `app/components/JourneyTimeline.tsx`.
- Pengayaan saat render: `app/data/github.ts` memanggil GitHub API, cache satu hari, lalu mengisi URL repository dan tanggal mulai RuangLagi. Ini dapat menimpa nilai kosong dari data lokal dan harus diselesaikan saat sumber CMS dipilih.
- Media: foto asli `Profil.jpeg`, fallback piksel di `public/profile-pixelated-fallback.png`, dua screenshot RuangLagi di `public/projects/`. Visual terminal UMKM adalah markup ilustratif. Belum ada kebutuhan upload yang harus dipenuhi CMS.
- Metadata: `app/layout.tsx`; Open Graph dibuat oleh `app/opengraph-image.tsx`; ikon ada di `app/icon.svg`.
- Sistem yang harus tetap di kode: preloader/intro dan event `portfolio-intro-reveal`, Canvas/partikel, theme dan menu, scroll progress, scroll reveal/count-up, filter/expand timeline, render gambar, dan pemetaan struktur visual.
- Dependensi: tidak ada Supabase/Auth/validasi form. Tidak ditemukan file konfigurasi Supabase, `next.config.*`, atau file `.env*` di root pada audit ini. `.gitignore` mengabaikan `.env*` dan mengecualikan `.env.example`.
- Deployment: metadata menyebut `https://arvazeann.vercel.app`; konfigurasi project Vercel dan environment hosting tidak tersedia di repository untuk diaudit.
- Dokumentasi CMS ditempatkan di `docs/` karena repository sebelumnya belum memiliki direktori dokumentasi khusus; panduan umum proyek tetap di root.

## 4. Inventaris konten

| Area | Sumber saat ini | Kandidat admin | Catatan ketergantungan |
| --- | --- | --- | --- |
| Identitas situs, title, description, teks Open Graph | `app/layout.tsx`, `app/opengraph-image.tsx` | Ya, field metadata dasar | Open Graph image saat ini digambar lewat kode; jangan ubah aset/komposisinya pada migrasi pertama. |
| Navbar dan tautan section | `app/page.tsx`, `PortfolioChrome.tsx` | Label dan label CTA; href section tetap konfigurasi | ID anchor adalah kontrak dengan section, bukan URL bebas. |
| Hero | JSX `app/page.tsx`, `PortfolioChrome.tsx` | Eyebrow/typing phrases, heading, deskripsi bila ditambahkan, label CTA, tujuan CTA | Nama `ARVAZEAN.` terkait animasi morph; pada MVP sebaiknya dipertahankan sebagai konfigurasi identitas sampai editor/validasi animasi disetujui. |
| About dan focus area | JSX `app/page.tsx`, `focusAreas` di `portfolio.ts` | Copy, daftar focus area yang terurut | Angka proyek/sertifikat dihitung dari data, bukan input angka terpisah. |
| Proyek | `projects` di `portfolio.ts`, kartu di `page.tsx` | Judul, nomor/urutan, kategori, deskripsi, teknologi, demo/repository URL, label visual, tanggal | `visual` memilih template UI yang sudah ada (`ruanglagi` atau `terminal`); bukan editor bebas untuk layout atau gambar. Proyek C tidak punya link/media produk saat ini. |
| Skills/focus | `focusAreas`, daftar `technologies` proyek | Label/urutan item | Tetap sebagai daftar data; jangan menyebut kemampuan/level baru yang belum dikonfirmasi. |
| Perjalanan belajar | `makeJourneyItems()` menggabungkan proyek, sertifikat, tiga placeholder; komponen `JourneyTimeline.tsx` | Item pendidikan, pengalaman, organisasi, proyek, sertifikasi, tanggal, deskripsi, skills, credential/link, urutan | Data proyek dan sertifikat saat ini tampil juga pada timeline; hindari duplikasi sumber/record. Filter kategori dan label kontrol tetap kode. Placeholder yang sudah tampil harus dipertahankan persis pada migrasi awal agar baseline visual/konten tidak hilang. |
| Sertifikat | `certificates` di `portfolio.ts` | Judul, penerbit, tanggal, masa berlaku, ID, deskripsi, skills, credential URL, urutan | Jumlah sertifikat About diturunkan dari jumlah record. Jangan mengubah klaim atau mengarang tanggal/URL. |
| Projects section copy | JSX `app/page.tsx` | Label section, heading, supporting copy | Markup/data-reveal tetap di kode. |
| Journey section copy | JSX `app/page.tsx` | Label, heading, intro, catatan, caption | Filter dan interaksi timeline tetap kode. |
| Contact dan sosial | JSX `app/page.tsx` | Email, tautan, label/CTA | URL/email divalidasi; perubahan data publik tetap tanggung jawab admin. |
| Footer | JSX `app/page.tsx` | Kalimat footer dan label kembali ke atas | Anchor `#beranda` tetap kode. |
| UI sistem | `PortfolioChrome.tsx`, `JourneyTimeline.tsx` | Tidak pada MVP | Error/loading, filter, expand/collapse, accessibility label teknis, tombol tema, preloader timing tidak diedit dari CMS. |
| Gambar dan media | File lokal `Profil.jpeg`, `public/profile-pixelated-fallback.png`, `public/projects/*` | Tidak pada MVP | Pertahankan jalur dan file lokal; storage/upload memerlukan keputusan batas ukuran, tipe, akses, transformasi, fallback, dan visual review terpisah. |

### Sumber data yang disarankan

Satu tabel konten tunggal untuk copy sederhana per section dan satu tabel item berulang untuk proyek, sertifikat, dan entri perjalanan. Timeline dibentuk dari record item yang sama dengan kartu proyek/sertifikat, bukan salinan data kedua. `focusAreas` dapat disimpan sebagai array berurutan dalam konten section/About.

Nilai GitHub yang sekarang diperkaya saat render harus diputuskan: rekomendasi adalah menjadikan CMS otoritatif untuk URL dan tanggal proyek; GitHub tidak boleh menimpa isian admin. Jika tanggal kosong, pertahankan fallback yang sudah terlihat. Alternatif mempertahankan tanggal GitHub otomatis hanya dapat diterapkan untuk field tertentu dan perlu aturan prioritas eksplisit.

## 5. Konten/konfigurasi yang tetap di kode

- Seluruh CSS, DOM structure, section IDs, layout, animasi, Canvas 2D, sampling/fallback image, algoritma partikel, scroll, preloader event/timing, theme, menu, dan timeline interaction.
- Template visual proyek dan whitelist `visual_key`; CMS memilih template yang tersedia, tidak memasukkan HTML/CSS bebas.
- Asset gambar lokal untuk migrasi pertama.
- Filter journey, label operasional editor, status loading/error, field constraints, format tanggal, URL allowlist/protokol, dan derived project/certificate counts.
- Nama brand animasi `ARVAZEAN.` sampai tersedia keputusan dan pengujian khusus bila nama itu ingin diedit.

## 6. Rancangan admin dan autentikasi

### Routing dan pengalaman

- `/admin/login`: form username + password, tidak ada tautan registrasi.
- `/admin`: editor dibagi per section; daftar item berulang menggunakan form item dengan add/edit/order/delete, bukan satu form panjang.
- Tombol logout, loading/error/success state, validasi sebelum penyimpanan, dan konfirmasi sebelum menghapus. Semua feedback menggunakan UI sederhana yang konsisten dengan aplikasi; desain dashboard harus disetujui sebelum tahap UI.
- Upload gambar tidak masuk MVP. Preview public sebaiknya hanya jika tidak mengubah desain dan strategi preview terlindungi sudah disetujui.

### Autentikasi

Keputusan yang disetujui: autentikasi admin dikelola Next.js dari env, tanpa Supabase Auth dan tanpa tabel kredensial.

- Kredensial server-only: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, dan `ADMIN_SESSION_SECRET`. Password hanya diwakili hash scrypt salted; tidak ada password plaintext di source, database, log, client, atau `.env.example`.
- Gunakan `node:crypto` scrypt dengan format hash berversi, parameter biaya yang dibatasi, salt acak per password, derivasi asynchronous, dan perbandingan digest constant-time. Tambahkan alat lokal untuk membuat hash tanpa menulis password ke file. Env divalidasi saat runtime di server dan gagal tertutup dengan pesan generik.
- Session stateless ditandatangani HMAC-SHA-256 dengan secret acak minimal 32 byte. Cookie bernilai opaque/token, `HttpOnly`, `SameSite=Strict`, `Path=/`, tanpa `Domain`, `Secure` saat production, masa berlaku 8 jam. Verifikasi signature, issue/expiry time, versi token, dan fingerprint hash saat membaca session. Logout menghapus cookie; mengganti password hash atau session secret membatalkan session yang sedang berlaku.
- Seluruh kredensial diverifikasi hanya di Route Handler/Server Action server. Halaman admin memverifikasi session sendiri; setiap aksi mutasi di masa depan juga wajib memverifikasi session dan validasi input di dalam action/route tersebut. Tidak mengandalkan UI atau Proxy saja. Mutasi POST memeriksa origin; gunakan proteksi CSRF same-site.
- Respons login gagal selalu generik. Login memiliki batas percobaan dalam proses sebagai lapisan tambahan; untuk deployment multi-instance/serverless, pemilik wajib mengaktifkan rate-limit WAF Vercel pada endpoint login sebelum akses publik. Konfigurasi WAF menjadi batas abuse bersama yang tidak bergantung pada instance Node.
- Jangan menggunakan nilai apa pun berawalan `NEXT_PUBLIC_` untuk kredensial admin atau database.

### Akses database dari session Next.js

Cookie HMAC yang diterbitkan Next.js tidak otomatis menjadi Supabase Auth session/JWT. Jangan meneruskan cookie itu seolah-olah Supabase dapat memvalidasinya, dan jangan membuat tabel username/password.

Untuk public reads, gunakan Supabase Data API server-side dengan publishable key dan RLS `anon` read-only terhadap row published. Untuk writes, rekomendasi awal adalah koneksi PostgreSQL server-only melalui Supabase pooler memakai role DB khusus seperti `portfolio_writer`: bukan owner tabel, `NOBYPASSRLS`, tanpa DDL/TRUNCATE, hanya hak CRUD pada tabel CMS yang dibutuhkan dan RLS policies untuk role tersebut. `SUPABASE_DB_WRITER_URL` tidak pernah dikirim ke client. Server Action memverifikasi cookie Next sebelum mengambil koneksi ini; validasi dilakukan per mutation.

Jangan memakai `service_role`/Supabase secret API key untuk CRUD rutin karena ia bypasses RLS dan terlalu luas. Koneksi DB khusus tetap credential sensitif; simpan hanya di server environment. Role/pooler compatibility, grant/RLS statements, serta TLS dan prepared-statement behavior harus diverifikasi pada project Supabase aktual sebelum schema stage.

## 7. Rancangan Supabase awal

Skema berikut proposal logis untuk dibahas, bukan migrasi yang telah dibuat. Semua tabel berada di schema `public` hanya jika memang perlu diakses melalui Data API, dengan RLS eksplisit.

### `site_content`

Satu row `id text primary key` bernilai `main`; `content jsonb not null` menyimpan hanya snapshot publik terkini (nav labels, hero, About, section headings, focus areas, contact/social, footer, metadata); `updated_at timestamptz not null`. Tidak ada FK `auth.users` karena CMS tidak memakai Supabase Auth. Validasi bentuk/ukuran dilakukan di server sebelum tulis. `content` tidak boleh menerima markup atau style bebas.

Untuk MVP publish langsung: perubahan disimpan atomik sebagai konten publik dengan konfirmasi simpan. Jika pengguna mensyaratkan draft/preview, simpan draft dalam tabel terpisah yang hanya admin dapat baca/tulis; aksi publish menyalin snapshot ke `site_content`. Jangan mengandalkan filter UI saja.

### `portfolio_items`

- `id uuid primary key default gen_random_uuid()`; `slug text unique not null`; `kind text/enum not null` dengan nilai terkontrol (`project`, `certificate`, `education`, `experience`, `organization`).
- `title text not null`; `organization text null`; `category text null`; `summary text null`; `description text null`; `technologies text[] not null default '{}'`.
- `start_date date null`; `end_date date null`; `expires_on date null`; `credential_id text null`.
- `href text null`; `repository_href text null`; `credential_url text null`.
- `visual_key text null` dibatasi pada visual preset yang ada; `visual_label text null`.
- `sort_order integer not null default 0`; `status text not null` (`draft` atau `published`); `created_at`, `updated_at timestamptz`. Audit actor (jika diperlukan) dapat berupa label konstan `admin`, bukan FK ke Supabase Auth.

Proyek dan sertifikat yang juga ditampilkan di timeline diambil dari record yang sama. Timeline tetap membentuk label seperti `kind`, tanggal, link, dan kategori dari `kind`/field terstruktur. Placeholder pendidikan/pengalaman/organisasi dari baseline dimigrasikan apa adanya dan tidak dihapus diam-diam.

### Grants dan RLS

- Cabut grant default yang tidak diperlukan. Role Data API `anon`: SELECT published saja; tanpa INSERT/UPDATE/DELETE. Supabase role `authenticated` tidak digunakan oleh aplikasi ini.
- Server admin role terpisah `portfolio_writer`: hanya hak CRUD pada tabel CMS yang dibutuhkan; role bukan table owner dan tidak `BYPASSRLS`. RLS policy menargetkan role tersebut dan membatasi row/operasi. Jalur ini hanya dapat dicapai dari server setelah cookie Next.js diverifikasi.
- Untuk `portfolio_items`, `anon` SELECT policy membatasi `status = 'published'`. Role writer dapat mengelola row draft/published yang dibutuhkan admin. Jangan berikan role writer kemampuan DDL, TRUNCATE, akses Auth schema, atau akses tabel lain.
- Untuk `site_content`, `anon` hanya membaca row `main`; writer dapat memperbarui row itu setelah authorization di Next. Draft, jika kelak dipilih, disimpan terpisah dengan policy/grants admin-only.
- Tambahkan indeks untuk status/kind/sort order dan unique constraints seperlunya.
- Migrasi SQL menyimpan RLS, grants, policies, constraints, dan seed baseline secara reproducible. Tidak ada tindakan manual yang menjadi satu-satunya salinan schema.
- Buat pgTAP/Supabase DB tests untuk `anon` hanya membaca published, `anon` tidak bisa menulis/membaca draft, role writer hanya CRUD pada tabel CMS/row yang diizinkan, writer tidak punya DDL/BYPASSRLS, serta role lain ditolak.

Supabase menyatakan tabel exposed tanpa RLS/grant terbatas dapat diakses sesuai grants default; kebijakan perlu diuji bersama grants. RLS adalah defense-in-depth database. Karena cookie Next.js bukan Supabase JWT, otorisasi admin utamanya dijalankan oleh Next server dan kredensial DB writer disimpan server-only; RLS tetap membatasi blast radius koneksi tersebut.

## 8. Migrasi konten tanpa perubahan visual

1. Simpan fixture/seed snapshot dari konten lokal persis sebelum memindahkan sumber. Seed initial value harus mewakili baseline yang terlihat, termasuk item placeholder yang ada.
2. Buat typed data access layer dan validator; data publik dibaca server-side dari Supabase. Map data ke props/markup yang ada, pertahankan urutan dan class.
3. Fallback bila env belum disiapkan, query gagal, atau row belum ada: import konten lokal baseline yang sama. Jangan render halaman kosong/loading skeleton yang menggeser layout.
4. Tentukan satu sumber kebenaran. Rekomendasi: setelah seed diverifikasi, CMS menjadi authoritative untuk copy dan item; GitHub API tidak mengoverride URL/tanggal yang dikelola admin.
5. Implementasikan per bagian: content singleton dan hero/about, kemudian projects, kemudian timeline/certificates, terakhir contact/footer/meta. Setelah setiap perubahan, bandingkan screenshot desktop/mobile dengan baseline.
6. Cache hanya public reads. Saat publish berhasil, invalidate route/tag yang tepat agar perubahan terlihat cepat. Jangan cache auth/admin response; verifikasi API caching Next.js 16 saat implementasi.
7. Draft tidak pernah dikirim pada query publik. Bila preview disetujui, preview harus memakai route autentikasi dan response private/no-store.

## 9. Validasi dan penanganan error

- Username/password kosong, input ukuran terbatas, pesan login generik, redirect aman ke path lokal yang diizinkan, sign-out invalidasi session.
- URL: hanya `https:` (serta `mailto:` hanya pada field email bila didukung), tanpa `javascript:`, ukuran field dibatasi.
- Tanggal valid, `end_date` tidak mendahului `start_date`, enum kind/visual/status dibatasi, urutan berupa integer, skills dan jumlah item dibatasi.
- Login memvalidasi env dengan gagal tertutup, hash scrypt secara async, session HMAC/expiry, origin dan rate limit. Jangan log input/password/token.
- Server Actions memvalidasi field dan session Next.js di server pada setiap mutation; database constraints/RLS membatasi hak koneksi writer.
- Simpan/update item dan publish memberi status sukses/gagal yang jelas; error teknis tidak membocorkan secret atau query.
- Konten publik gagal diambil: gunakan local fallback yang sama, log diagnostik server tanpa data sensitif. Jangan tampilkan draft.
- Destructive delete butuh konfirmasi, dan untuk item yang dipakai pada kartu/timeline tampilkan konsekuensi sebelum hapus.

## 10. Tahap implementasi yang diusulkan

Selesaikan satu tahap lalu berhenti untuk review/persetujuan.

0. **Perencanaan & keputusan** — selesai. Keputusan env-auth dicatat sebagai sumber kebenaran pada 2026-10-25; media, publish mode, project Supabase, dan sumber GitHub masih terbuka.
1. **Fondasi env-auth** — validasi `ADMIN_*`, hash scrypt, session cookie HMAC, login/logout server-only, proteksi route/action, pembatasan login, `.env.example`, dan helper membuat hash. Tahap yang dikerjakan sekarang.
2. **Konfigurasi pemilik & security gate** — pemilik mengisi env lokal/hosting, memilih password dan secret, menyiapkan WAF rate limit endpoint login, dan memberikan project Supabase/pooler. Jangan lanjut ke endpoint tulis sebelum konfigurasi siap.
3. **Schema & akses database least-privilege** — migration `site_content`/`portfolio_items`, role writer DB khusus non-owner/NOBYPASSRLS, grants/RLS untuk anon/writer, seed baseline, dan DB tests. Verifikasi Supavisor/driver/TLS.
4. **Dynamic read — singleton copy** — hubungkan section copy dan metadata dengan adapter server; local fallback identik; visual compare desktop/mobile.
5. **Dynamic read — items** — pindahkan proyek/sertifikat/journey/focus, hilangkan duplikasi, selesaikan sumber tanggal/repository GitHub; visual dan animasi compare.
6. **Admin editing** — form per section, item CRUD/order, validasi, loading/error state, destructive confirmation, publish behavior yang disetujui. Setiap mutation memverifikasi session Next.js di server; pertahankan styling website publik.
7. **QA dan handoff** — tes kredensial/session/CSRF/rate limit, RLS/grants, fallback/database unavailable, seluruh viewport, animasi, lint/typecheck/build, visual regression, README dan progress. Deployment hanya setelah instruksi/persetujuan terpisah.

Fondasi autentikasi memakai `node:crypto` bawaan Node, jadi tidak perlu dependency auth/hash baru. Integrasi Data API dapat memakai `@supabase/supabase-js`; koneksi DB serverless melalui pooler memerlukan client PostgreSQL seperti `postgres` dengan pool kecil, prepared statements dimatikan pada transaction pooler, dan TLS required. Validasi content schema dievaluasi terpisah saat implementasi.

## 11. Kriteria penerimaan dan pengujian

- Pengunjung dapat membaca hanya konten publik published; semua jalur write dari browser/HTTP/database ditolak untuk anon dan user non-admin.
- Satu admin dapat login menggunakan username/password yang disepakati; signup tidak tersedia; tidak ada credential/secret di browser, repo, log, atau storage klien.
- Perubahan yang disimpan muncul dengan mekanisme publish dan revalidation yang dipilih; draft privat tidak muncul publik.
- Tidak ada konten baseline yang hilang pada seed/fallback; penghitung yang berasal dari daftar tetap benar.
- Tidak ada CSS/layout/visual/animasi/scroll/partikel berubah. Bandingkan screenshot sebelum-sesudah pada 320×720, 375×812, 390×844, 430×932, dan 1440×900.
- Uji intro, scroll up/down, canvas, tema, menu, reduced motion, filter/timeline, data kosong, kegagalan Supabase, refresh session, logout, protected routes, dan session expiry.
- Jalankan lint, typecheck, build, `git diff --check`, Supabase DB/RLS tests, dan smoke test browser. Laporkan hanya pemeriksaan yang benar-benar dijalankan.

## 12. Risiko dan mitigasi

| Risiko | Mitigasi |
| --- | --- |
| RLS policy benar tetapi grants tetap membuka operasi | Revoke grants default, grant minimal, dan DB tests untuk anon/non-admin/admin. |
| Admin URL disembunyikan tetapi action masih terbuka | Validasi signature/expiry session di setiap Server Action/Route Handler; jangan mengandalkan penyembunyian UI atau Proxy. |
| Cookie HMAC dianggap Supabase Auth | Pisahkan domain auth: Next memverifikasi session; DB memakai role writer server-only dengan hak terbatas dan RLS. |
| Hash/session secret salah format atau lemah | Runtime env validation gagal tertutup; generator hash/secret; rotasi env mencabut session. |
| Credential stuffing/login abuse pada serverless | Rate-limit WAF Vercel wajib sebelum akses publik; process-local throttle hanya lapisan tambahan. |
| Database writer URL bocor | Simpan di server environment; role non-owner/NOBYPASSRLS dengan grant terbatas; jangan kirim ke client/log. |
| Project API GitHub menimpa edit CMS | Putuskan satu source-of-truth; CMS-authoritative direkomendasikan. |
| Dynamic data gagal menyebabkan halaman kosong/layout shift | Local baseline fallback identik dan query server-side dengan error handling. |
| Data JSON tidak konsisten | Typed schema dan server validation, DB constraints untuk key fields, migration seed fixture. |
| Draft bocor melalui public query/cache | Draft table/private route, RLS/grants, no-store preview, tes anon dan cache headers. |
| Perubahan copy panjang merusak visual | Batas panjang dan preview; uji seluruh viewport, tanpa edit CSS otomatis. |
| URL media hilang/provider berubah | Tunda upload; pertahankan aset lokal hingga storage policy terpisah disetujui. |

## 13. File yang kemungkinan terlibat nanti

- Tahap auth baru: `.env.example`, `lib/admin-auth.ts`, `scripts/hash-admin-password.mjs`, login/logout route handlers, protected `/admin` page, dan rate-limit helper.
- Tahap DB berikutnya: `lib/supabase/server.ts` untuk public reads bila dipakai, `lib/db/writer.ts`, migration/seed/RLS tests di `supabase/`, content adapters, dan editor components.
- Environment plan: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, dan `SUPABASE_DB_WRITER_URL`; hanya tiga `ADMIN_*` dipakai pada tahap auth foundation. `.env.example` berisi nama dan placeholder tanpa rahasia aktual.
- Berubah secara bertahap: `app/page.tsx`, `app/layout.tsx`, `app/data/portfolio.ts`, kemungkinan `app/data/github.ts`, komponen content-aware, dan docs/README setelah keputusan.
- Tidak direncanakan untuk perubahan visual: `app/globals.css`, `PixelatedPortraitReveal.tsx`, aset foto/screenshot, dan algoritma animasi. Jika nanti terbukti perlu menyentuhnya, perubahan harus dihentikan dan dimintakan persetujuan.

## 14. Keputusan dan konfigurasi pemilik yang masih diperlukan

Keputusan env-auth sudah disetujui pengguna dan tidak perlu dikonfirmasi ulang. Sebelum tahap database/write berikutnya, pemilik perlu:

1. Menentukan username admin dan membuat password kuat sendiri. Jangan kirim password/hash/session secret lewat chat.
2. Menambahkan `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` hasil generator lokal, dan random `ADMIN_SESSION_SECRET` ke `.env.local` serta Vercel Environment Variables; jangan commit `.env.local`.
3. Menambahkan `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, dan `SUPABASE_DB_WRITER_URL` setelah project Supabase dipilih. Connection string writer adalah rahasia server, bukan publishable.
4. Mengaktifkan WAF rate limit Vercel untuk `POST /api/admin/login`, pantau rule dahulu, lalu aktifkan 429/deny dengan threshold yang sesuai sebelum admin login dipublikasikan.
5. Memastikan akses project Supabase dan apakah plan/region menyediakan Supavisor/shared pooler yang dapat dijangkau Vercel; role writer khusus disiapkan saat tahap schema, bukan memakai `postgres` atau `service_role`.
6. Memilih publish langsung atau draft/preview privat.
7. Memutuskan apakah tanggal/link RuangLagi manual (rekomendasi) atau GitHub-derived, apakah media tetap di repo, dan perlakuan placeholder timeline saat seed.

## 15. Referensi teknis yang diperiksa

- [Node.js crypto](https://nodejs.org/api/crypto.html) — scrypt, HMAC, random bytes, dan constant-time comparison tersedia tanpa dependency auth tambahan.
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — grants dan policies harus disesuaikan serta diuji untuk setiap role/operasi.
- [Supabase secure data](https://supabase.com/docs/guides/database/secure-data) — bedakan Data API/RLS dan direct PostgreSQL access; jangan expose secret/service role keys.
- [Supabase Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres) — shared transaction pooler cocok untuk serverless; client perlu pool kecil, prepared statements dimatikan, dan TLS.
- [Supabase Postgres roles](https://supabase.com/docs/guides/database/postgres/roles) — role khusus dapat dibuat dengan grants tertentu; jangan memakai superuser `postgres` untuk koneksi aplikasi.
- [Next.js Server Actions and Mutations](https://nextjs.org/docs/app/getting-started/updating-data) — aksi server tetap memerlukan validasi dan otorisasi.
- [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) — rate limit platform untuk membatasi request per sumber pada endpoint login.

## Riwayat perubahan rencana

| Tanggal | Perubahan | Alasan / persetujuan |
| --- | --- | --- |
| 2026-10-25 | Rencana awal dibuat | Mengikuti brief Portfolio CMS & Private Admin Dashboard. Belum ada implementasi. |
| 2026-10-25 | Auth Supabase diganti env-auth Next.js; akses konten via role DB khusus | Perubahan keputusan eksplisit pengguna: `ADMIN_USERNAME`, hash password, cookie session, server-only writes, tanpa Supabase Auth/kredensial database. RLS disesuaikan karena session Next bukan Supabase JWT. |
