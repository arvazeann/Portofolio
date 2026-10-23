import Image from "next/image";
import profilePhoto from "../Profil.jpeg";
import PixelatedPortraitReveal from "./components/PixelatedPortraitReveal";

const navigation = [
  { href: "#tentang", label: "Tentang" },
  { href: "#proyek", label: "Proyek" },
  { href: "#sertifikat", label: "Sertifikat" },
  { href: "#perjalanan", label: "Perjalanan" },
  { href: "#kontak", label: "Kontak" },
];

const certificates = [
  {
    title: "Belajar Dasar AI",
    issuer: "Dicoding Indonesia",
    issued: "17 Januari 2026",
    expires: "17 Januari 2029",
    level: null,
    focus: null,
    credentialId: "JMZVVR4RRZN9",
    credentialUrl: "https://www.dicoding.com/certificates/JMZVVR4RRZN9",
  },
  {
    title: "Belajar Dasar Cloud dan Gen AI di AWS",
    issuer: "Dicoding Indonesia",
    issued: "26 Januari 2026",
    expires: "26 Januari 2029",
    level: null,
    focus: null,
    credentialId: "53XEK67WKXRN",
    credentialUrl: "https://www.dicoding.com/certificates/53XEK67WKXRN",
  },
  {
    title: "Nalara Academy, Advanced AI & Deep Learning Program",
    issuer: "Nalara Academy",
    issued: "Agustus 2026",
    expires: null,
    level: "Advanced",
    focus: "Implementasi Machine Learning Operations (MLOps)",
    credentialId: "NLR-CERT-ADV-B01-0026",
    credentialUrl:
      "https://www.linkedin.com/in/rafif-arvazean/overlay/Certifications/935667001/treasury/?profileId=ACoAAF0KyogB-7EmVWY_0NmJme99XQ0PWNRqFms",
  },
];

const projects = [
  {
    number: "01",
    name: "RuangLagi",
    category: "MVP · Marketplace barang preloved kebutuhan kos",
    description:
      "RuangLagi ditujukan untuk memudahkan anak kos mencari dan menawarkan barang preloved kebutuhan kos dengan harga bersahabat, seperti furnitur, alat dapur, elektronik, dan perlengkapan belajar.",
    technologies: "Next.js · React · TypeScript · PostgreSQL · Prisma · Auth.js",
    href: "https://ruanglagi.vercel.app/",
    repositoryHref: "https://github.com/arvazeann/Hackaton",
    visual: "ruanglagi",
    visualLabel: "Tampilan aktual dari demo RuangLagi",
  },
  {
    number: "02",
    name: "Sistem Manajemen Penjualan dan Stok UMKM",
    category: "Proyek akademik · CLI · C",
    description:
      "Proyek akademik berbasis CLI dalam bahasa C. Konsepnya mencakup pengelolaan produk dan stok, transaksi, riwayat transaksi, serta laporan.",
    technologies: null,
    href: null,
    repositoryHref: null,
    visual: "terminal",
    visualLabel: "Ilustrasi konsep terminal proyek C",
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="M3.25 12.75 12.5 3.5M4.5 3.5h8v8" />
    </svg>
  );
}

