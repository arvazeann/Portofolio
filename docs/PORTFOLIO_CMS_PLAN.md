# Rencana Portfolio CMS & Private Admin Dashboard

**Status:** rancangan untuk ditinjau; implementasi belum dimulai

**Branch perencanaan:** `feature/portfolio-cms-admin`

**Baseline branch:** commit `2b1d92e` (`Use period in portfolio name reveal`), dibuat dari `main` setelah perubahan lokal sebelumnya di-commit dan di-push.

## 1. Tujuan dan ruang lingkup

Mengalihkan teks dan data portofolio yang disepakati dari source code ke Supabase agar pemilik dapat memperbaruinya melalui dashboard privat. Hanya satu akun admin, tanpa pendaftaran publik, multi-user, role editor, backend tambahan, atau fitur CMS yang tidak diperlukan.

Sesi ini hanya menyusun rencana. Tidak ada halaman admin, integrasi Supabase, tabel, migrasi, dependency, atau perubahan source aplikasi yang dibuat. Implementasi baru dimulai setelah rencana dan keputusan terbuka disetujui.

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

Supabase Auth password login menggunakan email atau phone, bukan username native. Rekomendasi untuk memenuhi input username: provision satu user Supabase Auth secara manual; form mengirim username/password ke Server Action; server mencocokkan username terhadap `ADMIN_USERNAME` server-only lalu memetakan ke `ADMIN_AUTH_EMAIL` dan memanggil Supabase Auth password sign-in. Password hanya lewat HTTPS ke Auth, tidak ditulis ke database aplikasi, source, log, atau `localStorage`. Tidak ada signup route; nonaktifkan sign-up publik pada konfigurasi Supabase.

Session disimpan di cookie SSR melalui `@supabase/ssr`; sesuai Next.js 16, rencana token refresh menggunakan `proxy.ts`, bukan `middleware.ts`. Proxy hanya membantu refresh/redirect ringan; ia bukan satu-satunya boundary otorisasi. Page admin dan setiap Server Action/Route Handler tetap memverifikasi token/claim di server.

Admin tunggal diberi claim otorisasi server-managed di `app_metadata`, misalnya `portfolio_admin: true`. Jangan memakai `user_metadata` untuk otorisasi karena dapat diubah oleh pengguna. RLS dan server actions memeriksa claim tersebut. Login username dibandingkan secara konsisten dan error login tidak membocorkan apakah username atau password yang salah. Rate limit/abuse protection Supabase Auth dan batas percobaan aplikasi perlu diuji.

Gunakan publishable/anon key hanya sebagai client identifier publik bersama RLS. Hindari service-role/secret key untuk operasi CMS biasa; bila ada operasi administratif yang kelak benar-benar memerlukannya, hanya server-only, terpisah dari client, dan butuh persetujuan. Tidak ada secret di `NEXT_PUBLIC_*`.

## 7. Rancangan Supabase awal

Skema berikut proposal logis untuk dibahas, bukan migrasi yang telah dibuat. Semua tabel berada di schema `public` hanya jika memang perlu diakses melalui Data API, dengan RLS eksplisit.

### `site_content`

Satu row `id text primary key` bernilai `main`; `content jsonb not null` menyimpan hanya snapshot publik terkini (nav labels, hero, About, section headings, focus areas, contact/social, footer, metadata); `updated_at timestamptz not null`; `updated_by uuid references auth.users(id)`. Validasi bentuk/ukuran dilakukan di server sebelum tulis. `content` tidak boleh menerima markup atau style bebas.

Untuk MVP publish langsung: perubahan disimpan atomik sebagai konten publik dengan konfirmasi simpan. Jika pengguna mensyaratkan draft/preview, simpan draft dalam tabel terpisah yang hanya admin dapat baca/tulis; aksi publish menyalin snapshot ke `site_content`. Jangan mengandalkan filter UI saja.

### `portfolio_items`

- `id uuid primary key default gen_random_uuid()`; `slug text unique not null`; `kind text/enum not null` dengan nilai terkontrol (`project`, `certificate`, `education`, `experience`, `organization`).
- `title text not null`; `organization text null`; `category text null`; `summary text null`; `description text null`; `technologies text[] not null default '{}'`.
- `start_date date null`; `end_date date null`; `expires_on date null`; `credential_id text null`.
- `href text null`; `repository_href text null`; `credential_url text null`.
- `visual_key text null` dibatasi pada visual preset yang ada; `visual_label text null`.
- `sort_order integer not null default 0`; `status text not null` (`draft` atau `published`); `created_at`, `updated_at timestamptz`; `updated_by uuid references auth.users(id)`.

