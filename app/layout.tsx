import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rafif Arvazean | Portofolio",
  description:
    "Portofolio dan dokumentasi perjalanan belajar Rafif Arvazean, mahasiswa Informatika.",
  openGraph: {
    title: "Rafif Arvazean | Portofolio",
    description:
      "Portofolio dan dokumentasi perjalanan belajar Rafif Arvazean, mahasiswa Informatika.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
