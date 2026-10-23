import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteTitle = "Rafif Arvazean | Portofolio";
const siteDescription =
  "Portofolio dan dokumentasi perjalanan belajar Rafif Arvazean, mahasiswa Informatika.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#101310",
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