Proyek dan sertifikat yang juga ditampilkan di timeline diambil dari record yang sama. Timeline tetap membentuk label seperti `kind`, tanggal, link, dan kategori dari `kind`/field terstruktur. Placeholder pendidikan/pengalaman/organisasi dari baseline dimigrasikan apa adanya dan tidak dihapus diam-diam.

### Grants dan RLS

- Cabut grant default yang tidak diperlukan. `anon`: SELECT hanya konten published; tanpa INSERT/UPDATE/DELETE. `authenticated`: tidak mendapat akses tulis hanya karena login; policy perlu claim `app_metadata.portfolio_admin=true` untuk admin read/write.
- Untuk `portfolio_items`, public SELECT policy membatasi `status = 'published'`. Admin policy memakai claim untuk operasi yang disetujui. Draft tidak ikut query/render public.
- Untuk `site_content`, public hanya membaca row `main`, yang selalu berisi snapshot publik. Jika draft ditambahkan, policy/grant pada tabel draft admin-only harus mencegah pembacaan draft oleh anon.
- Tambahkan indeks untuk status/kind/sort order dan unique constraints seperlunya.
- Migrasi SQL menyimpan RLS, grants, policies, constraints, dan seed baseline secara reproducible. Tidak ada tindakan manual yang menjadi satu-satunya salinan schema.
- Buat pgTAP/Supabase DB tests untuk anon read published, anon tidak bisa menulis/membaca draft, authenticated non-admin ditolak, admin bisa CRUD yang diizinkan, serta data draft tidak bocor.

Supabase menyatakan tabel exposed tanpa RLS/grant terbatas dapat diakses sesuai grants default; kebijakan perlu diuji bersama grants. RLS berfungsi sebagai lapisan otorisasi database, bukan pengganti validasi server.

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
- Server Actions memvalidasi field, autentikasi/claim, dan hasil Supabase; database constraints/RLS tetap menjadi lapisan akhir.
- Simpan/update item dan publish memberi status sukses/gagal yang jelas; error teknis tidak membocorkan secret atau query.
- Konten publik gagal diambil: gunakan local fallback yang sama, log diagnostik server tanpa data sensitif. Jangan tampilkan draft.
- Destructive delete butuh konfirmasi, dan untuk item yang dipakai pada kartu/timeline tampilkan konsekuensi sebelum hapus.

## 10. Tahap implementasi yang diusulkan

Selesaikan satu tahap lalu berhenti untuk review/persetujuan.

0. **Perencanaan & keputusan** — dokumen ini dan progress selesai; pemilik memilih username mapping, publish/draft, Supabase project, deployment env, dan cakupan konten.
1. **Bootstrap aman** — siapkan akun Supabase, environment lokal/hosting, migration skeleton, seed admin, signup off, dan RLS tests. Tidak menaruh kredensial pada repo.
2. **Auth server-side** — pasang SDK yang dipilih (`@supabase/supabase-js`, `@supabase/ssr`), server client, `proxy.ts`, login/logout, protected admin, dan tes role/unauthorized; tanpa mengubah public UI.
3. **Schema & baseline seed** — migration `site_content`/`portfolio_items`, grants/RLS/index, data migration terverifikasi dan tests anon/non-admin/admin.
4. **Dynamic read — singleton copy** — hubungkan section copy dan metadata dengan adapter server; local fallback identik; visual compare desktop/mobile.
5. **Dynamic read — items** — pindahkan proyek/sertifikat/journey/focus, hilangkan duplikasi, selesaikan sumber tanggal/repository GitHub; visual dan animasi compare.
6. **Admin editing** — form per section, item CRUD/order, validasi, loading/error state, destructive confirmation, publish behavior yang disetujui. Pertahankan styling website publik.
7. **QA dan handoff** — test autentikasi/RLS, fallback/database unavailable, seluruh viewport, animasi, lint/typecheck/build, visual regression, README dan progress. Deployment hanya setelah instruksi/persetujuan terpisah.

