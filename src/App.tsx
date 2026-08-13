"use client";

import { useState, useEffect, useRef } from "react";

/* ─── palette ────────────────────────────────────────────── */
const C = {
  bg: "#ffffff",
  surface: "#f6f5f1",
  surface2: "#181d2a",
  glass: "#111520",
  glassBorder: "rgba(255,255,255,0.09)",
  accent: "#c9a96e",
  accentGlow: "rgba(201,169,110,0.18)",
  accentDim: "rgba(201,169,110,0.1)",
  cream: "#ede9df",
  muted: "#7a8099",
  text: "#e4e0d6",
};

/* ─── global animation styles injected once ──────────────── */
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.93); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 rgba(201,169,110,0.35); }
      70%  { box-shadow: 0 0 0 12px rgba(201,169,110,0); }
      100% { box-shadow: 0 0 0 0 rgba(201,169,110,0); }
    }

    .animate-fade-up   { animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-fade-in   { animation: fadeIn 0.5s ease both; }
    .animate-scale-in  { animation: scaleIn 0.55s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-float     { animation: float 4s ease-in-out infinite; }

    .card-3d {
      transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.3s ease;
    }
    .card-3d:hover {
      transform: translateY(-6px) scale(1.015);
      box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,110,0.18);
    }

    .glow-on-hover {
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .glow-on-hover:hover {
      box-shadow: 0 0 28px rgba(201,169,110,0.12), 0 12px 40px rgba(0,0,0,0.4);
      border-color: rgba(201,169,110,0.3) !important;
    }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: ${C.accent}; color: #080a0e;
      font-weight: 700; font-size: 0.875rem; letter-spacing: 0.04em;
      padding: 0.8rem 1.8rem; border-radius: 100px;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s;
      text-decoration: none;
    }
    .btn-primary:hover {
      background: #d9bc82;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(201,169,110,0.35);
    }
    .btn-primary:active { transform: translateY(0); }

    .btn-outline {
      display: inline-flex; align-items: center; gap: 0.5rem;
      border: 1px solid rgba(255,255,255,0.18); color: ${C.cream};
      font-weight: 500; font-size: 0.875rem; letter-spacing: 0.04em;
      padding: 0.8rem 1.8rem; border-radius: 100px;
      transition: border-color 0.2s, background 0.2s, transform 0.18s;
      text-decoration: none;
    }
    .btn-outline:hover {
      border-color: ${C.accent};
      background: ${C.accentDim};
      transform: translateY(-2px);
    }

    .nav-pill-link {
      font-size: 0.8rem; letter-spacing: 0.07em; text-transform: uppercase;
      color: ${C.muted}; text-decoration: none;
      padding: 0.4rem 0.75rem; border-radius: 100px;
      transition: color 0.2s, background 0.2s;
    }
    .nav-pill-link:hover { color: ${C.cream}; background: rgba(255,255,255,0.07); }

    .skill-tag {
      font-size: 0.72rem; letter-spacing: 0.05em;
      background: rgba(201,169,110,0.1); color: ${C.accent};
      border: 1px solid rgba(201,169,110,0.22);
      padding: 0.28rem 0.7rem; border-radius: 100px;
      white-space: nowrap;
    }

    .section-tag {
      font-family: 'DM Mono', monospace; font-size: 0.68rem;
      letter-spacing: 0.14em; text-transform: uppercase; color: ${C.accent};
    }

    .font-display { font-family: 'DM Serif Display', serif; }
    .font-mono-data { font-family: 'DM Mono', monospace; }

    /* reveal on scroll */
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1); }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    input, textarea {
      font-family: 'Inter', sans-serif;
    }
    input:focus, textarea:focus { outline: none; }

    @media (max-width: 860px) {
      .hero-grid   { grid-template-columns: 1fr !important; }
      .two-col     { grid-template-columns: 1fr !important; }
      .three-col   { grid-template-columns: 1fr !important; }
      .why-grid    { grid-template-columns: 1fr 1fr !important; }
    }
    @media (max-width: 540px) {
      .why-grid    { grid-template-columns: 1fr !important; }
      .projects-grid { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

/* ─── intersection-observer reveal hook ──────────────────── */
function useReveal(ref: React.RefObject<HTMLElement | null>, delay = 0) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref as React.RefObject<HTMLElement>, delay);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/* ─── helpers ────────────────────────────────────────────── */
function Tag({ children }: { children: string }) {
  return <span className="section-tag">{children}</span>;
}

function SkillPill({ label }: { label: string }) {
  return <span className="skill-tag">{label}</span>;
}

function SectionHeading({
  tag,
  title,
  subtitle,
  center,
}: {
  tag: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className="section-heading" style={{ marginBottom: "3rem", textAlign: center ? "center" : "left" }}>
      <Tag>{tag}</Tag>
      <h2
        className="font-display"
        style={{
          fontSize: "clamp(1.9rem, 3.8vw, 2.9rem)",
          color: C.cream,
          margin: "0.7rem 0 0",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            color: C.muted,
            marginTop: "0.9rem",
            maxWidth: "52ch",
            fontSize: "1rem",
            margin: center ? "0.9rem auto 0" : "0.9rem 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── floating navbar ────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) drawerRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButtonRef.current?.focus(); }
      if (event.key === "Tab" && open && drawerRef.current) {
        const items = [...drawerRef.current.querySelectorAll<HTMLElement>("a,button")];
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", close); };
  }, [open]);

  const links = ["Assessment", "Services", "Projects", "Expertise", "About", "Contact"];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: scrolled ? "16px" : "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          width: scrolled ? "min(1040px, calc(100vw - 2rem))" : "min(1120px, calc(100vw - 2rem))",
          background: scrolled
            ? "rgba(11,13,18,0.82)"
            : "rgba(11,13,18,0.55)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          border: `1px solid ${scrolled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: "100px",
          boxShadow: scrolled
            ? "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset"
            : "none",
          transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
          padding: "0 1.25rem",
          height: "54px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="#hero"
          className="font-display"
          style={{
            fontSize: "1rem",
            color: C.cream,
            textDecoration: "none",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}
        >
          Alphonse Afanyu
        </a>

        {/* desktop */}
        <div
          style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}
          className="nav-desktop"
        >
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-pill-link">
              {l}
            </a>
          ))}
          <a
            href="#contact"
            className="btn-primary"
            style={{ marginLeft: "0.5rem", padding: "0.55rem 1.25rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
          >
            Hire Me
          </a>
          <a href="/cv" className="nav-pill-link">CV</a>
        </div>

        {/* mobile toggle */}
        <button
          ref={menuButtonRef}
          onClick={() => setOpen(!open)}
          className="nav-mobile-btn"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          style={{
            background: "none", border: "none", color: C.cream,
            cursor: "pointer", padding: "0.5rem", display: "none",
          }}
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
            {open ? (
              <>
                <line x1="1" y1="1" x2="19" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="19" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            ) : (
              <>
                <line x1="0" y1="2" x2="20" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="0" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="0" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* mobile drawer — rendered outside pill */}
      {open && (
        <><button className="nav-backdrop" aria-label="Close navigation menu" onClick={() => setOpen(false)} /><div
          ref={drawerRef}
          id="mobile-navigation"
          role="dialog"
          aria-label="Mobile navigation"
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(400px, calc(100vw - 2rem))",
            zIndex: 190,
            background: "rgba(11,13,18,0.96)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${C.glassBorder}`,
            borderRadius: "20px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            animation: "scaleIn 0.25s ease both",
          }}
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="nav-pill-link"
              style={{ display: "block", padding: "0.6rem 0.75rem" }}
              onClick={() => setOpen(false)}
            >
              {l}
            </a>
          ))}
          <a
            href="#contact"
            className="btn-primary"
            style={{ alignSelf: "flex-start", padding: "0.7rem 1.4rem" }}
            onClick={() => setOpen(false)}
          >
            Hire Me
          </a>
        </div></>
      )}

      <style>{`
        @media (max-width: 1020px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

/* ─── hero ───────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "80px 2rem 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ambient glow blobs */}
      <div style={{
        position: "absolute", top: "10%", right: "5%",
        width: "520px", height: "520px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", bottom: "5%", left: "-5%",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,120,200,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      <div
        className="hero-grid"
        style={{
          maxWidth: "1200px", margin: "0 auto", width: "100%",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "4rem", alignItems: "center",
        }}
      >
        {/* text */}
        <div>
          <div
            className="animate-fade-up"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.55rem",
              background: C.accentDim, border: `1px solid rgba(201,169,110,0.2)`,
              padding: "0.35rem 1rem 0.35rem 0.6rem", borderRadius: "100px",
              marginBottom: "2rem",
            }}
          >
            <span style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: C.accent, display: "inline-block",
              animation: "pulseRing 2s ease-out infinite",
            }}/>
            <span className="section-tag">Available — remote & freelance</span>
          </div>

          <h1
            className="font-display animate-fade-up"
            style={{
              fontSize: "clamp(2.75rem, 5.5vw, 4.5rem)",
              lineHeight: 1.08, color: C.cream, margin: 0,
              animationDelay: "0.1s",
            }}
          >
            Engineering
            <br />
            Better Food{" "}
            <em style={{ color: C.accent, fontStyle: "italic" }}>From Lab</em>
            <br />
            to Production
          </h1>

          <p
            className="animate-fade-up"
            style={{
              color: C.muted, fontSize: "1.0625rem", lineHeight: 1.8,
              maxWidth: "46ch", margin: "1.75rem 0 2.5rem",
              animationDelay: "0.2s",
            }}
          >
            Food Process Engineer (MEng) helping businesses develop safer
            products, optimise processing lines, and build quality into every
            step — from formulation to the factory floor.
          </p>

          <div
            className="animate-fade-up"
            style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", animationDelay: "0.3s" }}
          >
            <a href="#contact" className="btn-primary">Work With Me</a>
            <a href="#projects" className="btn-outline">View Projects</a>
          </div>

          <div
            className="animate-fade-up"
            style={{ display: "flex", gap: "1.5rem", marginTop: "2.5rem", animationDelay: "0.4s" }}
          >
            {[
              { label: "LinkedIn ↗", href: "https://www.linkedin.com/in/afanyualphonse" },
              { label: "Upwork ↗", href: "https://www.upwork.com/freelancers/~016ee7dd377a843ad7?companyReference=2067365472542990758&mp_source=share" },
            ].map(({ label, href }) => (
              <a
                key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{
                  color: C.muted, fontSize: "0.8125rem", textDecoration: "none",
                  letterSpacing: "0.05em", transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* hero card stack */}
        <div
          className="animate-scale-in"
          style={{ position: "relative", height: "520px", animationDelay: "0.25s" }}
        >
          {/* main image card */}
          <div
            style={{
              position: "absolute", inset: 0,
              borderRadius: "24px", overflow: "hidden",
              border: `1px solid ${C.glassBorder}`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
            }}
          >
            <img
              src="/food-process-lab.png"
              alt="Food processing facility — industrial manufacturing environment"
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6) contrast(1.05)" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(11,13,18,0.8) 0%, transparent 55%)",
            }}/>
          </div>

          {/* floating stat — MEng */}
          <div
            className="animate-float"
            style={{
              position: "absolute", top: "1.5rem", right: "-1.25rem",
              background: "rgba(11,13,18,0.88)", backdropFilter: "blur(16px)",
              border: `1px solid rgba(201,169,110,0.25)`, borderRadius: "18px",
              padding: "1rem 1.25rem",
              boxShadow: "0 12px 36px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
              animationDelay: "0.5s",
            }}
          >
            <div className="font-display" style={{ fontSize: "1.6rem", color: C.accent, lineHeight: 1 }}>MEng</div>
            <div style={{ color: C.muted, fontSize: "0.7rem", marginTop: "0.3rem", letterSpacing: "0.04em" }}>
              Food Process Engineering
            </div>
          </div>

          {/* floating stat — available */}
          <div
            style={{
              position: "absolute", bottom: "2rem", left: "-1rem",
              background: "rgba(11,13,18,0.88)", backdropFilter: "blur(16px)",
              border: `1px solid ${C.glassBorder}`, borderRadius: "18px",
              padding: "1.25rem 1.5rem",
              boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
              display: "flex", flexDirection: "column", gap: "0.75rem",
              minWidth: "200px",
            }}
          >
            {[
              { label: "Specialisation", val: "Food Process Eng." },
              { label: "Location", val: "Bamenda, Cameroon" },
              { label: "Status", val: "Open to work" },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: "0.72rem", letterSpacing: "0.05em" }}>{label}</span>
                <span style={{ color: C.cream, fontSize: "0.78rem", fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── free food-safety assessment ───────────────────────── */
const assessmentTypes = ["Bakery", "Juice production", "Dairy products", "Snacks"];

function FreeAssessment() {
  const [business, setBusiness] = useState(assessmentTypes[0]);
  const text = encodeURIComponent(`Hello Alphonse, I would like to book a free food safety assessment for my ${business.toLowerCase()} business.`);
  return <section id="assessment" className="light-section" style={{ padding: "100px 2rem", background: C.surface }}>
    <div className="two-col" style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
      <Reveal><Tag>// free assessment</Tag><h2 className="font-display" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", lineHeight: 1.12, color: C.cream, margin: "1rem 0" }}>Find Food-Safety Gaps Before They Cost You</h2><p style={{ color: C.muted, lineHeight: 1.8 }}>A free 30-minute review for small food businesses in Cameroon, followed by a concise self-check report highlighting 3–5 practical improvement areas.</p><div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: "1.5rem" }}>{["100% free", "No obligation", "Confidential"].map(x => <SkillPill key={x} label={x} />)}</div></Reveal>
      <Reveal delay={100}><div className="assessment-card"><p className="section-tag">Choose your business</p><div className="assessment-options">{assessmentTypes.map(type => <button type="button" key={type} className={business === type ? "active" : ""} onClick={() => setBusiness(type)}>{type}</button>)}</div><div className="assessment-report"><small>What you get</small><strong>3–5</strong><span>key improvement areas and practical recommendations</span></div><a className="btn-primary" href={`https://wa.me/237653367464?text=${text}`} target="_blank" rel="noopener noreferrer">Book on WhatsApp →</a></div></Reveal>
    </div>
  </section>;
}

