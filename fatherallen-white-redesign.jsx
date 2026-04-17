import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ──────────────────────────────────────────────
// DESIGN_VARIANCE: 5  (clean editorial, not sterile)
// MOTION_INTENSITY: 3 (restrained — hover + subtle scroll reveal)
// VISUAL_DENSITY: 3   (spacious, breathable, luxury)

const tokens = {
  // Ground
  white:       "#FFFFFF",
  offWhite:    "#F8F7F5",   // warm section wash

  // Text
  ink:         "#111111",
  subtext:     "#5A5A5A",
  muted:       "#9A9A9A",

  // Jewel Accents
  sapphire:    "#1B50D8",   // primary — truth, intellect
  emerald:     "#0A7A55",   // secondary — creation, growth
  ruby:        "#B91C49",   // tertiary — sacrifice, love
  amethyst:    "#6D28D9",   // quaternary — contemplation

  // Borders / Structure
  border:      "#E4E4E4",
  borderFaint: "#F0F0F0",

  // Typography
  fontDisplay: "'Cinzel', serif",
  fontBody:    "'Cormorant Garamond', serif",
  fontUI:      "'DM Sans', sans-serif",
};

// ─── GLOBAL STYLES ──────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${tokens.white};
      color: ${tokens.ink};
      font-family: ${tokens.fontBody};
      -webkit-font-smoothing: antialiased;
    }

    .fade-up {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }

    a { text-decoration: none; color: inherit; }

    ::selection {
      background: ${tokens.sapphire};
      color: white;
    }
  `}</style>
);

// ─── HOOKS ──────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── COMPONENTS ─────────────────────────────────────────────────

function Nav({ scrolled }) {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,0.97)" : "white",
      borderBottom: `1px solid ${scrolled ? tokens.border : "transparent"}`,
      transition: "all 0.3s ease",
      backdropFilter: scrolled ? "blur(12px)" : "none",
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto",
        padding: "0 32px",
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Wordmark */}
        <a href="#" style={{
          fontFamily: tokens.fontDisplay,
          fontSize: 17,
          letterSpacing: "0.12em",
          color: tokens.ink,
          fontWeight: 400,
        }}>
          FATHER ALLEN
        </a>

        {/* Desktop Nav */}
        <div style={{
          display: "flex", gap: 36,
          fontFamily: tokens.fontUI, fontSize: 13,
          letterSpacing: "0.06em", fontWeight: 400,
          color: tokens.subtext,
        }}>
          {["Writing", "Homilies", "About", "Contact"].map(item => (
            <NavLink key={item} label={item} />
          ))}
        </div>

        {/* CTA */}
        <a href="#subscribe" style={{
          fontFamily: tokens.fontUI, fontSize: 12,
          letterSpacing: "0.1em", fontWeight: 500,
          color: tokens.sapphire,
          border: `1px solid ${tokens.sapphire}`,
          padding: "8px 20px",
          transition: "all 0.2s ease",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = tokens.sapphire;
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = tokens.sapphire;
          }}
        >
          SUBSCRIBE
        </a>
      </div>
    </nav>
  );
}

function NavLink({ label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      style={{
        color: hovered ? tokens.ink : tokens.subtext,
        transition: "color 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <span style={{
        position: "absolute", bottom: -2, left: 0,
        height: 1,
        background: tokens.sapphire,
        width: hovered ? "100%" : "0%",
        transition: "width 0.25s ease",
        display: "block",
      }} />
    </a>
  );
}

function Hero() {
  const ref = useScrollReveal();
  return (
    <section style={{
      paddingTop: 148,
      paddingBottom: 96,
      maxWidth: 1160, margin: "0 auto",
      padding: "148px 32px 96px",
    }}>
      {/* Eyebrow */}
      <div className="fade-up visible" style={{
        display: "flex", alignItems: "center", gap: 14,
        marginBottom: 36,
      }}>
        <span style={{
          display: "inline-block", width: 32, height: 2,
          background: tokens.sapphire,
        }} />
        <span style={{
          fontFamily: tokens.fontUI, fontSize: 11,
          letterSpacing: "0.18em", color: tokens.sapphire,
          fontWeight: 500, textTransform: "uppercase",
        }}>
          Scripture · Creativity · The Life of Faith
        </span>
      </div>

      {/* Main Heading */}
      <div ref={ref} className="fade-up" style={{ maxWidth: 760 }}>
        <h1 style={{
          fontFamily: tokens.fontBody,
          fontWeight: 300,
          fontSize: "clamp(42px, 6vw, 76px)",
          lineHeight: 1.1,
          color: tokens.ink,
          letterSpacing: "-0.01em",
          marginBottom: 32,
        }}>
          Writing at the intersection of{" "}
          <em style={{ fontStyle: "italic", color: tokens.sapphire }}>
            Sacred Scripture
          </em>{" "}
          and the fullness of human life.
        </h1>

        <p style={{
          fontFamily: tokens.fontBody,
          fontSize: 20,
          fontWeight: 300,
          color: tokens.subtext,
          lineHeight: 1.75,
          maxWidth: 580,
          marginBottom: 48,
        }}>
          Father Kenneth Allen is a Catholic priest, spiritual director, and writer
          exploring the mandate for creativity, prosperity, and the vocation of the human person — rooted in Scripture.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <PrimaryButton label="Read the Latest" color={tokens.sapphire} />
          <GhostLink label="About Father Allen →" />
        </div>
      </div>

      {/* Decorative rule */}
      <div style={{
        marginTop: 80,
        height: 1,
        background: `linear-gradient(to right, ${tokens.sapphire}, ${tokens.emerald}, transparent)`,
        opacity: 0.3,
      }} />
    </section>
  );
}

function PrimaryButton({ label, color }) {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: tokens.fontUI, fontSize: 13, letterSpacing: "0.08em",
        fontWeight: 500, color: h ? "white" : color,
        background: h ? color : "transparent",
        border: `1.5px solid ${color}`,
        padding: "14px 28px",
        cursor: "pointer",
        transition: "all 0.22s ease",
      }}
    >
      {label}
    </button>
  );
}

function GhostLink({ label }) {
  const [h, setH] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: tokens.fontUI, fontSize: 13, letterSpacing: "0.06em",
        color: h ? tokens.ink : tokens.subtext,
        transition: "color 0.2s ease",
      }}
    >
      {label}
    </a>
  );
}

// ─── FEATURED WRITINGS ─────────────────────────────────────────

const posts = [
  {
    tag: "Homily",
    tagColor: tokens.sapphire,
    date: "April 13, 2025",
    title: "The Prodigal and the Prosperity We Fear",
    excerpt: "The parable does not end with repentance. It ends with a feast — and a brother who cannot enter it. What we make of abundance reveals more than what we make of poverty.",
    readTime: "8 min",
  },
  {
    tag: "Essay",
    tagColor: tokens.emerald,
    date: "March 30, 2025",
    title: "Imago Dei and the Vocation to Create",
    excerpt: "Genesis does not present God as a being who merely governs. He creates — and then, immediately, invites the human person into the same act. Creativity is not a hobby. It is a mandate.",
    readTime: "12 min",
  },
  {
    tag: "Reflection",
    tagColor: tokens.ruby,
    date: "March 16, 2025",
    title: "On the Use of Artificial Intelligence",
    excerpt: "Every new tool reshapes the conditions of thought. The question is not whether the Church will engage with AI, but whether that engagement will be formed by the Gospel.",
    readTime: "6 min",
  },
];
function PostCard({ post, delay }) {
  const ref = useScrollReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="fade-up"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <a
        href="#"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block",
          background: hovered ? tokens.white : tokens.white,
          border: `1px solid ${hovered ? post.tagColor : tokens.border}`,
          padding: "36px 32px",
          transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          boxShadow: hovered ? "0 4px 24px rgba(0,0,0,0.07)" : "none",
          height: "100%",
        }}
      >
        {/* Tag + Date */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <span style={{
            fontFamily: tokens.fontUI, fontSize: 10,
            letterSpacing: "0.14em", fontWeight: 500,
            color: post.tagColor, textTransform: "uppercase",
          }}>
            {post.tag}
          </span>
          <span style={{
            fontFamily: tokens.fontUI, fontSize: 11,
            color: tokens.muted,
          }}>
            {post.date}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: tokens.fontBody,
          fontWeight: 500,
          fontSize: 22,
          lineHeight: 1.3,
          color: tokens.ink,
          marginBottom: 14,
          letterSpacing: "-0.01em",
        }}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p style={{
          fontFamily: tokens.fontBody,
          fontSize: 16,
          fontWeight: 300,
          color: tokens.subtext,
          lineHeight: 1.7,
          marginBottom: 28,
        }}>
          {post.excerpt}
        </p>

        {/* Read time */}
        <span style={{
          fontFamily: tokens.fontUI, fontSize: 11,
          color: tokens.muted, letterSpacing: "0.06em",
        }}>
          {post.readTime} read
        </span>

        {/* Bottom accent line */}
        <div style={{
          marginTop: 20,
          height: 2,
          background: post.tagColor,
          width: hovered ? "100%" : "0%",
          transition: "width 0.3s ease",
        }} />
      </a>
    </div>
  );
}

// ─── ABOUT TEASER ──────────────────────────────────────────────

function AboutTeaser() {
  const ref = useScrollReveal();
  return (
    <section style={{ padding: "96px 32px" }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}>
        {/* Left: text */}
        <div ref={ref} className="fade-up">
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: 28,
          }}>
            <span style={{ width: 24, height: 2, background: tokens.amethyst, display: "block" }} />
            <span style={{
              fontFamily: tokens.fontUI, fontSize: 11,
              letterSpacing: "0.16em", color: tokens.amethyst,
              fontWeight: 500, textTransform: "uppercase",
            }}>
              About
            </span>
          </div>

          <h2 style={{
            fontFamily: tokens.fontBody,
            fontWeight: 300,
            fontSize: "clamp(30px, 4vw, 46px)",
            lineHeight: 1.2,
            color: tokens.ink,
            marginBottom: 24,
            letterSpacing: "-0.01em",
          }}>
            A priest writing from within the tradition — toward what's possible.
          </h2>

          <p style={{
            fontFamily: tokens.fontBody,
            fontSize: 18,
            fontWeight: 300,
            color: tokens.subtext,
            lineHeight: 1.8,
            marginBottom: 36,
          }}>
            Father Kenneth Allen is a Roman Catholic priest whose work explores the scriptural grounding
            for creativity, prosperity, and the human vocation. He writes for those who take both faith
            seriously and who sense that the world - and the economhy - is changing daily.
          </p>

          <GhostLink label="More coming soon →" />
        </div>

        {/* Right: decorative panel */}
        <div style={{
          background: tokens.offWhite,
          border: `1px solid ${tokens.border}`,
          padding: "48px 40px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Jewel bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(to right, ${tokens.sapphire}, ${tokens.emerald}, ${tokens.amethyst})`,
          }} />

          <blockquote style={{
            fontFamily: tokens.fontBody,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 22,
            lineHeight: 1.65,
            color: tokens.ink,
            marginBottom: 28,
          }}>
            "In the beginning, God created."
          </blockquote>

          <p style={{
            fontFamily: tokens.fontBody,
            fontSize: 16,
            fontWeight: 300,
            color: tokens.subtext,
            lineHeight: 1.7,
            marginBottom: 16,
          }}>
            The first words of Scripture do not describe God's authority. They describe
            his creativity. The human person, made in his image and likeness, inherits the same impulse —
            and is called to joins in that ongoing creative activity.
          </p>

          <span style={{
            fontFamily: tokens.fontUI, fontSize: 11,
            letterSpacing: "0.1em", color: tokens.muted,
          }}>
            Genesis 1:1 — "In the beginning God created the heavens and the earth.""
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── SUBSCRIBE ─────────────────────────────────────────────────

