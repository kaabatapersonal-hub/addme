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
      {/* Phone frame — matches the actual public card design */}
      <div style={{
        width: 195, height: 330,
        borderRadius: 32, overflow: "hidden",
        position: "relative",
        boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1.5px rgba(255,255,255,0.18)",
      }}>
        {/* Simulated full-screen photo background */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, #2d1b69 0%, #7c3aed 45%, #db2777 85%, #f97316 100%)",
        }} />
        {/* Cinematic gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.85) 85%)",
        }} />
        {/* Avatar in upper half */}
        <div style={{
          position: "absolute", top: "30%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 60, height: 60, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          border: "2.5px solid rgba(255,255,255,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
        }}>
          🤳
        </div>
        {/* Content pinned to bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 14px 14px" }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 3, lineHeight: 1.2 }}>
            ItzIncredibleSimo 😎
          </p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, lineHeight: 1.5, marginBottom: 12 }}>
            Online but mentally unavailable 😂
          </p>
          <div style={{
            background: "#25D366", borderRadius: 11, padding: "10px 0",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: "0 3px 14px rgba(37,211,102,0.45)",
          }}>
            <WAIcon size={12} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>Add me on WhatsApp</span>
          </div>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 8, marginTop: 7, letterSpacing: "0.12em" }}>
            ADDME.APP
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Fill in your details",
    desc: "Name, photo, bio, phone number. Takes 30 seconds.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Share your card",
    desc: "Post on your WhatsApp status or send the link to friends.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "People add you",
    desc: "They tap your link and add you instantly. No friction.",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
];

function RecentCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    supabase
      .from("cards")
      .select("username, name, bio, image_url, image_position, type, phone, group_link")
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
            className="rounded-2xl overflow-hidden"
            style={{
              position: "relative",
              aspectRatio: "3/4",
              background: card.image_url
                ? "#0a0a0a"
                : "linear-gradient(160deg, #1a0533 0%, #6D28D9 55%, #EC4899 100%)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
            }}
          >
            {card.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.image_url} alt={card.name}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: card.image_position || "center" }} />
            )}
            {!card.image_url && (
              <div style={{
                position: "absolute", top: "28%", left: "50%", transform: "translate(-50%,-50%)",
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700, color: "#fff",
              }}>{initial}</div>
            )}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.92) 100%)",
            }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 9px 9px" }}>
              <a href={`/${card.username}`} style={{ textDecoration: "none", display: "block", marginBottom: 7 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 12, lineHeight: 1.3, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</p>
                {card.bio && <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{card.bio}</p>}
              </a>
              {waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#25D366", color: "#fff", borderRadius: 9, padding: "8px 0", fontWeight: 700, fontSize: 11, textDecoration: "none", boxShadow: "0 2px 10px rgba(37,211,102,0.4)" }}>
                  <svg width="11" height="11" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {isGroup ? "Join" : "Add on WhatsApp"}
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FeaturedBusiness({ card }) {
  const isGroup = card.type === "group";
  const waHref = isGroup
    ? card.group_link
    : `https://wa.me/${(card.phone || "").replace(/[\s\-\(\)\+\.]/g, "").replace(/^0/, "233")}`;

  return (
    <ScrollFadeUp>
      <div className="px-5 pb-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#EC4899" }}>
            ⚡ Promoted
          </p>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(236,72,153,0.1)", color: "#EC4899", border: "1px solid rgba(236,72,153,0.2)" }}>
            Sponsored
          </span>
        </div>
        <a href={`/${card.username}`} style={{ display: "block", textDecoration: "none", borderRadius: 20, overflow: "hidden", position: "relative", height: 170, boxShadow: "0 8px 32px rgba(236,72,153,0.18)" }}>
          {/* Background */}
          <div style={{
            position: "absolute", inset: 0,
            background: card.image_url ? "#0a0a0a" : "linear-gradient(135deg, #1a0533, #7c3aed, #EC4899)",
          }}>
            {card.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.image_url} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: card.image_position || "center" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 100%)" }} />
          </div>
          {/* Content */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 16px 16px" }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 3, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{card.name}</p>
            {card.bio && <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{card.bio}</p>}
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", borderRadius: 10, padding: "7px 14px", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                <svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {isGroup ? "Join Group" : "Add on WhatsApp"}
              </a>
            )}
          </div>
        </a>
      </div>
    </ScrollFadeUp>
  );
}

