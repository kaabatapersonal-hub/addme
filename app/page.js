"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

// ─── data ────────────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Create",
    desc: "Pick a template, upload your photo, and write your bio in seconds.",
  },
  {
    number: "02",
    title: "Share",
    desc: "Download your card image and post it on your WhatsApp status.",
  },
  {
    number: "03",
    title: "Get Added",
    desc: "People tap your link from the status and add you directly. Done.",
  },
];

const exampleCards = [
  {
    name: "Zara Ahmed",
    bio: "Just vibes, art & coffee ☕ | 21 | Lagos 🇳🇬",
    initial: "Z",
    avatarGradient: "linear-gradient(135deg, #fda4cf 0%, #EC4899 50%, #9d174d 100%)",
    borderColor: "rgba(236, 72, 153, 0.45)",
    glowColor: "rgba(236, 72, 153, 0.18)",
    accentColor: "#EC4899",
    label: "Personal",
  },
  {
    name: "TasteKitchen",
    bio: "Homemade meals delivered fresh daily 🍱 Order via WhatsApp.",
    initial: "T",
    avatarGradient: "linear-gradient(135deg, #fde68a 0%, #F59E0B 50%, #92400e 100%)",
    borderColor: "rgba(245, 158, 11, 0.45)",
    glowColor: "rgba(245, 158, 11, 0.15)",
    accentColor: "#F59E0B",
    label: "Business",
  },
  {
    name: "Badminton Crew 🏸",
    bio: "Weekly games every Sat @ KLCC court. All levels welcome. Join us!",
    initial: "B",
    avatarGradient: "linear-gradient(135deg, #a5b4fc 0%, #6366F1 50%, #312e81 100%)",
    borderColor: "rgba(99, 102, 241, 0.45)",
    glowColor: "rgba(99, 102, 241, 0.15)",
    accentColor: "#6366F1",
    label: "Group",
    buttonLabel: "Join our Group",
  },
];

// ─── animation helpers ────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1];

function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScrollFadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── WhatsApp icon ────────────────────────────────────────────────────────────

function WAIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── example card component ───────────────────────────────────────────────────

