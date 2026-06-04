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

const inputCls =
  "w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#EC4899] focus:ring-1 focus:ring-[#EC4899]/25";

// ─── atoms ────────────────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
            style={{
              background:
                s === step
                  ? "#EC4899"
                  : s < step
                  ? "rgba(236,72,153,0.25)"
                  : "rgba(255,255,255,0.08)",
              color:
                s === step ? "#ffffff" : s < step ? "#EC4899" : "rgba(255,255,255,0.3)",
              transform: s === step ? "scale(1.12)" : "scale(1)",
            }}
          >
            {s < step ? "✓" : s}
          </div>
          {i < 4 && (
            <div
              className="h-px w-5 transition-all duration-300"
              style={{
                background: s < step ? "rgba(236,72,153,0.35)" : "rgba(255,255,255,0.08)",
              }}
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
      onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      className="w-full py-3.5 rounded-xl font-semibold text-[15px] mt-6 transition-all duration-200 active:scale-[0.98]"
      style={{
        background: disabled ? "rgba(255,255,255,0.07)" : "#EC4899",
        color: disabled ? "rgba(255,255,255,0.25)" : "#ffffff",
        cursor: disabled ? "not-allowed" : "pointer",
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
        background: selected ? "rgba(236,72,153,0.13)" : "#1A1A1A",
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
        style={{ color: selected ? "#ffffff" : "rgba(255,255,255,0.75)" }}
      >
        {title}
      </p>
      <p className="text-xs mt-2 leading-relaxed" style={{ color: "#94A3B8" }}>
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
        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
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
                background: sel ? "rgba(236,72,153,0.1)" : "#0d0d0d",
                border: sel
                  ? "1px solid rgba(236,72,153,0.5)"
                  : "1px solid rgba(255,255,255,0.06)",
                color: sel ? "#ffffff" : "#94A3B8",
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
      <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
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
            <p className="text-sm text-white font-medium">Photo uploaded ✓</p>
            <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
              Tap to change
            </p>
          </div>
        </div>
      ) : (
        <div
          className="cursor-pointer rounded-xl py-6 flex flex-col items-center gap-2 transition-colors duration-150"
          style={{
            background: "#0d0d0d",
            border: "2px dashed rgba(255,255,255,0.12)",
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
            <svg className="w-5 h-5" style={{ color: "#94A3B8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Upload photo
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
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
      <h2 className="font-heading text-2xl font-bold text-white mb-1">
        What are you creating?
      </h2>
      <p className="text-sm mb-7" style={{ color: "#94A3B8" }}>
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
      <h2 className="font-heading text-2xl font-bold text-white mb-1">
        What's your vibe?
      </h2>
      <p className="text-sm mb-7" style={{ color: "#94A3B8" }}>
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

// ─── step 3 — personal ────────────────────────────────────────────────────────

function Step3Personal({ mode, details, onChange }) {
  function set(field, val) {
    onChange({ ...details, [field]: val });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-bold text-white mb-1">
          Your details
        </h2>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          {mode === "business"
            ? "Tell people about your business"
            : "Introduce yourself"}
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
          {mode === "business" ? "Name or business name" : "Name or nickname"}
        </label>
        <input
          className={inputCls}
          placeholder={mode === "business" ? "e.g. TasteKitchen" : "e.g. Zara Ahmed"}
          value={details.name}
          onChange={(e) => set("name", e.target.value)}
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
          placeholder="+233 244 123 456"
          value={details.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      {/* Second phone — business premium */}
      {mode === "business" && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
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
        <label className="block text-sm font-medium mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
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

function Step3Group({ details, onChange }) {
  function set(field, val) {
    onChange({ ...details, [field]: val });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-2xl font-bold text-white mb-1">
          Your group details
        </h2>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          Tell people what your group is about
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
          Group name
        </label>
        <input
          className={inputCls}
          placeholder="e.g. Badminton Crew 🏸"
          value={details.groupName}
          onChange={(e) => set("groupName", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
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
        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
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
        <label className="block text-sm font-medium mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
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

function Step4({ templateId, details, cardType, onChange }) {
  const name = cardType === "group" ? details.groupName : details.name;

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white mb-1">
        Pick your template
      </h2>
      <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
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

      <p
        className="text-xs text-center mt-4"
        style={{ color: "rgba(148,163,184,0.45)" }}
      >
        Scroll to see all · Premium templates coming soon
      </p>
    </div>
  );
}

// ─── step 5 ───────────────────────────────────────────────────────────────────

function Step5({ details, cardType, mode, templateId, username }) {
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
          mode: cardType === "personal" ? mode : null,
          name,
          bio,
          phone: details.phone || null,
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
        <h2 className="font-heading text-2xl font-bold text-white mb-1">
          Your card is ready! 🎉
        </h2>
        <p className="text-sm" style={{ color: "#94A3B8" }}>
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
        style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="text-sm flex-1 truncate font-mono" style={{ color: "#94A3B8" }}>
          {displayUrl}/<span className="text-white font-medium">{username}</span>
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

  function canContinue() {
    if (step === 1) return cardType !== null;
    if (step === 2) return mode !== null;
    if (step === 3) {
      if (cardType === "group")
        return details.groupName.trim() !== "" && details.inviteLink.trim() !== "";
      return details.name.trim() !== "" && details.phone.trim() !== "";
    }
    return true;
  }

  function goNext() {
    setDirection(1);
    if (step === 1 && cardType === "group") {
      setStep(3);
    } else if (step === 4) {
      if (!username) {
        const base = cardType === "group" ? details.groupName : details.name;
        setUsername(generateUsername(base));
      }
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
    <main className="min-h-screen" style={{ background: "#080808", overflowX: "hidden" }}>
      <div className="max-w-lg mx-auto px-5 pt-14 pb-28">
        <ProgressBar step={step} />

        {/* Overflow wrapper clips the slide animation */}
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
                />
              )}
              {step === 3 && cardType === "group" && (
                <Step3Group details={details} onChange={setDetails} />
              )}
              {step === 4 && (
                <Step4
                  templateId={templateId}
                  details={details}
                  cardType={cardType}
                  onChange={setTemplateId}
                />
              )}
              {step === 5 && (
                <Step5
                  details={details}
                  cardType={cardType}
                  mode={mode}
                  templateId={templateId}
                  username={username}
                />
              )}

              {step < 5 && (
                <ContinueBtn onClick={goNext} disabled={!canContinue()} />
              )}
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
