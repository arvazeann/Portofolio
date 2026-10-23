export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issued: string;
  year: number;
  start: string;
  expires: string | null;
  credentialId: string;
  description: string;
  skills: readonly string[];
  credentialUrl: string | null;
};

export type Project = {
  id: string;
  number: string;
  name: string;
  category: string;
  description: string;
  technologies: string | null;
  href: string | null;
  repositoryHref: string | null;
  visual: string;
  visualLabel: string;
  start: string | null;
};

export type JourneyCategory = "pendidikan" | "pengalaman" | "proyek" | "sertifikasi" | "organisasi";
export type JourneyItem = {
  id: string;
  category: JourneyCategory;
  title: string;
  org: string;
  kind?: string;
  start?: string;
  end?: string | "present";
  dateLabel?: string;
  expires?: string;
  description?: string;
  skills?: readonly string[];
  links?: readonly { label: string; url: string }[];
  credentialId?: string;
  source: "linkedin" | "github" | "situs" | "placeholder";
};

export const certificates: Certificate[] = [
  { id: "coding-studio-penetration-testing", title: "Fundamental Penetration Testing", issuer: "Coding Studio", issued: "Februari 2026", year: 2026, start: "2026-02", expires: null, credentialId: "1lPMtj9JRd", description: "Materi fundamental penetration testing.", skills: ["Penetration Testing"], credentialUrl: null },
  { id: "coding-studio-linux", title: "Fundamental Command Linux", issuer: "Coding Studio", issued: "Januari 2026", year: 2026, start: "2026-01", expires: null, credentialId: "4hQipv28Pa", description: "Materi fundamental perintah Linux.", skills: ["Linux"], credentialUrl: null },
  { id: "coding-studio-networking", title: "Fundamental Jaringan Komputer", issuer: "Coding Studio", issued: "Januari 2026", year: 2026, start: "2026-01", expires: null, credentialId: "H7rAtmNOXQ", description: "Materi fundamental jaringan komputer.", skills: ["Jaringan Komputer"], credentialUrl: null },
  { id: "dicoding-ai", title: "Belajar Dasar AI", issuer: "Dicoding Indonesia", issued: "Januari 2026", year: 2026, start: "2026-01", expires: "Januari 2029", credentialId: "JMZVVR4RRZN9", description: "Materi dasar kecerdasan buatan.", skills: ["Artificial Intelligence"], credentialUrl: "https://www.dicoding.com/certificates/JMZVVR4RRZN9" },
  { id: "dicoding-cloud-genai-aws", title: "Belajar Dasar Cloud dan Gen AI di AWS", issuer: "Dicoding Indonesia", issued: "Januari 2026", year: 2026, start: "2026-01", expires: "Januari 2029", credentialId: "53XEK67WKXRN", description: "Materi dasar cloud dan generative AI di AWS.", skills: ["Cloud Computing", "Generative AI", "AWS"], credentialUrl: "https://www.dicoding.com/certificates/53XEK67WKXRN" },
  { id: "coding-studio-cyber-security", title: "Fundamental Cyber Security", issuer: "Coding Studio", issued: "Desember 2025", year: 2025, start: "2025-12", expires: null, credentialId: "w3U3OEn1vV", description: "Materi fundamental keamanan siber.", skills: ["Cyber Security"], credentialUrl: null },
  { id: "skillshop-google-ads-apps", title: "Google Ads Apps Certification", issuer: "Skillshop", issued: "Desember 2025", year: 2025, start: "2025-12", expires: "Desember 2026", credentialId: "168108340", description: "Sertifikasi Google Ads Apps.", skills: ["Google Ads Apps"], credentialUrl: null },
  { id: "nalara-advanced-ai-deep-learning", title: "Nalara Academy, Advanced AI & Deep Learning Program", issuer: "Nalara Academy", issued: "Agustus 2026", year: 2026, start: "2026-08", expires: null, credentialId: "NLR-CERT-ADV-B01-0026", description: "Program Advanced AI dan Deep Learning dengan fokus MLOps.", skills: ["MLOps", "Advanced AI", "Deep Learning"], credentialUrl: "https://www.linkedin.com/in/rafif-arvazean/overlay/Certifications/935667001/treasury/?profileId=ACoAAF0KyogB-7EmVWY_0NmJme99XQ0PWNRqFms" },
];

