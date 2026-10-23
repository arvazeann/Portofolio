import Image from "next/image";
import profilePhoto from "../Profil.jpeg";

const navigation = [
  { href: "#tentang", label: "Tentang" },
  { href: "#proyek", label: "Proyek" },
  { href: "#perjalanan", label: "Perjalanan" },
  { href: "#kontak", label: "Kontak" },
];

const projects = [
  {
    number: "01",
    name: "RuangLagi",
    category: "MVP · Marketplace kebutuhan kos",
    description:
      "Tempat bagi anak kos untuk mencari dan menawarkan barang kebutuhan kos preloved dengan harga bersahabat, seperti furnitur, alat dapur, elektronik, dan perlengkapan belajar.",
    technologies: "Next.js · React · TypeScript · PostgreSQL · Prisma · Auth.js",
    note:
      "Fitur yang terdokumentasi mencakup katalog, pencarian/filter, favorit, dan pesanan. Uji browser menyeluruh masih tertunda.",
    href: "https://ruanglagi.vercel.app/",
    repositoryHref: "https://github.com/arvazeann/Hackaton",
    visual: "ruanglagi",
    visualLabel: "Ilustrasi konsep, bukan screenshot produk",
  },
  {
    number: "02",
    name: "Sistem Manajemen Penjualan dan Stok UMKM",
    category: "Proyek akademik · CLI · C",
    description:
      "Proyek akademik berbasis terminal dengan konsep pengelolaan produk, transaksi, riwayat transaksi, laporan, dan stok.",
    technologies: null,
    note:
      "Kode sumber belum tersedia di repository portofolio. Status implementasi fitur dan tautan repository spesifik perlu dikonfirmasi.",
    href: null,
    repositoryHref: null,
    visual: "terminal",
    visualLabel: "Ilustrasi terminal, bukan tampilan aplikasi",
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
      <div className="project-visual project-visual--shop" role="img" aria-label={label}>
        <div className="visual-caption">{label}</div>
        <div className="shop-window">
          <div className="shop-topline">
            <span>ruanglagi</span>
            <span className="shop-menu">MENU&nbsp;&nbsp; BAG</span>
          </div>
          <div className="shop-art">
            <span className="shop-art-label">BARANG PRELOVED ANAK KOS</span>
            <span className="shop-art-title">Cari barang<br />untuk kos.</span>
            <span className="shop-art-orbit" aria-hidden="true" />
            <span className="shop-art-chip">KEBUTUHAN KOS<br />01 / 02</span>
          </div>
          <div className="shop-bottomline">
            <span>BARANG PRELOVED</span>
            <span>UNTUK ANAK KOS</span>
          </div>
        </div>
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
        <section className="hero section-shell" id="beranda" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> Mahasiswa Informatika · Sedang bertumbuh</p>
            <h1 id="hero-title">Belajar, membangun,<br /><span>lalu belajar lagi.</span></h1>
            <p className="hero-description">
              Halo, saya <strong>Rafif Arvazean</strong>. Saya sedang belajar
              Informatika dan membangun proyek sebagai bagian dari prosesnya.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#proyek">
                Lihat proyek
              </a>
              <a className="button button-secondary" href="mailto:rafifarvazean@gmail.com">
                Hubungi saya <span className="button-icon" aria-hidden="true"><ArrowIcon /></span>
              </a>
            </div>
            <div className="hero-footnote"><span>01 / 03</span><span>PORTOFOLIO &amp; CATATAN BELAJAR</span></div>
          </div>
          <div className="portrait-wrap">
            <div className="portrait-frame">
              <Image
                className="portrait-photo"
                src={profilePhoto}
                alt="Foto profil Rafif Arvazean"
                fill
                priority
                sizes="(max-width: 600px) 240px, 300px"
              />
            </div>
            <p className="portrait-label">INFORMATICS STUDENT</p>
          </div>
          <a className="scroll-cue" href="#tentang"><span /> GULIR UNTUK MENJELAJAH</a>
        </section>

        <section className="about-section section-shell section-divider" id="tentang" aria-labelledby="about-title">
          <div className="section-label"><span>01</span> TENTANG SAYA</div>
          <div className="about-content">
            <h2 id="about-title">Sedang mencari tahu<br />apa yang bisa <em>dibangun.</em></h2>
            <div className="about-copy">
              <p>
                Di sini saya mendokumentasikan proses belajar dan proyek yang saya
                bangun. Catatan ini akan berkembang seiring perjalanan saya di bidang
                Informatika.
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
            <p>Dua proyek dalam perjalanan belajar saya.<br />Detailnya akan terus diperbarui.</p>
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
                  <p className="project-note">{project.note}</p>
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
                    {!project.href && !project.repositoryHref && (
                      <span className="project-link project-link--pending">Repository belum tersedia</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="journey-section section-shell section-divider" id="perjalanan" aria-labelledby="journey-title">
          <div className="section-label"><span>03</span> PERJALANAN BELAJAR</div>
          <div className="journey-content">
            <div>
              <h2 id="journey-title">Prosesnya masih <em>berjalan.</em></h2>
              <p className="journey-intro">
                Bagian ini akan merangkum hal yang sedang dipelajari dan proyek yang
                dibangun. Untuk sekarang, perjalanan ini saya dokumentasikan dari
                waktu ke waktu.
              </p>
            </div>
            <div className="journey-note">
              <p>Catatan belajar dan fokus berikutnya akan ditambahkan seiring perjalanan ini berkembang.</p>
              <span className="journey-caption">CURRENTLY LEARNING · TO BE CONTINUED</span>
            </div>
          </div>
        </section>

        <section className="contact-section" id="kontak" aria-labelledby="contact-title">
          <div className="contact-inner section-shell">
            <div className="section-label"><span>04</span> KONTAK</div>
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
