"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { JourneyCategory, JourneyItem } from "../data/portfolio";

const filters: { key: "semua" | JourneyCategory; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "pendidikan", label: "Pendidikan" },
  { key: "pengalaman", label: "Pengalaman" },
  { key: "proyek", label: "Proyek" },
  { key: "sertifikasi", label: "Sertifikasi" },
  { key: "organisasi", label: "Organisasi" },
];

function formatDate(value?: string) {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function JourneyCard({ item }: { item: JourneyItem }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = (item.description?.length ?? 0) > 120;
  const dateText = item.dateLabel ?? (item.start ? formatDate(item.start) : "ISI DARI LINKEDIN");
  const initials = item.org.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <article className="journey-card" data-journey-card>
      <span className="journey-node" aria-hidden="true" />
      <div className="journey-date">{dateText}</div>
      <div className="journey-card-body">
        <div className="journey-org-mark" aria-hidden="true">{initials || "?"}</div>
        <div className="journey-card-content">
          <p className="journey-item-kind">{item.org} <span>·</span> {item.kind ?? item.category}</p>
          <h3>{item.title}</h3>
          <div className={`journey-description${expanded ? " is-expanded" : ""}`}>
            <p>{item.description ?? "ISI DARI LINKEDIN"}</p>
          </div>
          {item.expires && <p className="journey-validity">Berlaku sampai {item.expires}</p>}
          {canExpand && <button className="journey-expand" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Ringkas" : "Lihat selengkapnya"}</button>}
          {item.skills?.length ? <ul className="journey-skills" aria-label="Topik terkait">{item.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul> : null}
          {item.credentialId && <p className="journey-credential">ID kredensial <code>{item.credentialId}</code></p>}
          {item.links?.length ? <div className="journey-links">{item.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</div> : null}
          {item.source === "placeholder" && <span className="journey-placeholder">Perlu dilengkapi</span>}
        </div>
      </div>
    </article>
  );
}

export default function JourneyTimeline({ items }: { items: JourneyItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("semua");
  const [showAll, setShowAll] = useState(false);
  const filteredItems = useMemo(() => filter === "semua" ? items : items.filter((item) => item.category === filter), [filter, items]);
  const shownItems = showAll ? filteredItems : filteredItems.slice(0, 4);

  function changeList(update: () => void) {
    const list = listRef.current;
    if (!list) { update(); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { update(); return; }
    list.style.height = `${list.getBoundingClientRect().height}px`;
    list.style.overflow = "hidden";
    update();
    requestAnimationFrame(() => {
      if (!list.isConnected) return;
      list.style.transition = "height 350ms cubic-bezier(0.22, 1, 0.36, 1)";
      list.style.height = `${list.scrollHeight}px`;
      window.setTimeout(() => {
        list.style.removeProperty("height");
        list.style.removeProperty("overflow");
        list.style.removeProperty("transition");
      }, 400);
    });
  }

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
        section.style.setProperty("--timeline-progress", `${progress}`);
      });
    };
    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window && !reducedMotion.matches) {
      observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          observer?.unobserve(entry.target);
        }
      }), { threshold: 0.15 });
    }
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer?.disconnect();
      section.querySelectorAll<HTMLElement>("[data-journey-card]").forEach((card) => card.classList.add("is-in-view"));
    };
    reducedMotion.addEventListener("change", onMotionPreferenceChange);
    section.querySelectorAll<HTMLElement>("[data-journey-card]").forEach((card) => observer ? observer.observe(card) : card.classList.add("is-in-view"));
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); reducedMotion.removeEventListener("change", onMotionPreferenceChange); window.removeEventListener("scroll", updateProgress); window.removeEventListener("resize", updateProgress); };
  }, [shownItems]);

  return (
    <section ref={sectionRef} className="journey-timeline" aria-label="Riwayat belajar dan proyek">
      <div className="journey-filter" role="group" aria-label="Filter perjalanan">
        {filters.map((option) => <button key={option.key} type="button" aria-pressed={filter === option.key} onClick={() => changeList(() => { setFilter(option.key); setShowAll(false); })}>{option.label}</button>)}
      </div>
      <div ref={listRef} className="journey-timeline-list" aria-live="polite">
        {shownItems.map((item) => <JourneyCard key={item.id} item={item} />)}
      </div>
      {filteredItems.length > 4 && <button className="journey-show-all" type="button" onClick={() => changeList(() => setShowAll((value) => !value))}>{showAll ? "Tampilkan lebih sedikit" : `Tampilkan semua (${filteredItems.length})`}</button>}
    </section>
  );
}
