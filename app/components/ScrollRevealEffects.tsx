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

    if (!motionPreference.matches && "IntersectionObserver" in window) {
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
      if (!id || id === activeId) return;
      activeId = id;
      navLinks.forEach((link) => {
        if (link.hash === `#${id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const sectionObserver = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveSection((current.target as HTMLElement).id);
      }, { rootMargin: "-24% 0px -64% 0px", threshold: [0, 0.16, 0.32] })
      : undefined;
    sections.forEach((section) => sectionObserver?.observe(section));

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
      sectionObserver?.disconnect();
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      revealElements.forEach((element) => {
        element.classList.remove("reveal-pending", "reveal-visible");
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, []);

  return null;
}