export default function HomePage() {
  const [cardCount, setCardCount] = useState(null);
  const [fromCard, setFromCard] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [promotedCard, setPromotedCard] = useState(null);

  useEffect(() => {
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => { if (count) setCardCount(count); });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "card") {
      setFromCard(true);
      setCreatorName(params.get("creator") || "");
    }
  }, []);

  useEffect(() => {
    supabase
      .from("cards")
      .select("username, name, bio, image_url, image_position, type, phone, group_link")
      .eq("is_promoted", true)
      .gt("promoted_until", new Date().toISOString())
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPromotedCard(data || null));
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

              {/* Contextual banner when arriving from someone's card */}
              {fromCard && (
                <div className="text-center mb-1 px-2">
                  <p className="text-[14px] font-semibold" style={{ color: "#fff" }}>
                    {creatorName ? `Want a card like ${creatorName}'s?` : "Want one like that?"}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Pick the option that suits you 👇
                  </p>
                </div>
              )}

              {/* Option A — full card */}
              <div>
                <Link href="/create"
                  className="w-full flex flex-col items-center justify-center rounded-2xl transition-all duration-200 active:scale-[0.97]"
                  style={{ background: "#fff", color: "#7C3AED", padding: "15px 0 13px", boxShadow: "0 4px 24px rgba(255,255,255,0.25)" }}>
                  <span className="font-bold text-[16px]">✨ Create my AddMe card</span>
                  <span className="text-[11px] mt-0.5" style={{ color: "#9D174D", opacity: 0.75 }}>
                    Photo · bio · shareable profile link
                  </span>
                </Link>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 px-1">
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.38)" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
              </div>

              {/* Option B — quick link */}
              <div>
                <Link href="/generate"
                  className="w-full flex flex-col items-center justify-center rounded-2xl transition-all duration-200 active:scale-[0.97]"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.18)", color: "#fff", padding: "14px 0 12px" }}>
                  <span className="font-semibold text-[15px]">⚡ Just get my WhatsApp link</span>
                  <span className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Instant wa.me link — no photo or bio needed
                  </span>
                </Link>
              </div>

              <Link href="/find"
                className="flex items-center justify-center gap-1.5 text-sm font-medium transition-opacity active:opacity-60 mt-1"
                style={{ color: "rgba(255,255,255,0.55)" }}>
                🔍 Already have a card? Find it →
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* Fade to page background */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: 60, background: "linear-gradient(to bottom, transparent, var(--bg-page))" }} />
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
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.18)", color: "#EC4899" }}>
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
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: cardCount ? `${cardCount}+` : "—", label: "Cards created" },
              { value: "Free", label: "Always & forever" },
              { value: "None", label: "Signup needed" },
            ].map((s) => (
              <div key={s.label} className="text-center py-6 px-2 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="font-heading font-bold" style={{ fontSize: "1.55rem", lineHeight: 1.1, color: "var(--fg)" }}>
                  {s.value}
                </p>
                <p className="text-[11px] mt-2 leading-snug" style={{ color: "var(--fg-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollFadeUp>
      </section>

      {/* ── Promoted business ────────────────────────────────── */}
      {promotedCard && <FeaturedBusiness card={promotedCard} />}

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
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.75)" }}>
              Free forever. No account. No waiting.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/create"
                className="flex flex-col items-center font-bold px-8 py-4 rounded-2xl text-[15px] transition-all duration-200 active:scale-[0.97]"
                style={{ background: "rgba(255,255,255,0.22)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)" }}>
                <span>✨ Create my AddMe card</span>
                <span className="text-[11px] font-normal mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Photo · bio · shareable link</span>
              </Link>
              <Link href="/generate"
                className="flex flex-col items-center font-semibold px-8 py-3.5 rounded-2xl text-[14px] transition-all duration-200 active:scale-[0.97]"
                style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span>⚡ Just get my WhatsApp link</span>
                <span className="text-[11px] font-normal mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Instant · no photo needed</span>
              </Link>
            </div>
          </div>
        </ScrollFadeUp>
      </section>

      <footer className="text-center py-8 text-xs" style={{ color: "var(--fg-dim)", letterSpacing: "0.05em" }}>
        © AddMe · Made with SimoForge ⚡
      </footer>
    </main>
  );
}