function SubscribeSection() {
  const ref = useScrollReveal();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="subscribe" style={{
      background: tokens.ink,
      padding: "88px 32px",
    }}>
      <div ref={ref} className="fade-up" style={{
        maxWidth: 620, margin: "0 auto",
        textAlign: "center",
      }}>
        {/* Jewel accent */}
        <div style={{
          display: "flex", justifyContent: "center",
          alignItems: "center", gap: 10, marginBottom: 32,
        }}>
          {[tokens.sapphire, tokens.emerald, tokens.ruby, tokens.amethyst].map((c, i) => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: "50%", background: c,
            }} />
          ))}
        </div>

        <h2 style={{
          fontFamily: tokens.fontBody,
          fontWeight: 300,
          fontSize: "clamp(28px, 4vw, 42px)",
          color: "white",
          lineHeight: 1.2,
          marginBottom: 16,
          letterSpacing: "-0.01em",
        }}>
          Coming in May. Homilies and reflections, direct to your inbox.  
        </h2>

        <p style={{
          fontFamily: tokens.fontBody,
          fontSize: 17,
          fontWeight: 300,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.7,
          marginBottom: 40,
        }}>
          Just writing that takes faith and the human person seriously.
        </p>

        {submitted ? (
          <p style={{
            fontFamily: tokens.fontUI,
            fontSize: 14,
            color: tokens.emerald,
            letterSpacing: "0.06em",
          }}>
            ✓ You're on the list.
          </p>
        ) : (
          <div style={{ display: "flex", gap: 0, maxWidth: 440, margin: "0 auto" }}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1,
                fontFamily: tokens.fontUI, fontSize: 14,
                padding: "14px 20px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRight: "none",
                color: "white",
                outline: "none",
                letterSpacing: "0.04em",
              }}
            />
            <button
              onClick={() => email && setSubmitted(true)}
              style={{
                fontFamily: tokens.fontUI, fontSize: 12,
                letterSpacing: "0.1em", fontWeight: 500,
                background: tokens.sapphire,
                color: "white",
                border: "none",
                padding: "14px 24px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1440B8"}
              onMouseLeave={e => e.currentTarget.style.background = tokens.sapphire}
            >
              SUBSCRIBE
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${tokens.border}`,
      padding: "48px 32px",
      background: tokens.white,
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 24,
      }}>
        <span style={{
          fontFamily: tokens.fontDisplay,
          fontSize: 14,
          letterSpacing: "0.12em",
          color: tokens.ink,
        }}>
          FATHER ALLEN
        </span>

        <div style={{
          display: "flex", gap: 32,
          fontFamily: tokens.fontUI, fontSize: 12,
          letterSpacing: "0.06em", color: tokens.muted,
        }}>
          {["Writing", "Homilies", "About", "Contact", "fatherallen.ai"].map(l => (
            <a key={l} href="#" style={{ color: tokens.muted, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = tokens.sapphire}
              onMouseLeave={e => e.currentTarget.style.color = tokens.muted}
            >
              {l}
            </a>
          ))}
        </div>

        <span style={{
          fontFamily: tokens.fontUI, fontSize: 11,
          color: tokens.muted, letterSpacing: "0.06em",
        }}>
          © {new Date().getFullYear()} Father Kenneth Allen
        </span>
      </div>
    </footer>
  );
}

// ─── SECTION HEADER UTILITY ────────────────────────────────────

function SectionHeader({ eyebrow, title, eyebrowColor }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="fade-up">
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        marginBottom: 16,
      }}>
        <span style={{ width: 24, height: 2, background: eyebrowColor, display: "block" }} />
        <span style={{
          fontFamily: tokens.fontUI, fontSize: 11,
          letterSpacing: "0.16em", color: eyebrowColor,
          fontWeight: 500, textTransform: "uppercase",
        }}>
          {eyebrow}
        </span>
      </div>
      <h2 style={{
        fontFamily: tokens.fontBody,
        fontWeight: 300,
        fontSize: "clamp(28px, 3.5vw, 42px)",
        color: tokens.ink,
        letterSpacing: "-0.01em",
        lineHeight: 1.2,
      }}>
        {title}
      </h2>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────

export default function FatherAllenSite() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <GlobalStyles />
      <Nav scrolled={scrolled} />
      <main>
        <Hero />
        <WritingsSection />
        <AboutTeaser />
        <SubscribeSection />
      </main>
      <Footer />
    </>
  );
}