Dependensi yang kemungkinan perlu ditambahkan: `@supabase/supabase-js` dan `@supabase/ssr`. Validator (misalnya Zod) hanya ditambahkan jika disetujui dan berguna untuk menjaga bentuk JSON/form; tidak dipasang sekarang.

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
| Signup atau Auth user kedua memberi write access | Signup off, policy memakai app_metadata admin claim, server checks di tiap mutation, audit daftar Auth users. |
| Admin URL disembunyikan tetapi action masih terbuka | Validasi server-side setiap Server Action/Route Handler; Proxy hanya tambahan. |
| Username dianggap native Auth | Map username tunggal ke email Auth di server; jangan simpan password sendiri. |
| Project API GitHub menimpa edit CMS | Putuskan satu source-of-truth; CMS-authoritative direkomendasikan. |
| Dynamic data gagal menyebabkan halaman kosong/layout shift | Local baseline fallback identik dan query server-side dengan error handling. |
| Data JSON tidak konsisten | Typed schema dan server validation, DB constraints untuk key fields, migration seed fixture. |
| Draft bocor melalui public query/cache | Draft table/private route, RLS/grants, no-store preview, tes anon dan cache headers. |
| Perubahan copy panjang merusak visual | Batas panjang dan preview; uji seluruh viewport, tanpa edit CSS otomatis. |
| URL media hilang/provider berubah | Tunda upload; pertahankan aset lokal hingga storage policy terpisah disetujui. |

## 13. File yang kemungkinan terlibat nanti

- Baru: `proxy.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts`, route `/admin/login` dan `/admin`, Server Actions, migration/seed/RLS tests di `supabase/`, `.env.example` (nama env dan placeholder tanpa rahasia), form/editor components.
- Berubah secara bertahap: `app/page.tsx`, `app/layout.tsx`, `app/data/portfolio.ts`, kemungkinan `app/data/github.ts`, komponen content-aware, dan docs/README setelah keputusan.
- Tidak direncanakan untuk perubahan visual: `app/globals.css`, `PixelatedPortraitReveal.tsx`, aset foto/screenshot, dan algoritma animasi. Jika nanti terbukti perlu menyentuhnya, perubahan harus dihentikan dan dimintakan persetujuan.

## 14. Keputusan yang diminta sebelum implementasi

1. Username admin yang ingin dipakai dan email Auth privat yang akan dipetakan ke username. Jangan kirim password lewat chat; buat/reset sendiri lewat Supabase Auth.
2. Perubahan langsung public setelah simpan, atau draft + tombol publish/preview? Rekomendasi MVP: konfirmasi simpan/publish langsung agar schema dan editor tetap kecil. Jika preview wajib, pilih draft private sejak tahap schema.
3. Apakah sudah ada project Supabase untuk dipakai, atau perlu dibuat baru? Region dan akses project perlu dikonfirmasi sebelum setup.
4. Apakah tanggal mulai dan link repository RuangLagi harus dikelola manual di CMS (rekomendasi) atau tetap disinkronkan dari GitHub jika field CMS kosong?
5. Apakah file foto/screenshot tetap dikelola di repository untuk MVP (rekomendasi) atau upload media harus termasuk lingkup awal?
6. Konfirmasi bahwa label placeholder pendidikan/pengalaman/organisasi yang sekarang terlihat tetap dipertahankan pada seed pertama, atau item tersebut boleh dikelola/draft setelah baseline awal terjaga.

## 15. Referensi teknis yang diperiksa

- [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side) — cookie sessions untuk SSR; dokumentasi menyatakan `@supabase/ssr` masih beta sehingga versi dan API harus dikunci/diperiksa saat implementasi.
- [Supabase SSR client setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — Next.js Server Components tidak dapat menulis cookie; Proxy digunakan untuk refresh token.
- [Supabase password auth](https://supabase.com/docs/guides/auth/passwords) — password sign-in memakai email atau phone.
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — grants dan policies harus disesuaikan serta diuji untuk setiap role/operasi.
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) — secret/service role memiliki akses elevated dan harus tetap server-side.
- [Next.js Proxy convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) — Next.js 16 memakai `proxy.ts`; Server Actions tetap harus melakukan pemeriksaan authorization sendiri.

## Riwayat perubahan rencana

| Tanggal | Perubahan | Alasan / persetujuan |
| --- | --- | --- |
| 2026-10-25 | Rencana awal dibuat | Mengikuti brief Portfolio CMS & Private Admin Dashboard. Belum ada implementasi. |
