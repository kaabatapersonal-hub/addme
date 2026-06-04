"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { premadeBios } from "@/data/bios";
import CardPreview from "@/components/CardPreview";

// ─── templates ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: "classic-dark",
    name: "Classic Dark",
    premium: false,
    style: {
      bg: "linear-gradient(145deg, #111111 0%, #1e1e1e 100%)",
      border: "1.5px solid rgba(236,72,153,0.4)",
      shadow: "0 0 40px rgba(236,72,153,0.15)",
      nameFg: "#ffffff",
      bioFg: "#94A3B8",
      avatarRing: "3px solid #EC4899",
      avatarGlow: "0 0 18px rgba(236,72,153,0.45)",
    },
  },
  {
    id: "clean-light",
    name: "Clean Light",
    premium: false,
    style: {
      bg: "linear-gradient(145deg, #f6f6f6 0%, #ececec 100%)",
      border: "1.5px solid rgba(236,72,153,0.2)",
      shadow: "0 4px 24px rgba(0,0,0,0.1)",
      nameFg: "#111111",
      bioFg: "#555555",
      avatarRing: "3px solid #EC4899",
      avatarGlow: "0 0 14px rgba(236,72,153,0.3)",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    premium: false,
    style: {
      bg: "#080808",
      border: "1.5px solid rgba(255,255,255,0.1)",
      shadow: "none",
      nameFg: "#ffffff",
      bioFg: "#94A3B8",
      avatarRing: "2px solid rgba(255,255,255,0.25)",
      avatarGlow: "none",
    },
  },
  {
    id: "gradient-glow",
    name: "Gradient Glow",
    premium: true,
    style: {
      bg: "linear-gradient(135deg, #1a0533 0%, #2d1052 50%, #1a0533 100%)",
      border: "1.5px solid rgba(168,85,247,0.45)",
      shadow: "0 0 50px rgba(168,85,247,0.22)",
      nameFg: "#ffffff",
      bioFg: "#d8b4fe",
      avatarRing: "3px solid #a855f7",
      avatarGlow: "0 0 20px rgba(168,85,247,0.5)",
    },
  },
  {
    id: "neon-outline",
    name: "Neon Outline",
    premium: true,
    style: {
      bg: "#000000",
      border: "2px solid #EC4899",
      shadow: "0 0 20px rgba(236,72,153,0.28)",
      nameFg: "#EC4899",
      bioFg: "#ffffff",
      avatarRing: "2px solid #EC4899",
      avatarGlow: "0 0 14px rgba(236,72,153,0.55)",
    },
  },
  {
    id: "glass-card",
    name: "Glass Card",
    premium: true,
    style: {
      bg: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      shadow: "0 8px 32px rgba(0,0,0,0.4)",
      nameFg: "#ffffff",
      bioFg: "rgba(255,255,255,0.68)",
      avatarRing: "2px solid rgba(255,255,255,0.3)",
      avatarGlow: "none",
    },
  },
  {
    id: "bold-type",
    name: "Bold Type",
    premium: true,
    style: {
      bg: "#EC4899",
      border: "none",
      shadow: "0 8px 30px rgba(236,72,153,0.42)",
      nameFg: "#ffffff",
      bioFg: "rgba(255,255,255,0.82)",
      avatarRing: "3px solid rgba(255,255,255,0.45)",
      avatarGlow: "none",
    },
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function convertPhone(raw) {
  let n = (raw || "").replace(/[\s\-\(\)\.]/g, "");
  if (n.startsWith("+233")) n = n.slice(1);
  else if (n.startsWith("0")) n = "233" + n.slice(1);
  return n;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateUsername(name) {
  const base = (name || "user")
    .split(" ")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12) || "user";
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${suffix}`;
}

// ─── animation ────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? "58%" : "-58%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease } },
  exit: (dir) => ({
    x: dir > 0 ? "-58%" : "58%",
    opacity: 0,
    transition: { duration: 0.25, ease },
  }),
};

// ─── shared input style ───────────────────────────────────────────────────────

const inputCls = "addme-input";

// ─── atoms ────────────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  const total = 5;
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

function ContinueBtn({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl font-bold text-[15px] mt-6 transition-all duration-200 active:scale-[0.98]"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.06)"
          : "linear-gradient(135deg, #EC4899 0%, #db2777 100%)",
        color: disabled ? "rgba(255,255,255,0.2)" : "#ffffff",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 6px 24px rgba(236,72,153,0.32)",
      }}
    >
      Continue
    </button>
  );
}

function ChoiceCard({ icon, title, desc, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full text-left p-5 rounded-2xl transition-all duration-200"
      style={{
        background: selected ? "rgba(236,72,153,0.1)" : "var(--bg-card)",
        border: selected ? "2px solid #EC4899" : "2px solid rgba(255,255,255,0.07)",
        boxShadow: selected ? "0 0 24px rgba(236,72,153,0.18)" : "none",
      }}
    >
      {/* Checkmark badge */}
      {selected && (
        <div
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "#EC4899" }}
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="text-3xl mb-3 leading-none">{icon}</div>
      <p
        className="font-semibold text-[15px] leading-tight"
        style={{ color: selected ? "#ffffff" : "var(--fg)" }}
      >
        {title}
      </p>
      <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {desc}
      </p>
    </button>
  );
}

// ─── BioGrid ─────────────────────────────────────────────────────────────────

function BioGrid({ mode, cardType, selectedBio, onSelect }) {
  const source = useMemo(() => {
    if (cardType === "group") return premadeBios;
    if (mode === "business")
      return premadeBios.filter((b) =>
        ["Business", "Professional"].includes(b.category)
      );
    return premadeBios.filter((b) => b.category === "Friendly");
  }, [mode, cardType]);

  const [pool, setPool] = useState(() => shuffleArray(source).slice(0, 8));

  function handleShuffle() {
    setPool(shuffleArray(source).slice(0, 8));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
          Premade bios
        </p>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#EC4899" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Shuffle
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-0.5">
        {pool.map((bio) => {
          const sel = selectedBio === bio.text;
          return (
            <button
              key={bio.id}
              onClick={() => onSelect(bio.text)}
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

// ─── ImageUpload ──────────────────────────────────────────────────────────────

function ImageUpload({ label = "Profile picture", preview, onChange }) {
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      });
      const dataUrl = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = (ev) => res(ev.target.result);
        reader.readAsDataURL(compressed);
      });
      onChange(compressed, dataUrl);
    } catch (err) {
      console.error("Compression error:", err);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
        {label}
      </label>
      {preview ? (
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <img
            src={preview}
            alt="Preview"
            className="w-16 h-16 rounded-full object-cover"
            style={{ border: "2px solid #EC4899" }}
          />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>Photo uploaded ✓</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
              Tap to change
            </p>
          </div>
        </div>
      ) : (
        <div
          className="cursor-pointer rounded-xl py-6 flex flex-col items-center gap-2 transition-colors duration-150"
          style={{
            background: "var(--bg-subtle)",
            border: "2px dashed var(--border)",
          }}
          onClick={() => inputRef.current?.click()}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "rgba(236,72,153,0.4)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")
          }
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <svg className="w-5 h-5" style={{ color: "var(--fg-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Upload photo
          </p>
          <p className="text-xs" style={{ color: "var(--fg-dim)" }}>
            Auto-compressed · max 500×500px
          </p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── step 1 ───────────────────────────────────────────────────────────────────

function Step1({ cardType, onChange }) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
        What are you creating?
      </h2>
      <p className="text-sm mb-7" style={{ color: "var(--fg-muted)" }}>
        Choose your card type
      </p>
      <div className="grid grid-cols-2 gap-4">
        <ChoiceCard
          icon="👤"
          title="Personal"
          desc="Make friends, reconnect, grow your contacts"
          selected={cardType === "personal"}
          onClick={() => onChange("personal")}
        />
        <ChoiceCard
          icon="👥"
          title="Group"
          desc="For communities, businesses, churches, student groups"
          selected={cardType === "group"}
          onClick={() => onChange("group")}
        />
      </div>
    </div>
  );
}

// ─── step 2 ───────────────────────────────────────────────────────────────────

function Step2({ mode, onChange }) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
        What's your vibe?
      </h2>
      <p className="text-sm mb-7" style={{ color: "var(--fg-muted)" }}>
        This helps us show you the right bios
      </p>
      <div className="grid grid-cols-2 gap-4">
        <ChoiceCard
          icon="❤️"
          title="Friendly"
          desc="I want to make new friends or reconnect"
          selected={mode === "friendly"}
          onClick={() => onChange("friendly")}
        />
        <ChoiceCard
          icon="💼"
          title="Business"
          desc="I want to promote my business or services"
          selected={mode === "business"}
          onClick={() => onChange("business")}
        />
      </div>
    </div>
  );
}

// ─── username field ───────────────────────────────────────────────────────────

function validateUsernameFormat(u) {
  if (u.length < 3 || u.length > 20) return false;
  if (!/^[a-z0-9-]+$/.test(u)) return false;
  if (u.startsWith("-") || u.endsWith("-")) return false;
  return true;
}

function UsernameField({ value, status, onChange }) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "addme.app").replace(/^https?:\/\//, "");
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
        Your link
      </label>
      <div
        className="flex items-center bg-[#111111] rounded-xl overflow-hidden transition-all duration-150"
        style={{
          border: status === "available"
            ? "1px solid rgba(37,211,102,0.5)"
            : status === "taken" || status === "invalid"
            ? "1px solid rgba(248,113,113,0.5)"
            : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <span className="pl-4 text-sm flex-shrink-0 whitespace-nowrap" style={{ color: "var(--fg-dim)" }}>
          {baseUrl}/
        </span>
        <input
          className="flex-1 py-3 px-1 text-sm bg-transparent outline-none" style={{ color: "var(--fg)" }}
          placeholder="yourname"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="pr-4 pl-2 w-9 flex justify-center flex-shrink-0">
          {status === "checking" && (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#EC4899] border-t-transparent animate-spin" />
          )}
          {status === "available" && (
            <span className="text-base font-bold" style={{ color: "#25D366" }}>✓</span>
          )}
          {(status === "taken" || status === "invalid") && (
            <span className="text-base font-bold" style={{ color: "#f87171" }}>✗</span>
          )}
        </div>
      </div>
      <div className="mt-1.5" style={{ minHeight: 18 }}>
        {status === "taken" && (
          <p className="text-xs" style={{ color: "#f87171" }}>That username is taken — try adding a number or letter.</p>
        )}
        {status === "invalid" && (
          <p className="text-xs" style={{ color: "#f87171" }}>3–20 chars, lowercase letters, numbers, hyphens only.</p>
        )}
        {status === "available" && (
          <p className="text-xs" style={{ color: "#25D366" }}>{baseUrl}/{value} is yours ✓</p>
        )}
      </div>
    </div>
  );
}

// ─── step 3 — personal ────────────────────────────────────────────────────────

function Step3Personal({ mode, details, onChange, usernameInput, usernameStatus, onChangeUsername }) {
  function set(field, val) {
    onChange({ ...details, [field]: val });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
          Your details
        </h2>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          {mode === "business"
            ? "Tell people about your business"
            : "Introduce yourself"}
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
          {mode === "business" ? "Name or business name" : "Name or nickname"}
        </label>
        <input
          className={inputCls}
          placeholder={mode === "business" ? "e.g. TasteKitchen" : "e.g. Simo, Simon, ItzIncredibleSimo"}
          value={details.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      {/* Username / link */}
      <UsernameField
        value={usernameInput}
        status={usernameStatus}
        onChange={onChangeUsername}
      />

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
          WhatsApp number
        </label>
        <input
          className={inputCls}
          type="tel"
          placeholder="0257 653 283 or +233257653283"
          value={details.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      {/* Second phone — business premium */}
      {mode === "business" && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
            Second phone number
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(236,72,153,0.14)",
                color: "#EC4899",
                border: "1px solid rgba(236,72,153,0.3)",
              }}
            >
              🔒 PREMIUM
            </span>
          </label>
          <input
            className={`${inputCls} cursor-not-allowed`}
            style={{ opacity: 0.35 }}
            placeholder="Coming soon — unlock with premium"
            disabled
          />
        </div>
      )}

      {/* Photo */}
      <ImageUpload
        preview={details.imagePreview}
        onChange={(file, dataUrl) =>
          onChange({ ...details, imageFile: file, imagePreview: dataUrl })
        }
      />

      {/* Bio grid + custom */}
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: "var(--fg-muted)" }}>
          {mode === "business" ? "Business bio" : "Your bio"}
        </label>
        <BioGrid
          mode={mode}
          cardType="personal"
          selectedBio={details.bio}
          onSelect={(text) => set("bio", text)}
        />
        <textarea
          className={`${inputCls} resize-none mt-3`}
          rows={3}
          placeholder="Or write your own bio..."
          value={details.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── step 3 — group ───────────────────────────────────────────────────────────

function Step3Group({ details, onChange, usernameInput, usernameStatus, onChangeUsername }) {
  function set(field, val) {
    onChange({ ...details, [field]: val });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
          Your group details
        </h2>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Tell people what your group is about
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
          Group name
        </label>
        <input
          className={inputCls}
          placeholder="e.g. Badminton Crew 🏸"
          value={details.groupName}
          onChange={(e) => set("groupName", e.target.value)}
        />
      </div>

      {/* Username / link */}
      <UsernameField
        value={usernameInput}
        status={usernameStatus}
        onChange={onChangeUsername}
      />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
          Group description
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder="What is your group about?"
          value={details.groupDesc}
          onChange={(e) => set("groupDesc", e.target.value)}
        />
      </div>

      <ImageUpload
        label="Group picture"
        preview={details.imagePreview}
        onChange={(file, dataUrl) =>
          onChange({ ...details, imageFile: file, imagePreview: dataUrl })
        }
      />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--fg-muted)" }}>
          WhatsApp group invite link
        </label>
        <input
          className={inputCls}
          placeholder="Paste your group invite link"
          value={details.inviteLink}
          onChange={(e) => set("inviteLink", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: "var(--fg-muted)" }}>
          Short tagline
        </label>
        <BioGrid
          mode={null}
          cardType="group"
          selectedBio={details.tagline}
          onSelect={(text) => set("tagline", text)}
        />
        <textarea
          className={`${inputCls} resize-none mt-3`}
          rows={2}
          placeholder="Or write your own tagline..."
          value={details.tagline}
          onChange={(e) => set("tagline", e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── template mini card ───────────────────────────────────────────────────────

function TemplateMiniCard({ template, name, imagePreview, selected, onClick }) {
  const [showTip, setShowTip] = useState(false);
  const s = template.style;
  const initial = (name || "Y").charAt(0).toUpperCase();

  function handleClick() {
    if (template.premium) {
      setShowTip(true);
      setTimeout(() => setShowTip(false), 2200);
      return;
    }
    onClick();
  }

  return (
    <div className="relative flex-shrink-0 flex flex-col items-center" style={{ width: 130 }}>
      <button
        onClick={handleClick}
        className="relative w-full rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          border: selected
            ? "2.5px solid #EC4899"
            : "2px solid rgba(255,255,255,0.07)",
          boxShadow: selected ? "0 0 18px rgba(236,72,153,0.28)" : "none",
        }}
      >
        {/* Mini card body */}
        <div
          style={{
            background: s.bg,
            padding: "14px 10px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 7,
          }}
        >
          {/* avatar */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: s.avatarRing,
              overflow: "hidden",
              background: "#2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: s.nameFg, fontSize: 15, fontWeight: 700 }}>
                {initial}
              </span>
            )}
          </div>
          {/* name */}
          <p
            style={{
              color: s.nameFg,
              fontSize: 10,
              fontWeight: 700,
              textAlign: "center",
              margin: 0,
              lineHeight: 1.2,
              maxWidth: 90,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {name || "Your Name"}
          </p>
          {/* button */}
          <div
            style={{
              width: "100%",
              padding: "4px 0",
              borderRadius: 7,
              background: "#25D366",
              color: "#fff",
              fontSize: 8,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            WhatsApp
          </div>
        </div>

        {/* Premium dim overlay */}
        {template.premium && (
          <div
            className="absolute inset-0 flex items-end justify-center pb-2"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <span
              className="text-[8px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#EC4899", color: "#fff" }}
            >
              PREMIUM
            </span>
          </div>
        )}
      </button>

      <p
        className="text-[11px] mt-1.5 font-medium text-center"
        style={{ color: selected ? "#EC4899" : "#94A3B8" }}
      >
        {template.name}
      </p>

      {/* Tooltip */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            className="absolute z-30 bottom-full mb-2 left-1/2 -translate-x-1/2"
            style={{ width: 168 }}
          >
            <div
              className="text-[11px] text-center px-3 py-2.5 rounded-xl font-medium"
              style={{
                background: "#EC4899",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(236,72,153,0.4)",
              }}
            >
              Coming soon — unlock with premium ✨
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── step 4 ───────────────────────────────────────────────────────────────────

function Step4({ templateId, details, cardType, onChange, isPublic, onTogglePublic }) {
  const name = cardType === "group" ? details.groupName : details.name;
  const [showPrivateTip, setShowPrivateTip] = useState(false);

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
        Pick your template
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--fg-muted)" }}>
        Your card, your style
      </p>

      <div className="flex gap-3 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
        {TEMPLATES.map((t) => (
          <TemplateMiniCard
            key={t.id}
            template={t}
            name={name}
            imagePreview={details.imagePreview}
            selected={templateId === t.id && !t.premium}
            onClick={() => onChange(t.id)}
          />
        ))}
      </div>

      <p className="text-xs text-center mt-4 mb-5" style={{ color: "rgba(148,163,184,0.45)" }}>
        Scroll to see all · Premium templates coming soon
      </p>

      {/* Public / Private toggle */}
      <div
        className="flex items-center justify-between p-4 rounded-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex-1 min-w-0 pr-3">
          <p className="font-semibold text-[14px]" style={{ color: "var(--fg)" }}>
            Show in Discover
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--fg-muted)" }}>
            {isPublic
              ? "Your card will appear in the AddMe Discover page"
              : "Only people with your direct link can find you"}
          </p>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              if (isPublic) {
                setShowPrivateTip(true);
                setTimeout(() => setShowPrivateTip(false), 2400);
              } else {
                onTogglePublic(true);
              }
            }}
            style={{
              width: 46, height: 26, borderRadius: 13,
              background: isPublic ? "#EC4899" : "rgba(148,163,184,0.3)",
              position: "relative", transition: "background 0.2s", border: "none", cursor: "pointer",
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 3,
              left: isPublic ? 23 : 3,
              transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            }} />
          </button>

          {/* Premium tooltip when trying to go private */}
          <AnimatePresence>
            {showPrivateTip && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.92 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: "absolute", right: 0, bottom: "calc(100% + 8px)",
                  width: 200, zIndex: 30,
                  background: "#EC4899", borderRadius: 14, padding: "10px 14px",
                  boxShadow: "0 4px 20px rgba(236,72,153,0.4)",
                }}
              >
                <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>
                  🔒 Private cards are a premium feature — coming soon!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── step 5 ───────────────────────────────────────────────────────────────────

function Step5({ details, cardType, mode, templateId, username, isPublic }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const name = cardType === "group" ? details.groupName : details.name;
  const bio = cardType === "group" ? details.tagline : details.bio;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const cardUrl = `${baseUrl}/${username}`;
  const displayUrl = baseUrl.replace(/^https?:\/\//, "");

  useEffect(() => {
    if (!saved && !saving) saveCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveCard() {
    setSaving(true);
    try {
      let imageUrl = null;
      if (details.imageFile) {
        const ext = details.imageFile.type === "image/png" ? "png" : "jpg";
        const path = `${username}.${ext}`;
        await supabase.storage
          .from("card-images")
          .upload(path, details.imageFile, {
            contentType: details.imageFile.type,
            upsert: true,
          });
        const { data: urlData } = supabase.storage
          .from("card-images")
          .getPublicUrl(path);
        imageUrl = urlData?.publicUrl ?? null;
      }

      // Retry with a new username on conflict (duplicate)
      let finalUsername = username;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error: insertError } = await supabase.from("cards").insert({
          username: finalUsername,
          type: cardType,
          mode: cardType === "personal" ? mode : "group",
          is_public: isPublic,
          name,
          bio,
          phone: convertPhone(details.phone) || null,
          image_url: imageUrl,
          template: templateId,
          group_link: details.inviteLink || null,
        });
        if (!insertError) break;
        if (insertError.code === "23505") {
          // unique violation — regenerate suffix and retry
          finalUsername = generateUsername(name);
        } else {
          throw insertError;
        }
      }

      setSaved(true);
      setSaveError(null);
    } catch (err) {
      console.error("Supabase save error:", err);
      setSaveError(err?.message || JSON.stringify(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2.5,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${username}-addme.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = cardUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Add me on WhatsApp", url: cardUrl });
        return;
      } catch {}
    }
    handleCopy();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
          Your card is ready! 🎉
        </h2>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Share it and start getting added
        </p>
      </div>

      {/* Card preview — ref'd for html2canvas */}
      <div className="flex justify-center">
        <CardPreview
          ref={cardRef}
          name={name}
          bio={bio}
          imagePreview={details.imagePreview}
          template={template}
          cardType={cardType}
        />
      </div>

      {/* Link row */}
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-3"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <span className="text-sm flex-1 truncate font-mono" style={{ color: "var(--fg-muted)" }}>
          {displayUrl}/<span className="font-medium" style={{ color: "var(--fg)" }}>{username}</span>
        </span>
        <button
          onClick={handleCopy}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all duration-200"
          style={{
            background: copied ? "rgba(16,185,129,0.14)" : "rgba(236,72,153,0.14)",
            color: copied ? "#10B981" : "#EC4899",
            border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(236,72,153,0.3)",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
          style={{ background: "#EC4899", opacity: downloading ? 0.75 : 1 }}
        >
          {downloading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Card
            </>
          )}
        </button>

        {/* Save link to own WhatsApp — most important action */}
        {details.phone && (
          <a
            href={`https://wa.me/${details.phone.replace(/[\s+\-()]/g, "")}?text=${encodeURIComponent(`My AddMe card 🃏\n${cardUrl}\n\nShare it so people can add me on WhatsApp 🚀`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            style={{ background: "#25D366" }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Save my link to WhatsApp
          </a>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Share */}
          <button
            onClick={handleShare}
            className="py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "#25D366",
              color: "#ffffff",
              border: "none",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Link
          </button>

          {/* Open page */}
          <Link
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "rgba(236,72,153,0.08)",
              color: "#EC4899",
              border: "1.5px solid rgba(236,72,153,0.45)",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open my page
          </Link>
        </div>
      </div>

      {/* Nudge */}
      <p className="text-xs text-center" style={{ color: "rgba(148,163,184,0.45)" }}>
        Share your card with friends and ask them to post it on their status 👀
      </p>
      <p className="text-[11px] text-center mt-1" style={{ color: "rgba(148,163,184,0.3)" }}>
        Your page is live at {displayUrl}/<span style={{ color: "rgba(236,72,153,0.5)" }}>{username}</span>
      </p>

      {saving && (
        <p className="text-xs text-center" style={{ color: "rgba(148,163,184,0.4)" }}>
          Saving your card...
        </p>
      )}
      {saveError && (
        <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          <p className="font-semibold mb-1">Save error (share this with developer):</p>
          <p className="font-mono break-all">{saveError}</p>
        </div>
      )}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [cardType, setCardType] = useState(null);
  const [mode, setMode] = useState(null);
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    phone2: "",
    imageFile: null,
    imagePreview: null,
    bio: "",
    groupName: "",
    groupDesc: "",
    inviteLink: "",
    tagline: "",
  });
  const [templateId, setTemplateId] = useState("classic-dark");
  const [username, setUsername] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const usernameTimerRef = useRef(null);

  async function checkUsernameAvailability(value) {
    if (!validateUsernameFormat(value)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const { data } = await supabase
      .from("cards")
      .select("username")
      .eq("username", value)
      .maybeSingle();
    setUsernameStatus((cur) => cur === "checking" ? (data ? "taken" : "available") : cur);
  }

  function scheduleCheck(value) {
    clearTimeout(usernameTimerRef.current);
    if (value.length >= 3) {
      usernameTimerRef.current = setTimeout(() => checkUsernameAvailability(value), 600);
    } else {
      setUsernameStatus("idle");
    }
  }

  function handleUsernameChange(value) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20);
    setUsernameInput(cleaned);
    setUsernameStatus("idle");
    scheduleCheck(cleaned);
  }

  // Auto-fill username from personal name (only when field is empty)
  useEffect(() => {
    if (cardType === "group" || usernameInput) return;
    const base = (details.name || "")
      .split(" ")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);
    if (base.length >= 2) {
      setUsernameInput(base);
      scheduleCheck(base);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.name]);

  // Auto-fill username from group name (only when field is empty)
  useEffect(() => {
    if (cardType !== "group" || usernameInput) return;
    const base = (details.groupName || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);
    if (base.length >= 2) {
      setUsernameInput(base);
      scheduleCheck(base);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.groupName]);

  // Reset username when card type changes
  useEffect(() => {
    setUsernameInput("");
    setUsernameStatus("idle");
  }, [cardType]);

  function canContinue() {
    if (step === 1) return cardType !== null;
    if (step === 2) return mode !== null;
    if (step === 3) {
      const uOk = usernameStatus === "available";
      if (cardType === "group")
        return details.groupName.trim() !== "" && details.inviteLink.trim() !== "" && uOk;
      return details.name.trim() !== "" && details.phone.trim() !== "" && uOk;
    }
    return true;
  }

  function goNext() {
    setDirection(1);
    if (step === 1 && cardType === "group") {
      setStep(3);
    } else if (step === 4) {
      setUsername(usernameInput);
      setStep(5);
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    setDirection(-1);
    if (step === 3 && cardType === "group") {
      setStep(1);
    } else {
      setStep((s) => s - 1);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-page)", overflowX: "hidden" }}>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: "linear-gradient(to bottom, rgba(236,72,153,0.07) 0%, transparent 100%)" }} />
      </div>
      <div className="relative z-10 max-w-lg mx-auto px-5 pt-12 pb-28">
        <ProgressBar step={step} />
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
              {/* Back button — steps 2-4 only */}
              {step > 1 && step < 5 && <BackBtn onClick={goBack} />}

              {step === 1 && (
                <Step1 cardType={cardType} onChange={setCardType} />
              )}
              {step === 2 && (
                <Step2 mode={mode} onChange={setMode} />
              )}
              {step === 3 && cardType === "personal" && (
                <Step3Personal
                  mode={mode}
                  details={details}
                  onChange={setDetails}
                  usernameInput={usernameInput}
                  usernameStatus={usernameStatus}
                  onChangeUsername={handleUsernameChange}
                />
              )}
              {step === 3 && cardType === "group" && (
                <Step3Group
                  details={details}
                  onChange={setDetails}
                  usernameInput={usernameInput}
                  usernameStatus={usernameStatus}
                  onChangeUsername={handleUsernameChange}
                />
              )}
              {step === 4 && (
                <Step4
                  templateId={templateId}
                  details={details}
                  cardType={cardType}
                  onChange={setTemplateId}
                  isPublic={isPublic}
                  onTogglePublic={setIsPublic}
                />
              )}
              {step === 5 && (
                <Step5
                  details={details}
                  cardType={cardType}
                  mode={mode}
                  templateId={templateId}
                  username={username}
                  isPublic={isPublic}
                />
              )}

              {step < 5 && (
                <ContinueBtn onClick={goNext} disabled={!canContinue()} />
              )}
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