/* ─── services ───────────────────────────────────────────── */
const services = [
  { icon: "🧪", title: "Food Product Development", desc: "Concept to prototype — formulating products that are stable, nutritious, and market-ready." },
  { icon: "⚗️", title: "Product Formulation", desc: "Composite flour systems, ingredient interactions, functional-property evaluation, nutritional profiling." },
  { icon: "⚙️", title: "Process Optimisation", desc: "Identifying bottlenecks in production lines and designing leaner, more consistent processing workflows." },
  { icon: "✅", title: "Quality Assurance & QC", desc: "In-process checks, acceptance criteria, and monitoring procedures for consistent batch quality." },
  { icon: "🛡️", title: "Food Safety & HACCP", desc: "Applying HACCP principles and GMP frameworks to identify hazards and set critical control points." },
  { icon: "📦", title: "Shelf-Life & Stability", desc: "Evaluating preservation strategies that extend usable shelf life without compromising safety." },
  { icon: "📄", title: "Technical Documentation", desc: "Process specifications, product-development reports, SOPs, and technical summaries." },
];

function Services() {
  return (
    <section id="services" className="light-section" style={{ padding: "110px 0", background: C.surface }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <Reveal>
          <SectionHeading
            tag="// what i do"
            title="Services"
            subtitle="Practical food-engineering support for businesses developing, producing, or improving food products."
          />
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <div
                className="glow-on-hover"
                style={{
                  background: C.glass,
                  border: `1px solid ${C.glassBorder}`,
                  borderRadius: "20px",
                  padding: "2rem",
                  height: "100%",
                  transition: "background 0.25s, transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s",
                  cursor: "default",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.surface2; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = C.glass; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: "1rem", lineHeight: 1 }}>{s.icon}</div>
                <h3
                  className="font-display"
                  style={{ fontSize: "1.15rem", color: C.cream, margin: "0 0 0.65rem", lineHeight: 1.3 }}
                >
                  {s.title}
                </h3>
                <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0, lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── projects ───────────────────────────────────────────── */
const projects = [
  {
    id: "01",
    title: "Tomato Processing",
    org: "Savannah Foods",
    role: "Project contribution",
    tags: ["Raw Material Processing", "Process Monitoring", "QA"],
    image: "/food-process-lab.png",
    imageAlt: "Ripe red tomatoes for processing",
    desc: "Worked on transforming fresh tomatoes into concentrated products through raw-material processing, processing operations, process monitoring, quality considerations, and product improvement.",
    result: "Practical contribution across tomato-processing and product-development activities.",
  },
  {
    id: "02",
    title: "Millet-Based Baby Food",
    org: "MEng Thesis Research",
    role: "Master’s project",
    tags: ["Formulation", "Nutritional Analysis", "Sensory Evaluation"],
    image: "/food-process-lab.png",
    imageAlt: "Baby being fed nutritious food",
    desc: "Developed a complementary baby-food product using millet — formulation design, processing method selection, nutritional considerations for infant requirements, and multi-round evaluation.",
    result: "Millet-based baby-food product developed and evaluated through research and experimentation.",
  },
  {
    id: "03",
    title: "Composite Flour Cookies",
    org: "Bambara Groundnut & Plantain Peel",
    role: "Development and evaluation project",
    tags: ["Composite Flour", "Baking Technology", "Nutritional Analysis"],
    image: "/food-process-lab.png",
    imageAlt: "Freshly baked cookies showing texture and colour",
    desc: "Developed and compared cookie formulations using Bambara groundnut and plantain-peel flours through nutritional analysis, functional-property evaluation, baking-process evaluation, and experimental comparison.",
    result: "Protein: 6.90% → 14.22% (F4) · Carbohydrate: 53.72–65.80% · Moisture: 4.82–5.79% · Energy: 415.8–440.0 kcal/100 g",
    highlight: true,
  },
  {
    id: "04",
    title: "Shelf-Life Extension of Purees",
    org: "Leelou",
    role: "Practical preservation project",
    tags: ["Preservation", "Food Safety", "Product Stability"],
    image: "/food-process-lab.png",
    imageAlt: "Fresh fruit evaluated for preservation",
    desc: "Worked on extending the shelf life of food purees using potassium sorbate, considering food preservation, product stability, food safety, and experimental evaluation.",
    result: "Preservation treatment evaluated across stability and food-safety parameters.",
  },
];

function ProjectCard({ p, delay = 0 }: { p: typeof projects[0]; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: cy * -8, y: cx * 8 });
  }

  return (
    <Reveal delay={delay}>
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
        style={{
          background: hovered ? C.surface2 : C.glass,
          border: `1px solid ${hovered ? "rgba(201,169,110,0.25)" : C.glassBorder}`,
          borderRadius: "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? "translateY(-6px)" : ""}`,
          transition: "transform 0.18s ease, box-shadow 0.25s ease, background 0.25s, border-color 0.25s",
          boxShadow: hovered
            ? "0 28px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,110,0.15)"
            : "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        {p.highlight && (
          <div style={{
            position: "absolute", top: "1rem", right: "1rem", zIndex: 2,
            background: C.accent, color: "#080a0e",
            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
            padding: "0.22rem 0.65rem", borderRadius: "100px",
          }}>
            KEY DATA
          </div>
        )}

        {/* image */}
        <div style={{ height: "210px", overflow: "hidden", background: C.surface2, position: "relative" }}>
          <img
            src={p.image}
            alt={p.imageAlt}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              filter: "brightness(0.68)",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
          {/* gradient */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "60%",
            background: "linear-gradient(to top, rgba(11,13,18,0.8), transparent)",
          }}/>
          {/* org badge */}
          <div style={{
            position: "absolute", bottom: "0.85rem", left: "1rem",
            background: "rgba(11,13,18,0.75)", backdropFilter: "blur(8px)",
            border: `1px solid ${C.glassBorder}`, borderRadius: "100px",
            padding: "0.25rem 0.75rem",
            fontSize: "0.72rem", color: C.muted, letterSpacing: "0.05em",
          }}>
            {p.org}
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "1.75rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="font-mono-data" style={{ color: C.accent, fontSize: "0.65rem", letterSpacing: "0.14em", marginBottom: "0.4rem" }}>
            {p.id}
          </div>
          <h3 className="font-display" style={{ fontSize: "1.2rem", color: C.cream, margin: "0 0 0.3rem", lineHeight: 1.3 }}>
            {p.title}
          </h3>
          <div style={{ color: C.muted, fontSize: "0.78rem", marginBottom: "1rem" }}>{p.role}</div>
          <p style={{ color: C.muted, fontSize: "0.88rem", lineHeight: 1.72, margin: "0 0 1.25rem", flex: 1 }}>
            {p.desc}
          </p>

          {/* outcome */}
          <div style={{
            background: C.accentDim,
            border: `1px solid rgba(201,169,110,0.18)`,
            borderRadius: "12px",
            padding: "0.85rem 1rem",
            marginBottom: "1.25rem",
          }}>
            <div style={{ fontSize: "0.65rem", color: C.accent, letterSpacing: "0.1em", marginBottom: "0.3rem", fontWeight: 600 }}>
              OUTCOME
            </div>
            <p style={{ color: C.cream, fontSize: "0.84rem", margin: 0, lineHeight: 1.55 }}>
              {p.result}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {p.tags.map(t => <SkillPill key={t} label={t} />)}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Projects() {
  return (
    <section id="projects" className="light-section" style={{ padding: "110px 0", background: C.bg }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <Reveal>
          <SectionHeading
            tag="// case studies"
            title="Selected Projects"
            subtitle="From research formulations to industrial processing support — food engineering in practice."
          />
        </Reveal>

        <div
          className="projects-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.id} p={p} delay={i * 80} />
          ))}
        </div>

        {/* industry exposure */}
        <Reveal delay={200}>
          <div
            style={{
              marginTop: "3.5rem",
              background: C.glass,
              border: `1px solid ${C.glassBorder}`,
              borderRadius: "24px",
              padding: "2.5rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2.5rem",
            }}
            className="two-col"
          >
            <div>
              <Tag>// industry exposure</Tag>
              <h3 className="font-display" style={{ fontSize: "1.5rem", color: C.cream, margin: "0.7rem 0 1rem" }}>
                Practical Industry Experience
              </h3>
              <p style={{ color: C.muted, fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>
                Hands-on exposure in food manufacturing environments, supporting production operations and seeing how engineering principles apply on the factory floor.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", justifyContent: "center" }}>
              {[
                { org: "Mongan Foods", items: ["Groundnut oil production", "Dark and milk chocolate production"] },
                { org: "Leelou", items: ["Food production and processing", "Shelf-life extension work on purees"] },
              ].map(e => (
                <div key={e.org}>
                  <div style={{ color: C.accent, fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
                    {e.org}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                    {e.items.map(it => (
                      <li key={it} style={{ color: C.muted, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── expertise ──────────────────────────────────────────── */
const expertise = [
  {
    category: "Food & Process Engineering",
    color: "#c9a96e",
    skills: ["Food Processing", "Product Formulation", "Process Optimisation", "Product Development", "Food Manufacturing Ops", "Shelf-Life Improvement"],
  },
  {
    category: "Quality & Food Safety",
    color: "#6eb5c9",
    skills: ["Quality Assurance (QA)", "Quality Control (QC)", "HACCP Principles", "Good Manufacturing Practices", "Food Safety", "Production Monitoring"],
  },
  {
    category: "Research & Analysis",
    color: "#9e6ec9",
    skills: ["Laboratory Analysis", "Experimental Design", "Sensory Evaluation", "Statistical Analysis (Minitab)", "Technical Documentation", "Functional Property Eval."],
  },
];

function Expertise() {
  return (
    <section id="expertise" className="light-section" style={{ background: C.surface, padding: "110px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <Reveal>
          <SectionHeading
            tag="// capabilities"
            title="Technical Expertise"
            subtitle="Organised by domain — engineering, quality, and research."
          />
        </Reveal>

        <div
          className="three-col"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}
        >
          {expertise.map((cat, ci) => (
            <Reveal key={cat.category} delay={ci * 100}>
              <div
                className="glow-on-hover"
                style={{
                  background: C.glass,
                  border: `1px solid ${C.glassBorder}`,
                  borderRadius: "20px",
                  padding: "2rem",
                  height: "100%",
                  transition: "background 0.25s, transform 0.25s, box-shadow 0.25s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.background = C.surface2; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.background = C.glass; }}
              >
                <div style={{
                  width: "36px", height: "3px", borderRadius: "2px",
                  background: cat.color, marginBottom: "1.25rem",
                }}/>
                <h3 style={{
                  color: cat.color, fontSize: "0.8rem", letterSpacing: "0.08em",
                  fontWeight: 600, margin: "0 0 1.25rem", textTransform: "uppercase",
                }}>
                  {cat.category}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {cat.skills.map(skill => (
                    <div key={skill} style={{ display: "flex", alignItems: "center", gap: "0.65rem", color: C.cream, fontSize: "0.9rem" }}>
                      <span style={{ color: cat.color, fontSize: "0.45rem" }}>◆</span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── why me ─────────────────────────────────────────────── */
const reasons = [
  { num: "01", title: "Engineering-Based Thinking", desc: "I approach food development as a process engineering problem — systematic, measurable, reproducible." },
  { num: "02", title: "Practical Processing Experience", desc: "My work spans lab-scale formulation and factory-floor monitoring — I know what works beyond paper." },
  { num: "03", title: "Quality & Safety Awareness", desc: "HACCP and GMP shape how I evaluate risk and design processes from the very start." },
  { num: "04", title: "Research & Analytical Mindset", desc: "Experimental design, proximate analysis, and Minitab-based statistics. Evidence drives decisions." },
  { num: "05", title: "Clear Technical Communication", desc: "I translate engineering findings into documentation that non-specialist stakeholders can act on." },
  { num: "06", title: "Full Product Life Cycle Interest", desc: "From ingredient sourcing to shelf stability — broad curiosity makes my work more thorough." },
];

function WhyMe() {
  return (
    <section id="about" className="light-section" style={{ background: C.bg, padding: "110px 0", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "-12rem", right: "-12rem", width: "550px", height: "550px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "5rem", alignItems: "start" }}>
          <Reveal>
            <div>
              <SectionHeading tag="// why me" title="Why Work With Me" />
              <p style={{ color: C.muted, fontSize: "0.9375rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                I hold an MEng in Biotechnology and Food Process Engineering and have practical exposure in food manufacturing in Cameroon. Available remotely and willing to relocate for the right opportunity.
              </p>
              <a href="#contact" className="btn-primary" style={{ textDecoration: "none" }}>
                Get in Touch
              </a>
            </div>
          </Reveal>

          <div
            className="why-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          >
            {reasons.map((r, i) => (
              <Reveal key={r.num} delay={i * 70}>
                <div
                  style={{
                    background: C.glass,
                    border: `1px solid ${C.glassBorder}`,
                    borderRadius: "18px",
                    padding: "1.6rem",
                    transition: "background 0.22s, transform 0.22s, border-color 0.22s",
                    height: "100%",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = C.surface2;
                    el.style.transform = "translateY(-4px)";
                    el.style.borderColor = "rgba(201,169,110,0.25)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = C.glass;
                    el.style.transform = "";
                    el.style.borderColor = C.glassBorder;
                  }}
                >
                  <div className="font-mono-data" style={{ color: C.accent, fontSize: "0.65rem", letterSpacing: "0.14em", marginBottom: "0.5rem" }}>
                    {r.num}
                  </div>
                  <h4 style={{ color: C.cream, fontWeight: 600, margin: "0 0 0.45rem", fontSize: "0.9375rem" }}>
                    {r.title}
                  </h4>
                  <p style={{ color: C.muted, fontSize: "0.85rem", margin: 0, lineHeight: 1.65 }}>
                    {r.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── cta banner ─────────────────────────────────────────── */
function CtaBanner() {
  return (
    <section className="light-section cta-light" style={{
      padding: "100px 2rem",
      background: `linear-gradient(135deg, rgba(201,169,110,0.06) 0%, rgba(11,13,18,0) 60%)`,
      borderTop: `1px solid ${C.glassBorder}`,
      borderBottom: `1px solid ${C.glassBorder}`,
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* decorative ring */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "700px", height: "700px", borderRadius: "50%",
        border: "1px solid rgba(201,169,110,0.06)",
        pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "400px", height: "400px", borderRadius: "50%",
        border: "1px solid rgba(201,169,110,0.09)",
        pointerEvents: "none",
      }}/>

      <Reveal>
        <Tag>// let's work together</Tag>
        <h2 className="font-display" style={{
          fontSize: "clamp(2rem, 4.5vw, 3.25rem)", color: C.cream,
          margin: "1rem auto 1.25rem", maxWidth: "22ch", lineHeight: 1.2,
        }}>
          Have a Food Product, Process, or Quality Challenge?
        </h2>
        <p style={{ color: C.muted, maxWidth: "50ch", margin: "0 auto 2.5rem", fontSize: "1.0625rem" }}>
          Whether you are developing a new product, optimising a process, or improving shelf life — let's work through it systematically.
        </p>
        <a href="#contact" className="btn-primary" style={{ fontSize: "1rem", padding: "0.95rem 2.25rem" }}>
          Let's Work Together →
        </a>
      </Reveal>
    </section>
  );
}

/* ─── contact ────────────────────────────────────────────── */
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, website: data.get("website") }) });
      if (!response.ok) throw new Error("Submission failed");
      setForm({ name: "", email: "", message: "" }); setStatus("sent");
    } catch { setStatus("error"); }
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: C.glass,
    border: `1px solid ${C.glassBorder}`,
    color: C.cream,
    padding: "0.9rem 1.1rem",
    fontSize: "0.9375rem",
    borderRadius: "12px",
    fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <section id="contact" className="light-section" style={{ background: C.bg, padding: "110px 0" }}>
      <div
        className="two-col"
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }}
      >
        <Reveal>
          <SectionHeading
            tag="// contact"
            title="Get in Touch"
            subtitle="Open to freelance projects, remote consulting, and full-time opportunities."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {[
              { label: "Email", value: "alphonseafanyu8@gmail.com", href: "mailto:alphonseafanyu8@gmail.com" },
              { label: "Phone", value: "+237 653 367 464", href: "tel:+237653367464" },
              { label: "Location", value: "Bamenda, Cameroon — remote & relocatable", href: null },
              { label: "LinkedIn", value: "linkedin.com/in/afanyualphonse", href: "https://www.linkedin.com/in/afanyualphonse" },
              { label: "Upwork", value: "View Upwork Profile →", href: "https://www.upwork.com/freelancers/~016ee7dd377a843ad7?companyReference=2067365472542990758&mp_source=share" },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", gap: "1rem", alignItems: "flex-start",
                borderBottom: `1px solid ${C.glassBorder}`, paddingBottom: "1.1rem",
              }}>
                <div className="font-mono-data" style={{ color: C.accent, fontSize: "0.72rem", letterSpacing: "0.08em", minWidth: "68px", paddingTop: "0.1rem" }}>
                  {item.label}
                </div>
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    style={{ color: C.cream, fontSize: "0.9375rem", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.cream)}
                  >
                    {item.value}
                  </a>
                ) : (
                  <span style={{ color: C.cream, fontSize: "0.9375rem" }}>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div style={{
            background: C.glass,
            border: `1px solid ${C.glassBorder}`,
            borderRadius: "24px",
            padding: "2.5rem",
          }}>
            {status === "sent" ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "2.5rem", color: C.accent, marginBottom: "1rem" }}>✓</div>
                <h3 className="font-display" style={{ color: C.cream, fontSize: "1.5rem" }}>Enquiry received</h3>
                <p style={{ color: C.muted }}>Thank you. Alphonse will reply using the email you supplied.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <h3 className="font-display" style={{ color: C.cream, fontSize: "1.375rem", margin: "0 0 0.5rem" }}>
                  Send a Message
                </h3>
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="honeypot" />
                {(["name", "email"] as const).map(field => (
                  <label key={field} style={{ display: "flex", flexDirection: "column", gap: "0.45rem", color: C.muted, fontSize: "0.78rem" }}>
                    {field === "name" ? "Your name" : "Your email"}
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    autoComplete={field === "email" ? "email" : "name"}
                    required
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    style={inputBase}
                    onFocus={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accentDim}`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = C.glassBorder; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  </label>
                ))}
                <label style={{ display: "flex", flexDirection: "column", gap: "0.45rem", color: C.muted, fontSize: "0.78rem" }}>
                  Project or enquiry
                <textarea
                  name="message"
                  required rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ ...inputBase, resize: "vertical" }}
                  onFocus={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accentDim}`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = C.glassBorder; e.currentTarget.style.boxShadow = "none"; }}
                />
                </label>
                {status === "error" && <p role="alert" style={{ color: "#ff9b9b", fontSize: ".85rem", margin: 0 }}>Delivery failed. Please use email or WhatsApp instead.</p>}
                <button type="submit" disabled={status === "sending"} className="btn-primary" style={{ alignSelf: "flex-start" }}>
                  {status === "sending" ? "Sending…" : "Send Enquiry →"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="light-footer" style={{
      background: C.surface,
      borderTop: `1px solid ${C.glassBorder}`,
      padding: "2rem",
      textAlign: "center",
    }}>
      <p style={{ color: C.muted, fontSize: "0.8125rem", margin: 0 }}>
        © {new Date().getFullYear()} Alphonse Afanyu · Food Process Engineer · Bamenda, Cameroon
      </p>
    </footer>
  );
}

/* ─── root ───────────────────────────────────────────────── */
export default function App() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <GlobalStyles />
      <Nav />
      <Hero />
      <FreeAssessment />
      <Services />
      <Projects />
      <Expertise />
      <WhyMe />
      <CtaBanner />
      <Contact />
      <Footer />
    </div>
  );
}
