"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type NavigationItem = { href: string; label: string };

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
  );
}

function ThemeToggle() {
  const isLight = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("portfolio-theme", onChange);
      return () => window.removeEventListener("portfolio-theme", onChange);
    },
    () => document.documentElement.dataset.theme === "light",
    () => false,
  );

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("rafif-theme", next);
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f1f4ee" : "#101310");
    window.dispatchEvent(new Event("portfolio-theme"));
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-pressed={isLight} aria-label={isLight ? "Aktifkan tema gelap" : "Aktifkan tema terang"}>
      <svg className="theme-icon theme-icon--sun" aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
      <svg className="theme-icon theme-icon--moon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" /></svg>
    </button>
  );
}

export function SiteHeader({ navigation }: { navigation: NavigationItem[] }) {
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        setCompact(currentY > 40);
        ticking = false;
      });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (!menuOpen || event.key !== "Tab") return;
      const focusable = Array.from(headerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (menuOpen && !headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  return (
    <header ref={headerRef} className={`site-header${compact ? " is-compact" : ""}${menuOpen ? " menu-open" : ""}`}>
      <div className="header-inner">
        <a className="wordmark" href="#beranda" aria-label="Rafif Arvazean, beranda" onClick={closeMenu}>
          <span className="wordmark-mark">r.</span><span>rafif arvazean</span>
        </a>
        <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"} onClick={() => setMenuOpen((open) => !open)}>
          <MenuIcon open={menuOpen} />
        </button>
        <nav id="primary-navigation" aria-label="Navigasi utama" className={menuOpen ? "nav-open" : ""}>
          <ul className="nav-list">
            {navigation.map((item) => <li key={item.href}><a href={item.href} onClick={closeMenu}>{item.label}</a></li>)}
          </ul>
          <a className="nav-connect" href="#kontak" onClick={closeMenu}>Mari terhubung</a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function ScrollProgress() {
  const progressRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current?.style.setProperty("transform", `scaleX(${max > 0 ? window.scrollY / max : 0})`);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <span className="scroll-progress" aria-hidden="true" ref={progressRef} />;
}

export function Preloader() {
  const [progress, setProgress] = useState(4);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const root = document.documentElement;
    const overlay = document.getElementById("preloader");
    if (!overlay || root.dataset.preload !== "1") return;
    const phrase = "> rafif arvazean";
    let index = 0;
    const typeTimer = window.setInterval(() => {
      index += 1;
      setTyped(phrase.slice(0, index));
      if (index >= phrase.length) window.clearInterval(typeTimer);
    }, 42);
    const started = performance.now();
    let frame = 0;
    let done = false;
    let readinessTimer = 0;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearInterval(typeTimer);
      root.classList.add("preloader-exit");
      window.setTimeout(() => {
        delete root.dataset.preload;
        root.classList.remove("preloader-exit");
      }, 670);
    };
    const tick = () => {
      const elapsed = performance.now() - started;
      setProgress(Math.min(96, 4 + elapsed / 2350 * 92));
      const portrait = document.querySelector<HTMLImageElement>(".portrait-photo");
      const ready = Boolean(portrait?.complete && portrait.naturalWidth && document.fonts.status === "loaded");
      if (elapsed >= 1250 && ready) finish();
      else if (elapsed >= 2200) finish();
      else frame = window.requestAnimationFrame(tick);
    };
    readinessTimer = window.setTimeout(finish, 2300);
    frame = window.requestAnimationFrame(tick);
    return () => { window.clearInterval(typeTimer); window.clearTimeout(readinessTimer); window.cancelAnimationFrame(frame); };
  }, []);
  return (
    <div id="preloader" className="preloader" aria-hidden="true">
      <div className="preloader-content"><span className="preloader-line">{typed || ">"}<span className="preloader-cursor" /></span><span className="preloader-track"><span style={{ transform: `scaleX(${progress / 100})` }} /></span></div>
    </div>
  );
}

export function TypingLabel() {
  const [text, setText] = useState("Mahasiswa Informatika · Sedang bertumbuh");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const phrases = ["Mahasiswa Informatika", "Membangun proyek", "Mendokumentasikan proses belajar"];
    let phraseIndex = 0;
    let characterIndex = text.length;
    let deleting = true;
    let timer = 0;
    const step = () => {
      const phrase = phrases[phraseIndex];
      characterIndex += deleting ? -1 : 1;
      setText(phrase.slice(0, Math.max(0, characterIndex)));
      if (characterIndex <= 0 && deleting) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
      else if (characterIndex >= phrases[phraseIndex].length && !deleting) {
        deleting = true;
        timer = window.setTimeout(step, 1400);
        return;
      }
      timer = window.setTimeout(step, deleting ? 35 : 55);
    };
    timer = window.setTimeout(step, 1800);
    return () => window.clearTimeout(timer);
  // Keep a stable initial phrase for the server rendered version.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <span className="typing-label" aria-label="Mahasiswa Informatika · Sedang bertumbuh"><span className="status-dot" aria-hidden="true" /><span aria-hidden="true">{text}</span></span>;
}