function ProjectVisual({ type, label }: { type: string; label: string }) {
  if (type === "ruanglagi") {
    return (
      <div className="project-visual project-visual--shop">
        <div className="visual-caption">{label}</div>
        <figure className="project-screenshot project-screenshot--home">
          <Image
            src="/projects/ruanglagi-homepage.png"
            alt="Halaman utama RuangLagi dengan navigasi, pencarian kebutuhan kos, dan pilihan barang preloved."
            fill
            sizes="(max-width: 600px) 78vw, (max-width: 800px) 40vw, 420px"
          />
          <figcaption>Halaman utama</figcaption>
        </figure>
        <figure className="project-screenshot project-screenshot--catalog">
          <Image
            src="/projects/ruanglagi-catalog.png"
            alt="Halaman katalog RuangLagi dengan pencarian, kategori, filter, dan kartu barang preloved."
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 800px) 27vw, 280px"
          />
          <figcaption>Katalog</figcaption>
        </figure>
      </div>
    );
  }

  return (
    <div className="project-visual project-visual--terminal" role="img" aria-label={label}>
      <div className="visual-caption">{label}</div>
      <div className="terminal-window">
        <div className="terminal-bar">
          <span className="terminal-dots" aria-hidden="true"><i /><i /><i /></span>
          <span>umkm-cli</span>
          <span className="terminal-language">C / TERMINAL</span>
        </div>
        <div className="terminal-body" aria-hidden="true">
          <p><span className="terminal-muted">$</span> ./umkm</p>
          <p className="terminal-green">Sistem Manajemen UMKM</p>
          <p className="terminal-muted">Pilih menu untuk melanjutkan:</p>
          <p><span className="terminal-number">01</span> Produk &amp; stok</p>
          <p><span className="terminal-number">02</span> Transaksi</p>
          <p><span className="terminal-number">03</span> Laporan</p>
          <p className="terminal-prompt">&gt; <span /></p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#konten">Lewati ke konten</a>

      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#beranda" aria-label="Rafif Arvazean, beranda">
            <span className="wordmark-mark">r.</span>
            <span>rafif arvazean</span>
          </a>
          <nav aria-label="Navigasi utama">
            <ul className="nav-list">
              {navigation.map((item) => (
                <li key={item.href}><a href={item.href}>{item.label}</a></li>
              ))}
            </ul>
          </nav>
          <a className="header-contact" href="mailto:rafifarvazean@gmail.com">
            Mari terhubung <ArrowIcon />
          </a>
        </div>
      </header>

      <main id="konten">
        <section className="hero-scroll" id="beranda" aria-labelledby="hero-title">
          <div className="hero hero-panel">
            <p className="hero-display-name" aria-hidden="true">Rafif Arvazean</p>
            <div className="portrait-wrap">
              <div className="portrait-frame">
                <Image
                  className="portrait-photo"
                  src={profilePhoto}
                  alt="Foto profil Rafif Arvazean"
                  fill
                  priority
                  sizes="(max-width: 600px) 94vw, (max-width: 800px) 76vw, 52vw"
                />
              </div>
              <p className="portrait-label">MAHASISWA INFORMATIKA</p>
            </div>
            <PixelatedPortraitReveal />
            <div className="hero-copy">
              <p className="eyebrow"><span className="status-dot" /> Mahasiswa Informatika · Sedang bertumbuh</p>
              <h1 id="hero-title">
                <span>Belajar, membangun,</span>
                <span className="hero-title-accent">lalu belajar lagi.</span>
              </h1>
              <p className="hero-description">
                Halo, saya <strong>Rafif Arvazean</strong>, mahasiswa Informatika yang
                membangun proyek sambil mendokumentasikan proses belajar.
              </p>
              <div className="hero-footnote"><span>01 / 03</span><span>PORTOFOLIO &amp; CATATAN BELAJAR</span></div>
            </div>
            <div className="hero-actions">
              <a className="button button-primary" href="#proyek">
                Lihat proyek
              </a>
              <a className="button button-secondary" href="mailto:rafifarvazean@gmail.com">
                Hubungi saya <span className="button-icon" aria-hidden="true"><ArrowIcon /></span>
              </a>
            </div>
            <a className="scroll-cue" href="#tentang"><span /> GULIR UNTUK MENJELAJAH</a>
          </div>
        </section>

        <section className="about-section section-shell section-divider" id="tentang" aria-labelledby="about-title">
          <div className="section-label"><span>01</span> TENTANG SAYA</div>
          <div className="about-content">
            <h2 id="about-title">Sedang mencari tahu<br />apa yang bisa <em>dibangun.</em></h2>
            <div className="about-copy">
              <p>
                Portofolio ini mencatat proyek yang saya bangun dan hal-hal yang saya
                pelajari sebagai mahasiswa Informatika.
              </p>
              <p className="muted-copy">Pelan-pelan, satu proyek dan satu pelajaran pada satu waktu.</p>
            </div>
          </div>
        </section>

        <section className="projects-section section-shell section-divider" id="proyek" aria-labelledby="projects-title">
          <div className="section-heading">
            <div>
              <div className="section-label"><span>02</span> PILIHAN PROYEK</div>
              <h2 id="projects-title">Belajar lewat <em>praktik.</em></h2>
            </div>
            <p>Dua proyek yang tercatat dalam perjalanan belajar saya.</p>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" key={project.number}>
                <ProjectVisual type={project.visual} label={project.visualLabel} />
                <div className="project-details">
                  <div className="project-meta"><span>{project.number}</span><span>{project.category}</span></div>
                  <h3>{project.name}</h3>
                  <p className="project-description">{project.description}</p>
                  {project.technologies && (
                    <p className="project-tech"><span>Teknologi</span>{project.technologies}</p>
                  )}
                  {(project.href || project.repositoryHref) && (
                    <div className="project-links">
                      {project.href && (
                        <a className="project-link" href={project.href} target="_blank" rel="noreferrer">
                          Buka demo <ArrowIcon />
                        </a>
                      )}
                      {project.repositoryHref && (
                        <a className="project-link" href={project.repositoryHref} target="_blank" rel="noreferrer">
                          Repository <ArrowIcon />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="certificates-section section-shell section-divider" id="sertifikat" aria-labelledby="certificates-title">
          <div className="certificates-heading">
            <div className="section-label"><span>03</span> SERTIFIKAT</div>
            <h2 id="certificates-title">Belajar dan <em>bertumbuh.</em></h2>
            <p>Kredensial pembelajaran yang dapat diperiksa pada halaman penerbit.</p>
          </div>
          <div className="certificate-grid">
            {certificates.map((certificate) => (
              <article className="certificate-card" key={certificate.credentialId}>
                <p className="certificate-issuer">{certificate.issuer}</p>
                <h3>{certificate.title}</h3>
                <dl className="certificate-dates">
                  <div>
                    <dt>Diterbitkan</dt>
                    <dd>{certificate.issued}</dd>
                  </div>
                  <div>
                    <dt>{certificate.expires ? "Berlaku sampai" : "Level"}</dt>
                    <dd>{certificate.expires ?? certificate.level}</dd>
                  </div>
                </dl>
                {certificate.focus && <p className="certificate-focus">{certificate.focus}</p>}
                <p className="certificate-id"><span>ID kredensial</span> {certificate.credentialId}</p>
                <a className="project-link certificate-link" href={certificate.credentialUrl} target="_blank" rel="noreferrer">
                  Lihat kredensial <ArrowIcon />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="journey-section section-shell section-divider" id="perjalanan" aria-labelledby="journey-title">
          <div className="section-label"><span>04</span> PERJALANAN BELAJAR</div>
          <div className="journey-content">
            <div>
              <h2 id="journey-title">Yang Sedang <em>Dipelajari</em></h2>
              <p className="journey-intro">
                Saya belajar dengan mengerjakan proyek dan mendokumentasikan hal-hal
                yang saya pahami sepanjang prosesnya.
              </p>
            </div>
            <div className="journey-note">
              <p>Catatan ini mengikuti proses belajar dan proyek yang saya kerjakan.</p>
              <span className="journey-caption">PROSES BELAJAR · PROYEK</span>
            </div>
          </div>
        </section>

        <section className="contact-section" id="kontak" aria-labelledby="contact-title">
          <div className="contact-inner section-shell">
            <div className="section-label"><span>05</span> KONTAK</div>
            <div className="contact-content">
              <div>
                <p className="eyebrow">PUNYA IDE ATAU INGIN BERKENALAN?</p>
                <h2 id="contact-title">Mari mulai<br /><em>percakapan.</em></h2>
              </div>
              <a className="contact-email" href="mailto:rafifarvazean@gmail.com">
                rafifarvazean@gmail.com <ArrowIcon />
              </a>
            </div>
            <nav className="social-links" aria-label="Profil dan kontak lain">
              <a href="https://github.com/arvazeann" target="_blank" rel="noreferrer">GitHub <ArrowIcon /></a>
              <a href="https://www.linkedin.com/in/rafif-arvazean/" target="_blank" rel="noreferrer">LinkedIn <ArrowIcon /></a>
              <a href="mailto:rafifarvazean@gmail.com">Email <ArrowIcon /></a>
            </nav>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner section-shell">
          <a className="wordmark footer-wordmark" href="#beranda"><span className="wordmark-mark">r.</span><span>rafif arvazean</span></a>
          <p>Dibuat sebagai bagian dari perjalanan belajar.</p>
          <a className="back-to-top" href="#beranda">Kembali ke atas</a>
        </div>
      </footer>
    </>
  );
}
