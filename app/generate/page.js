"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { premadeBios } from "@/data/bios";

// ─── utilities ────────────────────────────────────────────────────────────────

function convertPhone(raw) {
  let n = raw.replace(/[\s\-\(\)\.]/g, "");
  if (n.startsWith("+233")) n = n.slice(1);
  else if (n.startsWith("0")) n = "233" + n.slice(1);
  return n;
}

function isValidPhone(converted) {
  return /^233\d{9}$/.test(converted);
}

function toThirdPerson(text) {
  return text
    .replace(/\bI'm\b/g, "they're")
    .replace(/\bI've\b/g, "they've")
    .replace(/\bI'll\b/g, "they'll")
    .replace(/\bI'd\b/g, "they'd")
    .replace(/\bI am\b/g, "they are")
    .replace(/\bI\b/g, "they")
    .replace(/\bMy\b/g, "Their")
    .replace(/\bMe\b/g, "Them")
    .replace(/\bmy\b/g, "their")
    .replace(/\bme\b/g, "them")
    .replace(/\bmine\b/g, "theirs")
    .replace(/\bmyself\b/g, "themselves");
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── guide steps data ─────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    step: 3,
    emoji: "📷",
    title: "Tap the camera icon 📷",
    text: "Open WhatsApp, go to a friend's chat and tap the camera icon next to the message bar — not the attach icon, the camera one.",
    bg: "linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)",
    border: "rgba(255,255,255,0.2)",
    glow: "rgba(37,99,235,0.25)",
    hasMock: false,
  },
  {
    step: 4,
    emoji: "📸",
    title: "Pick your picture or video 📸",
    text: "Select a good photo or short video of yourself from your gallery.",
    bg: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
    border: "rgba(255,255,255,0.2)",
    glow: "rgba(124,58,237,0.25)",
    hasMock: false,
  },
  {
    step: 5,
    emoji: "👇",
    title: "Paste your copied text in the caption 👇",
    text: "In the caption field below your picture, paste the text you already copied. Your picture and link are now one complete message — exactly like this:",
    bg: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    border: "rgba(255,255,255,0.2)",
    glow: "rgba(5,150,105,0.25)",
    hasMock: true,
  },
  {
    step: 6,
    emoji: "💬",
    title: "Send it to as many friends as possible 💬",
    text: "Send that complete message to as many friends as you can. The more friends you send it to, the more people will see you.",
    bg: "linear-gradient(135deg, #EA580C 0%, #F97316 100%)",
    border: "rgba(255,255,255,0.2)",
    glow: "rgba(234,88,12,0.25)",
    hasMock: false,
  },
  {
    step: 7,
    emoji: "📢",
    title: "Ask them to post it on their status ✅",
    text: "Ask each friend to forward your message to their WhatsApp status. Their contacts will see your face, tap your link, and add you directly on WhatsApp.",
    bg: "linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)",
    border: "rgba(255,255,255,0.2)",
    glow: "rgba(236,72,153,0.25)",
    hasMock: false,
  },
];

// ─── animation ────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1];
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? "58%" : "-58%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease } },
  exit: (dir) => ({ x: dir > 0 ? "-58%" : "58%", opacity: 0, transition: { duration: 0.25, ease } }),
};

// ─── atoms ────────────────────────────────────────────────────────────────────

const inputCls = "addme-input";

function ProgressBar({ step, total = 7 }) {
  const pct = Math.round(((step - 1) / (total - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold" style={{ color: "rgba(148,163,184,0.5)" }}>
          Step {step} of {total}
        </p>
        <p className="text-[11px] font-bold" style={{ color: "#EC4899" }}>{pct}%</p>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #EC4899 0%, #f472b6 100%)" }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm mb-6 font-medium transition-all duration-150 active:scale-95"
      style={{ color: "rgba(148,163,184,0.6)" }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

function ContinueBtn({ onClick, disabled, label = "Continue" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl font-bold text-[15px] mt-6 transition-all duration-200 active:scale-[0.98]"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.06)"
          : "linear-gradient(135deg, #EC4899 0%, #db2777 100%)",
        color: disabled ? "rgba(255,255,255,0.2)" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 6px 24px rgba(236,72,153,0.32)",
      }}
    >
      {label}
    </button>
  );
}

// ─── bio grid ─────────────────────────────────────────────────────────────────

function BioGrid({ selectedBio, onSelect }) {
  const source = useMemo(
    () => premadeBios.filter((b) => b.category === "Friendly"),
    []
  );
  const [pool, setPool] = useState(() => shuffleArray(source).slice(0, 8));

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
          Premade bios
        </p>
        <button
          onClick={() => setPool(shuffleArray(source).slice(0, 8))}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#EC4899" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Shuffle
        </button>
      </div>
      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
        {pool.map((bio) => {
          const sel = selectedBio === bio.text;
          return (
            <button
              key={bio.id}
              onClick={() => onSelect(sel ? "" : bio.text)}
              className="text-left px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed transition-all duration-150"
              style={{
                background: sel ? "rgba(236,72,153,0.1)" : "var(--bg-subtle)",
                border: sel ? "1px solid rgba(236,72,153,0.45)" : "1px solid var(--border)",
                color: sel ? "#EC4899" : "var(--fg-muted)",
              }}
            >
              {bio.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── copy block ───────────────────────────────────────────────────────────────

function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: "#EC4899" }}>
        {label}
      </p>
      <pre
        className="text-sm leading-relaxed whitespace-pre-wrap break-words font-sans"
        style={{ color: "var(--fg)" }}
      >
        {text}
      </pre>
      <button
        onClick={handleCopy}
        className="mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
        style={{
          background: copied ? "rgba(16,185,129,0.15)" : "#EC4899",
          color: copied ? "#10B981" : "#fff",
          border: copied ? "1px solid rgba(16,185,129,0.4)" : "none",
        }}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
        style={{ background: "#25D366", color: "#fff" }}
      >
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Share directly on WhatsApp
      </a>
    </div>
  );
}

// ─── step 1 ───────────────────────────────────────────────────────────────────

function Step1({ name, phone, bio, onChangeName, onChangePhone, onChangeBio }) {
  const converted = convertPhone(phone);
  const valid = isValidPhone(converted);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
          Enter your details
        </h2>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          We'll generate your WhatsApp link and text blocks
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
          Your name
        </label>
        <input
          className={inputCls}
          placeholder="e.g. Simo, Simon, ItzIncredibleSimo"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
          WhatsApp number
        </label>
        <input
          className={inputCls}
          type="tel"
          placeholder="0257 653 283 or +233257653283"
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
        />
        {phone.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: valid ? "#25D366" : "#f87171" }}
            />
            <p className="text-xs font-mono" style={{ color: valid ? "#25D366" : "#f87171" }}>
              {valid ? `wa.me/${converted}` : `${converted || "–"} · invalid format`}
            </p>
          </div>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: "var(--fg-muted)" }}>
          Your bio
        </label>
        <BioGrid selectedBio={bio} onSelect={onChangeBio} />
        <textarea
          className={`${inputCls} resize-none mt-3`}
          rows={2}
          placeholder="Or write your own..."
          value={bio}
          onChange={(e) => onChangeBio(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── step 2 ───────────────────────────────────────────────────────────────────

function Step2({ name, phone, bio, onNext }) {
  const converted = convertPhone(phone);
  const waUrl = `https://wa.me/${converted}`;

  const firstPersonText =
    `Hi 👋 I'm ${name}\n${bio}\n\n*${waUrl}*`;

  const thirdPersonBio = toThirdPerson(bio);
  const thirdPersonText =
    `Hi 👋 Meet my friend ${name}\n${thirdPersonBio}\n\n*${waUrl}*`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
          Your generated links 🎉
        </h2>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Copy the right version and send to your friends
        </p>
      </div>

      <CopyBlock label="Your own version 👤" text={firstPersonText} />
      <CopyBlock label="Version for friends to share 👥" text={thirdPersonText} />

      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
        style={{ background: "#EC4899", color: "#fff" }}
      >
        Now add your photo or video to the link 📸
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}

// ─── whatsapp mock bubble ─────────────────────────────────────────────────────

function WhatsAppMock({ text }) {
  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{ background: "#111b21", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Picture placeholder */}
      <div
        className="w-full flex flex-col items-center justify-center gap-2 py-6"
        style={{ background: "#2a3942" }}
      >
        <span className="text-5xl leading-none">🤳</span>
        <p className="text-xs" style={{ color: "#8696a0" }}>your photo or video</p>
      </div>

      {/* Message bubble */}
      <div className="p-3">
        <div
          className="rounded-xl rounded-tl-sm px-3 py-2.5"
          style={{ background: "#005c4b", maxWidth: "100%" }}
        >
          <pre
            className="text-[12px] leading-relaxed whitespace-pre-wrap break-words font-sans"
            style={{ color: "#e9edef" }}
          >
            {text}
          </pre>
          <p className="text-[10px] text-right mt-1" style={{ color: "#8696a0" }}>
            11:25 ✓✓
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── guide card ───────────────────────────────────────────────────────────────

function GuideCard({ guide, onNext, mockText }) {
  return (
    <div className="flex flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl p-6 flex flex-col items-center text-center gap-4"
        style={{
          background: guide.bg,
          border: `1px solid ${guide.border}`,
          boxShadow: `0 0 40px ${guide.glow}`,
        }}
      >
        <div className="text-7xl leading-none">{guide.emoji}</div>
        <h3 className="font-heading text-xl font-bold leading-tight" style={{ color: "#fff" }}>
          {guide.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.82)", maxWidth: 280 }}>
          {guide.text}
        </p>

        {/* WhatsApp mock preview — only on step 5 */}
        {guide.hasMock && mockText && (
          <div className="w-full mt-1">
            <WhatsAppMock text={mockText} />
          </div>
        )}
      </motion.div>

      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
        style={{ background: "#EC4899", color: "#fff" }}
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ─── step 7 ───────────────────────────────────────────────────────────────────

function Step7({ onReset }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
        style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.15) 100%)", border: "1px solid rgba(236,72,153,0.25)" }}
      >
        🚀
      </div>

      <div>
        <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: "var(--fg)" }}>
          You're all set!
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#94A3B8", maxWidth: 260, margin: "0 auto" }}>
          Go send it to your friends and watch the adds come in 😎
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full pt-2">
        <button
          onClick={onReset}
          className="w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #EC4899 0%, #db2777 100%)", color: "#fff", boxShadow: "0 6px 24px rgba(236,72,153,0.32)" }}
        >
          Generate another link
        </button>

        <Link
          href="/create"
          className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
          style={{ background: "rgba(236,72,153,0.08)", color: "#EC4899", border: "1.5px solid rgba(236,72,153,0.28)" }}
        >
          Create a permanent card instead →
        </Link>

        <Link
          href="/"
          className="w-full py-3 rounded-2xl font-medium text-[14px] flex items-center justify-center transition-all duration-200 active:scale-[0.98]"
          style={{ color: "var(--fg-dim)" }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const converted = convertPhone(phone);
  const waUrl = `https://wa.me/${converted}`;
  const firstPersonText = name
    ? `Hi 👋 I'm ${name}\n${bio}\n\n*${waUrl}*`
    : "";

  function canContinueStep1() {
    return name.trim() !== "" && isValidPhone(converted);
  }

  function go(target) {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }

  function goNext() {
    go(step + 1);
  }

  function goBack() {
    go(step - 1);
  }

  function reset() {
    setName("");
    setPhone("");
    setBio("");
    setDirection(-1);
    setStep(1);
  }

  const guideData = GUIDE_STEPS.find((g) => g.step === step);

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-page)", overflowX: "hidden" }}>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "100%",
          background: "linear-gradient(to bottom, rgba(236,72,153,0.07) 0%, transparent 100%)",
        }} />
      </div>
      <div className="relative z-10 max-w-lg mx-auto px-5 pt-12 pb-28">
        <div className="flex items-center justify-between mb-3">
          <a
            href="/"
            className="text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--fg-dim)", textDecoration: "none" }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </a>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-dim)" }}>
            {step < 8 ? `Step ${step} of 8` : "All done 🎉"}
          </span>
        </div>
        <ProgressBar step={step} total={8} />

        <div className="relative overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {step > 1 && step < 8 && <BackBtn onClick={goBack} />}

              {step === 1 && (
                <>
                  <Step1
                    name={name}
                    phone={phone}
                    bio={bio}
                    onChangeName={setName}
                    onChangePhone={setPhone}
                    onChangeBio={setBio}
                  />
                  <ContinueBtn onClick={goNext} disabled={!canContinueStep1()} />
                </>
              )}

              {step === 2 && (
                <Step2
                  name={name}
                  phone={phone}
                  bio={bio}
                  onNext={goNext}
                />
              )}

              {guideData && (
                <GuideCard
                  guide={guideData}
                  onNext={goNext}
                  mockText={firstPersonText}
                />
              )}

              {step === 8 && <Step7 onReset={reset} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="text-center py-6 text-xs" style={{ color: "var(--fg-dim)" }}>
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
