"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ease = [0.22, 1, 0.36, 1];

function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScrollFadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WAIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CardMockup() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-block" }}
    >
      <div style={{
        background: "rgba(255,255,255,0.14)",
        border: "1.5px solid rgba(255,255,255,0.3)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 24,
        padding: "22px 22px 18px",
        boxShadow: "0 28px 70px rgba(0,0,0,0.35)",
        width: 210,
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{
            width: 62, height: 62, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            border: "3px solid rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}>
            🤳
          </div>
        </div>
        <p style={{ textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 5 }}>
          ItzIncredibleSimo 😎
        </p>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.72)", fontSize: 11, lineHeight: 1.55, marginBottom: 16 }}>
          Online but mentally unavailable 😂
        </p>
        <div style={{
          background: "#25D366", borderRadius: 14, padding: "12px 0",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 4px 18px rgba(37,211,102,0.4)",
        }}>
          <WAIcon size={14} />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>Add me on WhatsApp</span>
        </div>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 11 }}>
          👁 247 views
        </p>
      </div>
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  { n: "01", icon: "✏️", title: "Fill in your details", desc: "Name, photo, bio, phone number. Takes 30 seconds." },
  { n: "02", icon: "📲", title: "Share your card", desc: "Post on your WhatsApp status or send the link to friends." },
  { n: "03", icon: "🎉", title: "People add you", desc: "They tap your link and add you instantly. No friction." },
];

function RecentCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    supabase
      .from("cards")
      .select("username, name, bio, image_url, type, phone, group_link")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setCards(data || []));
  }, []);

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const initial = (card.name || "?").charAt(0).toUpperCase();
        const isGroup = card.type === "group";
        const waHref = isGroup
          ? card.group_link
          : `https://wa.me/${(card.phone || "").replace(/[\s\-\(\)\+\.]/g, "").replace(/^0/, "233")}`;

        return (
          <div
            key={card.username}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
          >
            {/* Avatar / photo */}
            <div
              className="w-full flex items-center justify-center"
              style={{
                height: 90,
                background: card.image_url
                  ? "transparent"
                  : "linear-gradient(135deg, #EC4899 0%, #9d174d 100%)",
                overflow: "hidden",
              }}
            >
              {card.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image_url} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>{initial}</span>
              )}
            </div>
            {/* Info */}
            <div className="p-3 flex flex-col gap-2 flex-1">
              <p className="font-semibold text-[13px] leading-tight truncate" style={{ color: "var(--fg)" }}>
                {card.name}
              </p>
              {card.bio && (
                <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--fg-muted)" }}>
                  {card.bio}
                </p>
              )}
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold text-white transition-all active:scale-95"
                  style={{ background: "#25D366", textDecoration: "none" }}
                >
                  <svg width="12" height="12" fill="white" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {isGroup ? "Join Group" : "Add on WhatsApp"}
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [cardCount, setCardCount] = useState(null);

  useEffect(() => {
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => { if (count) setCardCount(count); });
  }, []);

  return (
    <main style={{ overflowX: "hidden" }}>

      {/* ── Hero — always gradient ─────────────────────────── */}
      <section
        className="relative flex flex-col items-center text-center px-5 pt-14 pb-16 min-h-[100dvh]"
        style={{ background: "linear-gradient(145deg, #6D28D9 0%, #9D174D 55%, #EC4899 100%)" }}
      >
        {/* Subtle noise/texture overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 70%)",
        }} />

        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">

          <FadeUp delay={0}>
            <div className="flex flex-col items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-4 py-1.5 rounded-full"
                style={{ color: "#fff", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)" }}>
                ✦ Free forever · No signup needed
              </span>
              {cardCount > 0 && (
                <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                  🔥 {cardCount.toLocaleString()} cards already created
                </p>
              )}
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 className="font-heading font-bold text-white leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: "clamp(2.1rem, 8.5vw, 3.2rem)" }}>
              Get people adding<br />
              you on WhatsApp<br />
              every single day 🚀
            </h1>
          </FadeUp>

          <FadeUp delay={0.14}>
            <p className="text-[15px] leading-relaxed mb-8 max-w-[290px]"
              style={{ color: "rgba(255,255,255,0.75)" }}>
              Create your card in seconds. Share once on status. Watch the adds come in.
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="mb-9">
              <CardMockup />
            </div>
          </FadeUp>

          <FadeUp delay={0.26}>
            <div className="w-full flex flex-col gap-3">
              <Link href="/create"
                className="w-full flex items-center justify-center gap-2.5 font-bold text-white rounded-2xl transition-all duration-200 active:scale-[0.97]"
                style={{ background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.35)", padding: "17px 0", fontSize: 16, backdropFilter: "blur(8px)" }}>
                ✨ Create my AddMe card
              </Link>

              <Link href="/generate"
                className="w-full flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-[0.97]"
                style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.18)", color: "#fff", padding: "15px 0", fontSize: 15 }}>
                ⚡ Just get my WhatsApp link
              </Link>

              <Link href="/find"
                className="flex items-center justify-center gap-1.5 text-sm font-medium transition-opacity active:opacity-60 mt-1"
                style={{ color: "rgba(255,255,255,0.55)" }}>
                🔍 Already have a card? Find it →
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none" style={{ height: 48 }}>
          <svg viewBox="0 0 1200 48" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
            <path d="M0,48 C300,0 900,0 1200,48 L1200,48 L0,48 Z" fill="var(--bg-page)" />
          </svg>
        </div>
      </section>

      {/* ── Body — themed ─────────────────────────────────────── */}
      <section className="px-5 pt-12 pb-20 max-w-lg mx-auto">
        <ScrollFadeUp className="text-center mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2.5" style={{ color: "#EC4899" }}>
            How it works
          </p>
          <h2 className="font-heading text-[1.75rem] font-bold" style={{ color: "var(--fg)" }}>
            Three steps. That's it.
          </h2>
        </ScrollFadeUp>

        <div className="flex flex-col gap-3">
          {HOW_IT_WORKS.map((step, i) => (
            <ScrollFadeUp key={step.n} delay={i * 0.07}>
              <div className="flex items-start gap-4 p-5 rounded-2xl transition-shadow"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.18)" }}>
                  {step.icon}
                </div>
                <div className="pt-0.5">
                  <span className="text-[10px] font-black tracking-[0.15em]" style={{ color: "#EC4899" }}>
                    {step.n}
                  </span>
                  <p className="font-semibold text-[15px] mt-0.5 mb-1" style={{ color: "var(--fg)" }}>{step.title}</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{step.desc}</p>
                </div>
              </div>
            </ScrollFadeUp>
          ))}
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="px-5 pb-20 max-w-lg mx-auto">
        <ScrollFadeUp>
          <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
            style={{ background: "var(--border)", border: "1px solid var(--border)" }}>
            {[
              { value: cardCount ? `${cardCount}+` : "—", label: "Cards created" },
              { value: "Free", label: "Always" },
              { value: "0", label: "Signups needed" },
            ].map((s) => (
              <div key={s.label} className="text-center py-5 px-2" style={{ background: "var(--bg-card)" }}>
                <p className="font-heading font-bold text-xl" style={{ color: "var(--fg)" }}>{s.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollFadeUp>
      </section>

      {/* ── Discover people ───────────────────────────────────── */}
      <section className="px-5 pb-20 max-w-lg mx-auto">
        <ScrollFadeUp className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "#EC4899" }}>
              Discover
            </p>
            <h2 className="font-heading text-[1.4rem] font-bold" style={{ color: "var(--fg)" }}>
              People on AddMe
            </h2>
          </div>
          <a
            href="/cards"
            className="text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "#EC4899" }}
          >
            See all →
          </a>
        </ScrollFadeUp>
        <ScrollFadeUp>
          <RecentCards />
        </ScrollFadeUp>
      </section>

      {/* ── Bottom CTA — always gradient ──────────────────────── */}
      <section className="px-5 pb-24 max-w-md mx-auto">
        <ScrollFadeUp>
          <div className="rounded-3xl p-8 text-center"
            style={{ background: "linear-gradient(145deg, #6D28D9 0%, #EC4899 100%)", boxShadow: "0 8px 40px rgba(109,40,217,0.28)" }}>
            <div className="text-5xl mb-5">🚀</div>
            <h2 className="font-heading text-[1.6rem] font-bold text-white mb-2 leading-tight">
              Ready to grow your WhatsApp?
            </h2>
            <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.75)" }}>
              Free forever. No account. No waiting.
            </p>
            <Link href="/create"
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl text-[15px] transition-all duration-200 active:scale-[0.97]"
              style={{ background: "rgba(255,255,255,0.22)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)" }}>
              Get started free →
            </Link>
          </div>
        </ScrollFadeUp>
      </section>

      <footer className="text-center py-8 text-xs" style={{ color: "var(--fg-dim)" }}>
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
