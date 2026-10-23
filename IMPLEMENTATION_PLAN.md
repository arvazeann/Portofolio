# Implementation Plan — Portofolio Rafif Arvazean

## Cara menggunakan rencana

Pengerjaan dilakukan bertahap agar agent tidak membuat asumsi terlalu jauh. Setiap stage menghasilkan perubahan yang bisa diperiksa. Secara default, agent berhenti setelah satu stage dan menunggu persetujuan pengguna. Jika pengguna meminta seluruh stage sekaligus, agent boleh melanjutkan tetapi tetap membuat checkpoint dan laporan per stage.

## Stage 0 — Audit repository dan konfirmasi arah

**Tujuan:** memahami kondisi sebelum mengubah apa pun.

Tugas:
- Periksa `AGENTS.md`, `README.md`, `package.json`, konfigurasi, struktur folder, dan komponen yang sudah ada.
- Identifikasi framework, versi runtime, styling, routing, testing, dan perintah yang tersedia.
- Periksa apakah repository sudah berisi aplikasi. Pertahankan kode yang berguna.
- Catat masalah nyata dan informasi yang masih perlu dikonfirmasi.
- Buat rencana perubahan file untuk Stage 1–2.

Jangan:
- Menulis ulang aplikasi sebelum audit.
- Menghapus file atau memasang dependency.
- Mengklaim telah menjalankan test jika belum.

**Selesai jika:** ada ringkasan audit, keputusan stack berdasarkan kondisi nyata, daftar file yang mungkin diubah, dan blocker yang jelas.

## Stage 1 — Fondasi dan struktur

**Tujuan:** menyiapkan fondasi maintainable dengan perubahan minimal.

Tugas:
- Pertahankan stack existing bila sesuai. Jika repo kosong dan pengguna setuju, gunakan Next.js App Router, React, TypeScript, Tailwind CSS.
- Siapkan struktur komponen dan data proyek yang mudah diedit.
- Siapkan metadata dasar, font, tema, dan konfigurasi yang diperlukan.
- Buat design tokens untuk warna, spacing, radius, dan tipografi bila berguna.
- Pastikan script development/build/lint sesuai konfigurasi yang benar-benar terpasang.

**Selesai jika:** aplikasi dapat dijalankan dengan perintah yang terdokumentasi dan fondasi tidak menimbulkan error konfigurasi yang diketahui.

## Stage 2 — Halaman utama dan desain

**Tujuan:** membuat halaman utama portofolio yang kohesif.

Bagian:
1. Navigation
2. Hero / introduction
3. About
4. Featured projects
5. Focus / skills in progress
6. Learning journey
7. Contact
8. Footer

Arah visual:
- Dark developer editorial, charcoal/hitam dengan aksen hijau lembut.
- Tipografi jelas, layout lega, hierarki visual kuat.
- Animasi kecil saja; jangan mengorbankan aksesibilitas atau performa.
- Responsif pada mobile, tablet, desktop.
- Jangan menggunakan foto AI atau foto stok sebagai identitas Rafif. Bila foto belum tersedia, gunakan komposisi grafis atau slot foto kosong yang disengaja.

**Selesai jika:** seluruh bagian utama hadir, navigasi bekerja, tidak ada tombol palsu, dan tampilan konsisten pada ukuran layar utama.

## Stage 3 — Proyek dan konten faktual

**Tujuan:** menjadikan proyek sebagai bukti proses belajar.

Proyek awal:
- **RuangLagi:** MVP marketplace barang preloved untuk kebutuhan kos dengan harga bersahabat. Link: https://ruanglagi.vercel.app/
- **Sistem Manajemen Penjualan dan Stok UMKM berbasis C:** proyek akademik CLI; status fitur perlu dikonfirmasi.

Untuk setiap proyek, gunakan struktur:
- Ringkasan dan masalah yang ingin ditangani.
- Tujuan.
- Kontribusi pribadi (hanya fakta yang diketahui).
- Teknologi (verifikasi).
- Tantangan dan pelajaran (gunakan placeholder atau tanyakan jika belum diketahui).
- Status proyek.
- Link demo/repository jika tersedia.

Jangan menampilkan metrik atau hasil terukur yang belum ada. Jangan menyebut mockup CSS sebagai screenshot produk asli.

**Selesai jika:** deskripsi akurat, status jelas, link valid atau dihilangkan, dan konten mudah diperbarui.

## Stage 4 — Responsivitas, aksesibilitas, SEO, performa

**Tujuan:** memastikan pengalaman penggunaan berkualitas.

Checklist:
- Periksa viewport mobile, tablet, desktop.
- Pastikan tidak ada horizontal overflow.
- Gunakan landmark semantic, heading yang berurutan, alt text, focus state, dan kontras memadai.
- Pastikan navigasi keyboard dan reduced motion.
- Periksa metadata title/description, favicon bila tersedia, dan social metadata jika relevan.
- Hindari gambar berat, animasi berlebihan, serta dependency yang tidak perlu.
- Pastikan external links aman dan link email menggunakan `mailto:`.

**Selesai jika:** checklist sudah diperiksa dan isu yang tersisa terdokumentasi.

## Stage 5 — QA, dokumentasi, handoff

**Tujuan:** menyerahkan proyek yang dapat dilanjutkan pemiliknya.

Tugas:
- Jalankan script yang benar-benar tersedia: lint, typecheck, test, build.
- Perbaiki error yang disebabkan perubahan stage ini.
- Lakukan smoke test halaman dan link utama jika memungkinkan.
- Perbarui README dengan instalasi, development, build, deployment, struktur, dan cara memperbarui konten.
- Pastikan `AGENTS.md` dan rencana tidak bertentangan dengan implementasi.
- Laporkan file berubah, hasil validasi nyata, limitasi, dan langkah berikutnya.

**Selesai jika:** cara menjalankan terdokumentasi, hasil pemeriksaan dilaporkan secara jujur, dan tidak ada klaim deploy yang belum dilakukan.

## Definition of Done keseluruhan

- Profil dan link akurat.
- Tidak ada pencapaian atau pengalaman fiktif.
- Halaman responsif dan aksesibel.
- Navigasi dan CTA bekerja.
- Konten proyek menyebut status yang benar.
- Perintah validasi sudah dijalankan atau kegagalan/limitasi dijelaskan.
- README dan panduan agent lengkap.
- Tidak ada deploy/push tanpa izin.
