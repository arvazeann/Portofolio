# Portofolio Rafif Arvazean

Website personal untuk personal branding dan dokumentasi perjalanan belajar. Konten berfokus pada proses belajar dan proyek yang dapat dijelaskan secara faktual, bukan klaim pengalaman yang belum dimiliki.

## Teknologi

- Next.js App Router 16.4.2
- React 19.3.1
- TypeScript 5.9.3
- Tailwind CSS 4.3.3 dengan PostCSS
- ESLint 9.39.5 dan `eslint-config-next` untuk lint

Versi di atas sesuai dengan `package.json` dan lockfile repository saat ini.

## Prasyarat

- Node.js 20.9.0 atau lebih baru (persyaratan Next.js yang digunakan).
- npm.

## Instalasi dan development

```bash
npm ci
npm run dev
```

Buka <http://localhost:3000>.

## Pemeriksaan dan build

```bash
npm run lint
npm run typecheck
npm run build
```

Jalankan build produksi lokal dengan:

```bash
npm run start
```

`npm run start` menyajikan hasil build terakhir dan dijalankan setelah `npm run build`. Automated test script belum dikonfigurasi di `package.json`.

## Struktur penting

```text
app/
  globals.css       Tema, tipografi, layout responsif, dan reduced motion
  layout.tsx        Root layout, bahasa dokumen, dan metadata
  page.tsx          Halaman utama, navigasi, konten, dan data proyek
Profil.jpeg         Foto profil asli
```

Konfigurasi penting lainnya berada di `package.json`, `tsconfig.json`, `eslint.config.mjs`, dan `postcss.config.mjs`. `AGENTS.md`, `IMPLEMENTATION_PLAN.md`, dan `MASTER_PROMPT_CODEX.md` berisi panduan pengerjaan dan akurasi konten.

## Memperbarui konten

- **Profil, teks section, kontak, dan tautan:** edit markup di `app/page.tsx`. Periksa kembali alamat publik sebelum mengubah GitHub, LinkedIn, atau email.
- **Deskripsi, teknologi, status, dan tautan proyek:** edit array `projects` di bagian atas `app/page.tsx`. Bedakan implementasi terverifikasi dari konsep atau hal yang menunggu konfirmasi.
- **Foto profil:** ganti `Profil.jpeg` dengan foto asli yang boleh dipublikasikan. Pertahankan nama file tersebut atau sesuaikan import `profilePhoto` pada `app/page.tsx`. Kartu RuangLagi memakai screenshot halaman utama dan katalog demo di `public/projects/`; visual terminal proyek C tetap berupa ilustrasi konsep.
- **Title, description, Open Graph, dan bahasa dokumen:** edit metadata dan `<html lang>` pada `app/layout.tsx`. Jangan menambahkan canonical sebelum domain portofolio diketahui; tambahkan favicon atau gambar sosial hanya jika aset yang sesuai tersedia.
- **Warna, ukuran teks, jarak, dan breakpoint:** edit design tokens dan aturan responsif pada `app/globals.css`.

## Konfirmasi sebelum publikasi

- Demo RuangLagi dan repository proyek perlu ditinjau langsung untuk memastikan fitur tetap sesuai dengan versi yang dipublikasikan. Pemeriksaan HTTP terakhir menerima status 200 untuk demo dan repository, tetapi itu tidak memverifikasi alur aplikasi secara menyeluruh.
- URL LinkedIn publik belum dapat dipastikan melalui pemeriksaan otomatis (server mengembalikan status 999); buka tautan secara manual sebelum publikasi.
- Status fitur, tautan repository, dan kontribusi untuk proyek Sistem Manajemen Penjualan dan Stok UMKM berbasis C masih perlu dikonfirmasi. Kode proyek C tidak tersedia di repository portofolio ini.
- Screenshot RuangLagi merekam keadaan demo saat diambil dan dapat berbeda dari versi demo terkini. Visual proyek C adalah ilustrasi konsep, bukan bukti implementasi.
- Informasi pendidikan, catatan belajar, dan detail pribadi lain bersifat opsional; tambahkan hanya jika ingin dipublikasikan dan sudah dikonfirmasi.
- Domain dan penyedia hosting portofolio belum ditetapkan. Belum ada instruksi deployment khusus untuk provider tertentu.

## Akurasi dan privasi

Jangan menambahkan pengalaman, pencapaian, sertifikasi, statistik, metrik, atau tingkat kemahiran yang belum dikonfirmasi. File environment lokal (`.env*`) diabaikan oleh Git; jangan memasukkan token atau kredensial ke source maupun dokumentasi. Portofolio ini tidak memerlukan backend atau database.
