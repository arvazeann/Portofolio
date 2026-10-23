import Image from "next/image";
import profilePhoto from "../Profil.jpeg";
import JourneyTimeline from "./components/JourneyTimeline";
import PixelatedPortraitReveal from "./components/PixelatedPortraitReveal";
import { Preloader, ScrollProgress, SiteHeader, TypingLabel } from "./components/PortfolioChrome";
import ScrollRevealEffects from "./components/ScrollRevealEffects";
import { getRuangLagiRepository } from "./data/github";
import { certificates, focusAreas, makeJourneyItems, projects as projectData } from "./data/portfolio";

const navigation = [
  { href: "#tentang", label: "Tentang" },
  { href: "#proyek", label: "Proyek" },
  { href: "#perjalanan", label: "Perjalanan" },
  { href: "#kontak", label: "Kontak" },
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

function Marquee({ text }: { text: string }) {
  return (
    <div className="marquee" aria-label={text}>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1, 2, 3].map((copy) => <span key={copy}>{text}<i> · </i></span>)}
      </div>
    </div>
  );
}

export default async function Home() {
  const ruangLagiRepository = await getRuangLagiRepository();
  const projects = projectData.map((project) => project.id === "ruanglagi" && ruangLagiRepository
    ? { ...project, repositoryHref: ruangLagiRepository.url, start: ruangLagiRepository.createdAt }
    : project);
  const journeyItems = makeJourneyItems(ruangLagiRepository?.createdAt);
  return (
    <>
      <a className="skip-link" href="#konten">Lewati ke konten</a>
      <ScrollProgress />
      <SiteHeader navigation={navigation} />
      <Preloader />

      <main id="konten">
        <section className="hero-scroll is-scroll-enhanced" id="beranda" aria-labelledby="hero-title">
          <div className="hero hero-panel">
            <p className="hero-display-name hero-entry hero-entry--title" aria-hidden="true">ARVAZEAN</p>
            <div className="portrait-wrap hero-entry hero-entry--portrait">
              <div className="portrait-frame">
                <Image
                  className="portrait-photo"
                  src={profilePhoto}
                  alt=""
                  aria-hidden="true"
                  fill
                  priority
                  sizes="(max-width: 600px) 94vw, (max-width: 800px) 76vw, 52vw"
                />
                <Image
                  className="portrait-static-fallback"
                  src="/profile-pixelated-fallback.png"
                  alt="Potret Rafif Arvazean dalam tampilan monokrom berpiksel."
                  fill
                  priority
                  sizes="(max-width: 600px) 94vw, (max-width: 800px) 76vw, 52vw"
                />
              </div>
            </div>
            <PixelatedPortraitReveal />
            <div className="hero-copy hero-entry hero-entry--copy">
              <p className="eyebrow"><TypingLabel /></p>
              <h1 id="hero-title">
                <span>Belajar, membangun,</span>
                <span className="hero-title-accent">lalu belajar lagi.</span>
              </h1>
            </div>
            <div className="hero-actions hero-entry hero-entry--actions">
              <a className="button button-primary" href="#proyek">
                Lihat proyek
              </a>
              <a className="button button-secondary" href="mailto:rafifarvazean@gmail.com">
                Hubungi saya <span className="button-icon" aria-hidden="true"><ArrowIcon /></span>
              </a>
            </div>
          </div>
        </section>

        <Marquee text="Belajar · Membangun · Belajar lagi" />

        <section className="about-section section-shell section-divider" id="tentang" aria-labelledby="about-title">
          <div className="section-label" data-reveal><span>01</span> TENTANG SAYA</div>
          <div className="about-content">
            <h2 id="about-title" data-reveal data-reveal-delay="90"><span className="title-line"><span>Sedang mencari tahu</span></span><span className="title-line"><span>apa yang bisa <em>dibangun.</em></span></span></h2>
            <div className="about-copy" data-reveal data-reveal-delay="180">
              <p>
                Portofolio ini mencatat proyek yang saya bangun dan hal-hal yang saya
                pelajari sebagai mahasiswa Informatika.
              </p>
              <p className="muted-copy">Pelan-pelan, satu proyek dan satu pelajaran pada satu waktu.</p>
            </div>
          </div>
          <div className="about-extras" data-reveal data-reveal-delay="240">
            <div className="focus-area-list" aria-label="Bidang yang tercatat dalam proyek dan pembelajaran">
              {focusAreas.map((area) => <span key={area}>{area}</span>)}
            </div>
            <div className="about-stats" aria-label="Ringkasan portofolio">
              <div><strong aria-hidden="true" data-count-up={projects.length}>{String(projects.length).padStart(2, "0")}</strong><span>Proyek tercatat</span></div>
              <div><strong aria-hidden="true" data-count-up={certificates.length}>{String(certificates.length).padStart(2, "0")}</strong><span>Sertifikat tercatat</span></div>
            </div>
          </div>
        </section>

        <Marquee text="Web · AI / ML · Cloud · C" />

        <section className="projects-section section-shell section-divider" id="proyek" aria-labelledby="projects-title">
          <div className="section-heading">
            <div>
              <div className="section-label" data-reveal><span>02</span> PILIHAN PROYEK</div>
              <h2 id="projects-title" data-reveal data-reveal-delay="90"><span className="title-line"><span>Belajar lewat <em>praktik.</em></span></span></h2>
            </div>
            <p data-reveal data-reveal-delay="180">Dua proyek yang tercatat dalam perjalanan belajar saya.</p>
          </div>

          <div className="project-list">
            {projects.map((project, index) => (
              <article className="project-card" key={project.number} data-reveal data-reveal-delay={String(index * 100)}>
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

        <Marquee text="Proses · Praktik · Perkembangan" />

        <section className="journey-section section-shell section-divider" id="perjalanan" aria-labelledby="journey-title">
          <div className="section-label" data-reveal><span>03</span> PERJALANAN BELAJAR</div>
          <div className="journey-content">
            <div data-reveal data-reveal-delay="90">
              <h2 id="journey-title"><span className="title-line"><span>Yang Sedang <em>Dipelajari</em></span></span></h2>
              <p className="journey-intro">
                Saya belajar dengan mengerjakan proyek dan mendokumentasikan hal-hal
                yang saya pahami sepanjang prosesnya.
              </p>
            </div>
            <div className="journey-note" data-reveal data-reveal-delay="180">
              <p>Catatan ini mengikuti proses belajar dan proyek yang saya kerjakan.</p>
              <span className="journey-caption">PROSES BELAJAR · PROYEK</span>
            </div>
          </div>
          <JourneyTimeline items={journeyItems} />
        </section>

        <section className="contact-section" id="kontak" aria-labelledby="contact-title">
          <div className="contact-inner section-shell">
            <div className="section-label" data-reveal><span>04</span> KONTAK</div>
            <div className="contact-content" data-reveal data-reveal-delay="100">
              <div>
                <p className="eyebrow">PUNYA IDE ATAU INGIN BERKENALAN?</p>
                <h2 id="contact-title"><span className="title-line"><span>Mari mulai</span></span><span className="title-line"><span><em>percakapan.</em></span></span></h2>
              </div>
              <a className="contact-email" href="mailto:rafifarvazean@gmail.com">
                rafifarvazean@gmail.com <ArrowIcon />
              </a>
            </div>
            <nav className="social-links" aria-label="Profil dan kontak lain" data-reveal data-reveal-delay="200">
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
      <ScrollRevealEffects />
    </>
  );
}
