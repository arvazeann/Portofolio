"use client";

import { useEffect } from "react";

export default function ScrollRevealEffects() {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let revealObserver: IntersectionObserver | undefined;
    let countObserver: IntersectionObserver | undefined;
    let activeId = "";
    const countRafs = new Map<HTMLElement, number>();

    if (motionPreference.matches) {
      revealElements.forEach((element) => element.classList.add("reveal-visible"));
      document.querySelectorAll<HTMLElement>("[data-count-up]").forEach((element) => {
        element.textContent = element.dataset.countUp ?? element.textContent;
      });
    } else if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.classList.add("reveal-visible");
          element.classList.remove("reveal-pending");
          revealObserver?.unobserve(element);
        });
      }, { threshold: 0.16 });

      revealElements.forEach((element) => {
        const delay = Number(element.dataset.revealDelay ?? 0);
        element.style.setProperty("--reveal-delay", `${delay}ms`);
        element.classList.add("reveal-pending");
        revealObserver?.observe(element);
      });

      const countElements = Array.from(document.querySelectorAll<HTMLElement>("[data-count-up]"));
      countObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const target = Number(element.dataset.countUp);
          const startedAt = performance.now();
          const duration = 720;
          element.textContent = "0";

          const updateCount = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / duration);
            const eased = 1 - (1 - progress) ** 3;
            element.textContent = String(Math.round(target * eased));
            if (progress < 1) countRafs.set(element, window.requestAnimationFrame(updateCount));
            else countRafs.delete(element);
          };

          countRafs.set(element, window.requestAnimationFrame(updateCount));
          countObserver?.unobserve(element);
        });
      }, { threshold: 0.2 });
      countElements.forEach((element) => countObserver?.observe(element));
    }

    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-list a[href^='#']"));
    const sections = navLinks
      .map((link) => document.querySelector<HTMLElement>(link.getAttribute("href") ?? ""))
      .filter((section): section is HTMLElement => section !== null);

    const setActiveSection = (id: string) => {
      if (id === activeId) return;
      activeId = id;
      navLinks.forEach((link) => {
        if (link.hash === `#${id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    let activeSectionFrame = 0;
    const updateActiveSection = () => {
      window.cancelAnimationFrame(activeSectionFrame);
      activeSectionFrame = window.requestAnimationFrame(() => {
        const marker = Math.min(window.innerHeight * 0.35, 280);
        const measured = sections.map((section) => ({ section, rect: section.getBoundingClientRect() }));
        const current = measured.find(({ rect }) => rect.top <= marker && rect.bottom > marker)?.section
          ?? measured.filter(({ rect }) => rect.top <= marker).at(-1)?.section;
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
          setActiveSection(sections.at(-1)?.id ?? "");
        } else {
          setActiveSection(current?.id ?? "");
        }
      });
    };
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection, { passive: true });
    updateActiveSection();

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      revealObserver?.disconnect();
      revealElements.forEach((element) => {
        element.classList.remove("reveal-pending");
        element.classList.add("reveal-visible");
      });
      countObserver?.disconnect();
      document.querySelectorAll<HTMLElement>("[data-count-up]").forEach((element) => {
        const raf = countRafs.get(element);
        if (raf) window.cancelAnimationFrame(raf);
        countRafs.delete(element);
        element.textContent = element.dataset.countUp ?? element.textContent;
      });
    };
    motionPreference.addEventListener("change", onMotionPreferenceChange);

    return () => {
      revealObserver?.disconnect();
      countObserver?.disconnect();
      countRafs.forEach((raf) => window.cancelAnimationFrame(raf));
      countRafs.clear();
      window.cancelAnimationFrame(activeSectionFrame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      revealElements.forEach((element) => {
        element.classList.remove("reveal-pending", "reveal-visible");
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, []);

  return null;
}