export const projects: Project[] = [
  { id: "ruanglagi", number: "01", name: "RuangLagi", category: "MVP · Marketplace barang preloved kebutuhan kos", description: "RuangLagi ditujukan untuk memudahkan anak kos mencari dan menawarkan barang preloved kebutuhan kos dengan harga bersahabat, seperti furnitur, alat dapur, elektronik, dan perlengkapan belajar.", technologies: "Next.js · React · TypeScript · PostgreSQL · Prisma · Auth.js", href: "https://ruanglagi.vercel.app/", repositoryHref: "https://github.com/arvazeann/Hackaton", visual: "ruanglagi", visualLabel: "Tampilan aktual dari demo RuangLagi", start: null },
  { id: "umkm-c", number: "02", name: "Sistem Manajemen Penjualan dan Stok UMKM", category: "Proyek akademik · CLI · C", description: "Proyek akademik berbasis CLI dalam bahasa C. Konsepnya mencakup pengelolaan produk dan stok, transaksi, riwayat transaksi, serta laporan.", technologies: null, href: null, repositoryHref: null, visual: "terminal", visualLabel: "Ilustrasi konsep terminal proyek C", start: null },
];

export function makeJourneyItems(ruangLagiStart?: string): JourneyItem[] {
  const projectItems: JourneyItem[] = projects.map((project) => ({
    id: project.id, category: "proyek", title: project.name,
    org: project.id === "umkm-c" ? "Proyek akademik" : "Proyek",
    kind: project.id === "umkm-c" ? "CLI · C" : "MVP",
    start: project.id === "ruanglagi" ? ruangLagiStart : undefined,
    dateLabel: project.id === "umkm-c" && !project.start ? "ISI TANGGAL" : project.id === "ruanglagi" && !ruangLagiStart ? "ISI TANGGAL" : undefined,
    description: project.description,
    skills: project.technologies?.split(" · "),
    links: [project.href && { label: "Buka demo", url: project.href }, project.repositoryHref && { label: "Repository", url: project.repositoryHref }].filter((item): item is { label: string; url: string } => Boolean(item)),
    source: project.id === "ruanglagi" ? "github" : "placeholder",
  }));
  const certificateItems: JourneyItem[] = certificates.map((certificate) => ({
    id: certificate.id, category: "sertifikasi", title: certificate.title,
    org: certificate.issuer, kind: "Sertifikasi", start: certificate.start,
    expires: certificate.expires ?? undefined,
    description: certificate.description, skills: certificate.skills,
    credentialId: certificate.credentialId,
    links: certificate.credentialUrl ? [{ label: "Lihat kredensial", url: certificate.credentialUrl }] : [],
    source: "linkedin",
  }));
  const profilePlaceholders: JourneyItem[] = [
    { id: "education-linkedin", category: "pendidikan", title: "Pendidikan — ISI DARI LINKEDIN", org: "ISI DARI LINKEDIN", kind: "Pendidikan", description: "Tambahkan institusi dan rentang waktu setelah detailnya dikonfirmasi.", source: "placeholder" },
    { id: "experience-linkedin", category: "pengalaman", title: "Pengalaman — ISI DARI LINKEDIN", org: "ISI DARI LINKEDIN", kind: "Pengalaman", description: "Tambahkan pengalaman yang ingin dipublikasikan setelah detailnya dikonfirmasi.", source: "placeholder" },
    { id: "organization-linkedin", category: "organisasi", title: "Organisasi — ISI DARI LINKEDIN", org: "ISI DARI LINKEDIN", kind: "Organisasi", description: "Tambahkan organisasi setelah detailnya dikonfirmasi.", source: "placeholder" },
  ];
  return [...projectItems, ...certificateItems, ...profilePlaceholders].sort((a, b) => (b.start ?? "0000-00").localeCompare(a.start ?? "0000-00"));
}

export const focusAreas = ["Web", "AI / ML", "Cloud", "C"] as const;
