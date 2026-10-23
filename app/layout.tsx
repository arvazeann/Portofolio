import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const siteTitle = "Rafif Arvazean | Portofolio";
const siteDescription =
  "Portofolio dan dokumentasi perjalanan belajar Rafif Arvazean, mahasiswa Informatika.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arvazeann.vercel.app"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "id_ID",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Rafif Arvazean — portofolio dan catatan perjalanan belajar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#101310",
  colorScheme: "dark light",
};

const startupScript = `(()=>{try{const root=document.documentElement;history.scrollRestoration="manual";const scrollToTop=()=>window.scrollTo(0,0);scrollToTop();window.addEventListener("pageshow",scrollToTop,{once:true});const saved=localStorage.getItem("rafif-theme");root.dataset.theme=saved||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");const setColor=()=>{const meta=document.querySelector('meta[name="theme-color"]');if(meta){meta.content=root.dataset.theme==="light"?"#f1f4ee":"#101310";if(headObserver)headObserver.disconnect()}};let headObserver=new MutationObserver(setColor);headObserver.observe(document.head,{childList:true,subtree:true});setColor();setTimeout(()=>headObserver&&headObserver.disconnect(),1500);if(!matchMedia("(prefers-reduced-motion: reduce)").matches){root.dataset.preload="1";setTimeout(()=>{delete root.dataset.preload;delete root.dataset.portraitRevealAt;root.classList.remove("intro-name","intro-drop","portrait-reveal-active","nav-intro-active","preloader-exit")},8000)}}catch{document.documentElement.dataset.theme="dark"}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Script id="portfolio-startup" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: startupScript }} />
        {children}
      </body>
    </html>
  );
}
