type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issued: string;
  year: number;
  expires: string | null;
  credentialId: string;
  description: string;
  skills: readonly string[];
  credentialUrl: string | null;
};

export const certificates: Certificate[] = [
  {
    id: "coding-studio-penetration-testing",
    title: "Fundamental Penetration Testing",
    issuer: "Coding Studio",
    issued: "Februari 2026",
    year: 2026,
    expires: null,
    credentialId: "1lPMtj9JRd",
    description: "Materi fundamental penetration testing.",
    skills: ["Penetration Testing"],
    credentialUrl: null,
  },
  {
    id: "coding-studio-linux",
    title: "Fundamental Command Linux",
    issuer: "Coding Studio",
    issued: "Januari 2026",
    year: 2026,
    expires: null,
    credentialId: "4hQipv28Pa",
    description: "Materi fundamental perintah Linux.",
    skills: ["Linux"],
    credentialUrl: null,
  },
  {
    id: "coding-studio-networking",
    title: "Fundamental Jaringan Komputer",
    issuer: "Coding Studio",
    issued: "Januari 2026",
    year: 2026,
    expires: null,
    credentialId: "H7rAtmNOXQ",
    description: "Materi fundamental jaringan komputer.",
    skills: ["Jaringan Komputer"],
    credentialUrl: null,
  },
  {
    id: "dicoding-ai",
    title: "Belajar Dasar AI",
    issuer: "Dicoding Indonesia",
    issued: "Januari 2026",
    year: 2026,
    expires: "Januari 2029",
    credentialId: "JMZVVR4RRZN9",
    description: "Materi dasar kecerdasan buatan.",
    skills: ["Artificial Intelligence"],
    credentialUrl: "https://www.dicoding.com/certificates/JMZVVR4RRZN9",
  },
  {
    id: "dicoding-cloud-genai-aws",
    title: "Belajar Dasar Cloud dan Gen AI di AWS",
    issuer: "Dicoding Indonesia",
    issued: "Januari 2026",
    year: 2026,
    expires: "Januari 2029",
    credentialId: "53XEK67WKXRN",
    description: "Materi dasar cloud dan generative AI di AWS.",
    skills: ["Cloud Computing", "Generative AI", "AWS"],
    credentialUrl: "https://www.dicoding.com/certificates/53XEK67WKXRN",
  },
  {
    id: "coding-studio-cyber-security",
    title: "Fundamental Cyber Security",
    issuer: "Coding Studio",
    issued: "Desember 2025",
    year: 2025,
    expires: null,
    credentialId: "w3U3OEn1vV",
    description: "Materi fundamental keamanan siber.",
    skills: ["Cyber Security"],
    credentialUrl: null,
  },
  {
    id: "skillshop-google-ads-apps",
    title: "Google Ads Apps Certification",
    issuer: "Skillshop",
    issued: "Desember 2025",
    year: 2025,
    expires: "Desember 2026",
    credentialId: "168108340",
    description: "Sertifikasi Google Ads Apps.",
    skills: ["Google Ads Apps"],
    credentialUrl: null,
  },
  {
    id: "nalara-advanced-ai-deep-learning",
    title: "Nalara Academy, Advanced AI & Deep Learning Program",
    issuer: "Nalara Academy",
    issued: "Agustus 2026",
    year: 2026,
    expires: null,
    credentialId: "NLR-CERT-ADV-B01-0026",
    description: "Program Advanced AI dan Deep Learning dengan fokus MLOps.",
    skills: ["MLOps", "Advanced AI", "Deep Learning"],
    credentialUrl:
      "https://www.linkedin.com/in/rafif-arvazean/overlay/Certifications/935667001/treasury/?profileId=ACoAAF0KyogB-7EmVWY_0NmJme99XQ0PWNRqFms",
  },
];