function ExampleCard({ card, index }) {
  return (
    <ScrollFadeUp
      delay={index * 0.1}
      className="flex-shrink-0 w-[248px] sm:w-auto sm:flex-1"
    >
      <div
        className="relative rounded-2xl p-5 flex flex-col items-center gap-4 h-full"
        style={{
          background: "#1A1A1A",
          border: `1px solid ${card.borderColor}`,
          boxShadow: `0 0 40px ${card.glowColor}`,
        }}
      >
        {/* Template label */}
        <span
          className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            background: `${card.accentColor}18`,
            color: card.accentColor,
            border: `1px solid ${card.accentColor}30`,
          }}
        >
          {card.label}
        </span>

        {/* Avatar */}
        <div
          className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-2xl font-bold text-white select-none"
          style={{
            background: card.avatarGradient,
            boxShadow: `0 0 22px ${card.borderColor}`,
          }}
        >
          {card.initial}
        </div>

        {/* Name + bio */}
        <div className="text-center flex-1">
          <p
            className="font-heading font-bold text-base text-white leading-tight"
          >
            {card.name}
          </p>
          <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "#94A3B8" }}>
            {card.bio}
          </p>
        </div>

        {/* WhatsApp button */}
        <div
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: "#25D366" }}
        >
          <WAIcon />
          {card.buttonLabel ?? "Add on WhatsApp"}
        </div>
      </div>
    </ScrollFadeUp>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "#080808", overflowX: "hidden" }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[92vh] px-5 pt-24 pb-20">

        {/* Animated glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 560,
              height: 560,
              background:
                "radial-gradient(circle, rgba(236,72,153,0.13) 0%, transparent 68%)",
            }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 rounded-full"
            style={{
              width: 280,
              height: 280,
              background:
                "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)",
            }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />
        </div>

        <div className="relative z-10 max-w-[640px] mx-auto w-full">
          {/* Badge */}
          <FadeUp delay={0}>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full mb-6"
              style={{
                color: "#EC4899",
                background: "rgba(236,72,153,0.1)",
                border: "1px solid rgba(236,72,153,0.25)",
              }}
            >
              ✦ Free forever · No signup needed
            </span>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.1}>
            <h1
              className="font-heading text-[2.6rem] sm:text-5xl md:text-[3.5rem] font-bold text-white leading-[1.08] tracking-tight"
            >
              Create your WhatsApp card{" "}
              <span style={{ color: "#EC4899" }}>in seconds</span> ✨
            </h1>
          </FadeUp>

          {/* Subheadline */}
          <FadeUp delay={0.2}>
            <p
              className="mt-5 text-base sm:text-lg leading-relaxed max-w-[420px] mx-auto"
              style={{ color: "#94A3B8" }}
            >
              Make a beautiful add-me card with your picture and bio. Share it
              on status. Get added.
            </p>
          </FadeUp>

          {/* CTA — two paths */}
          <FadeUp delay={0.32}>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mx-auto">
              {/* Option 1 — Generate link */}
              <Link
                href="/generate"
                className="block text-left p-5 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: "#1A1A1A",
                  border: "1.5px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(236,72,153,0.3)";
                  e.currentTarget.style.background = "rgba(236,72,153,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "#1A1A1A";
                }}
              >
                <div className="text-2xl mb-2.5">⚡</div>
                <p className="font-semibold text-white text-[15px] leading-tight">
                  Generate my WhatsApp link
                </p>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#94A3B8" }}>
                  Get a ready-to-share link with your bio. Send to friends to post on their status.
                </p>
              </Link>

              {/* Option 2 — Create card */}
              <Link
                href="/create"
                className="block text-left p-5 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: "rgba(236,72,153,0.07)",
                  border: "1.5px solid rgba(236,72,153,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(236,72,153,0.6)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(236,72,153,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(236,72,153,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="text-2xl mb-2.5">✨</div>
                <p className="font-semibold text-white text-[15px] leading-tight">
                  Create my AddMe card
                </p>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#94A3B8" }}>
                  Build a beautiful card page. Share your link everywhere.
                </p>
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: "rgba(148,163,184,0.3)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="px-5 pt-10 pb-24 max-w-4xl mx-auto">
        <ScrollFadeUp className="text-center mb-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: "#EC4899" }}
          >
            How it works
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Three steps. That's it.
          </h2>
        </ScrollFadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step, i) => (
            <ScrollFadeUp key={step.number} delay={i * 0.1}>
              <div
                className="relative rounded-2xl p-6 h-full transition-colors duration-300 group"
                style={{
                  background: "#1A1A1A",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(236,72,153,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.05)";
                }}
              >
                <span
                  className="text-[10px] font-bold tracking-widest"
                  style={{ color: "rgba(236,72,153,0.55)" }}
                >
                  {step.number}
                </span>
                <h3 className="font-heading text-xl font-bold text-white mt-2">
                  {step.title}
                </h3>
                <p
                  className="text-[13px] mt-2 leading-relaxed"
                  style={{ color: "#94A3B8" }}
                >
                  {step.desc}
                </p>

                {/* connector */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden sm:block absolute top-1/2 -right-3 w-6 h-px"
                    style={{ background: "rgba(236,72,153,0.2)" }}
                  />
                )}
              </div>
            </ScrollFadeUp>
          ))}
        </div>
      </section>

      {/* ── Example Cards ────────────────────────────────────── */}
      <section className="px-5 py-24 max-w-4xl mx-auto">
        <ScrollFadeUp className="text-center mb-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: "#EC4899" }}
          >
            See it in action
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            Cards that get you added
          </h2>
          <p
            className="text-sm mt-3 max-w-xs mx-auto"
            style={{ color: "#94A3B8" }}
          >
            For friends, businesses, or groups — there's a card for everyone.
          </p>
        </ScrollFadeUp>

        {/* horizontal scroll on mobile, grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 -mx-5 sm:mx-0 px-5 sm:px-0 scrollbar-hide">
          {exampleCards.map((card, i) => (
            <ExampleCard key={card.name} card={card} index={i} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="px-5 pb-24">
        <ScrollFadeUp>
          <div
            className="max-w-lg mx-auto text-center rounded-2xl p-10 sm:p-12"
            style={{
              background: "#1A1A1A",
              border: "1px solid rgba(236,72,153,0.2)",
              boxShadow: "0 0 60px rgba(236,72,153,0.07)",
            }}
          >
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Ready to grow your WhatsApp?
            </h2>
            <p className="text-sm mt-3 mb-7" style={{ color: "#94A3B8" }}>
              Create your card in under a minute. Free forever.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 font-semibold text-white px-8 py-3.5 rounded-xl text-[15px] transition-all duration-200"
              style={{ background: "#EC4899" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 28px rgba(236,72,153,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Get started free →
            </Link>
          </div>
        </ScrollFadeUp>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        className="text-center py-8 text-xs"
        style={{ color: "rgba(148,163,184,0.4)" }}
      >
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
