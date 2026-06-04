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
    emoji: "📸",
    title: "Step 1 — Pick your picture or video",
    text: "Open your gallery and choose a good photo of yourself or a short video. This is what your friends will post on their status.",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    border: "rgba(99,102,241,0.35)",
    glow: "rgba(99,102,241,0.12)",
  },
  {
    step: 4,
    emoji: "💬",
    title: "Step 2 — Send it to friends",
    text: "Open WhatsApp and send the copied text to as many friends as possible. The more friends you send it to, the more people will see it.",
    bg: "linear-gradient(135deg, #052e16 0%, #14532d 100%)",
    border: "rgba(34,197,94,0.35)",
    glow: "rgba(34,197,94,0.1)",
  },
  {
    step: 5,
    emoji: "🖼️",
    title: "Step 3 — Tell them to add your picture",
    text: "Ask your friend to attach your picture or video when they post it on their status. A face gets way more attention than just text.",
    bg: "linear-gradient(135deg, #1c0a03 0%, #431407 100%)",
    border: "rgba(249,115,22,0.35)",
    glow: "rgba(249,115,22,0.1)",
  },
  {
    step: 6,
    emoji: "📢",
    title: "Step 4 — Ask them to post on status",
    text: "Ask your friends to post it on their WhatsApp status. Their contacts will see your face, read your bio, tap your link, and add you directly on WhatsApp.",
    bg: "linear-gradient(135deg, #1a0533 0%, #3b0764 100%)",
    border: "rgba(168,85,247,0.35)",
    glow: "rgba(168,85,247,0.12)",
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

const inputCls =
  "w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#EC4899] focus:ring-1 focus:ring-[#EC4899]/25";

function ProgressBar({ step, total = 7 }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
            style={{
              background: s === step ? "#EC4899" : s < step ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.08)",
              color: s === step ? "#fff" : s < step ? "#EC4899" : "rgba(255,255,255,0.3)",
              transform: s === step ? "scale(1.15)" : "scale(1)",
            }}
          >
            {s < step ? "✓" : s}
          </div>
          {i < total - 1 && (
            <div
              className="h-px w-3 transition-all duration-300"
              style={{ background: s < step ? "rgba(236,72,153,0.35)" : "rgba(255,255,255,0.08)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      style={{ color: "#94A3B8" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      className="w-full py-3.5 rounded-xl font-semibold text-[15px] mt-6 transition-all duration-200 active:scale-[0.98]"
      style={{
        background: disabled ? "rgba(255,255,255,0.07)" : "#EC4899",
        color: disabled ? "rgba(255,255,255,0.25)" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
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
        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
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
                background: sel ? "rgba(236,72,153,0.1)" : "#0d0d0d",
                border: sel ? "1px solid rgba(236,72,153,0.5)" : "1px solid rgba(255,255,255,0.06)",
                color: sel ? "#fff" : "#94A3B8",
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
      style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: "#EC4899" }}>
        {label}
      </p>
      <pre
        className="text-sm leading-relaxed whitespace-pre-wrap break-words font-sans"
        style={{ color: "#e2e8f0" }}
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
        <h2 className="font-heading text-2xl font-bold text-white mb-1">
          Enter your details
        </h2>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          We'll generate your WhatsApp link and text blocks
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
          Your name
        </label>
        <input
          className={inputCls}
          placeholder="e.g. Simo"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
          WhatsApp number
        </label>
        <input
          className={inputCls}
          type="tel"
          placeholder="0244 123 456 or +233244123456"
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
        <label className="block text-sm font-medium mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
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
        <h2 className="font-heading text-2xl font-bold text-white mb-1">
          Your generated links 🎉
        </h2>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
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
        Now see how to share it
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}

// ─── guide card ───────────────────────────────────────────────────────────────

function GuideCard({ guide, onNext }) {
  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-2xl p-8 flex flex-col items-center text-center gap-4"
        style={{
          background: guide.bg,
          border: `1px solid ${guide.border}`,
          boxShadow: `0 0 40px ${guide.glow}`,
        }}
      >
        <div className="text-7xl leading-none">{guide.emoji}</div>
        <h3 className="font-heading text-xl font-bold text-white leading-tight">
          {guide.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "#cbd5e1", maxWidth: 280 }}>
          {guide.text}
        </p>
      </div>

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
    <div className="flex flex-col items-center text-center gap-6 py-6">
      <div className="text-8xl leading-none">🚀</div>

      <div>
        <h2 className="font-heading text-2xl font-bold text-white mb-2">
          You're all set!
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#94A3B8", maxWidth: 280, margin: "0 auto" }}>
          Now go send it to your friends and watch the adds come in 😎
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={onReset}
          className="w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all duration-200 active:scale-[0.98]"
          style={{ background: "#EC4899", color: "#fff" }}
        >
          Generate another link
        </button>

        <Link
          href="/create"
          className="w-full py-3.5 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "rgba(236,72,153,0.08)",
            color: "#EC4899",
            border: "1.5px solid rgba(236,72,153,0.35)",
          }}
        >
          Create an AddMe card instead →
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
    <main
      className="min-h-screen"
      style={{ background: "#080808", overflowX: "hidden" }}
    >
      <div className="max-w-lg mx-auto px-5 pt-14 pb-28">
        <ProgressBar step={step} total={7} />

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
              {step > 1 && step < 7 && <BackBtn onClick={goBack} />}

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
                <GuideCard guide={guideData} onNext={goNext} />
              )}

              {step === 7 && <Step7 onReset={reset} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer
        className="text-center py-6 text-xs"
        style={{ color: "rgba(148,163,184,0.3)" }}
      >
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
