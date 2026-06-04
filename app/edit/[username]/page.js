"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { premadeBios } from "@/data/bios";

function convertPhone(raw) {
  let n = raw.replace(/[\s\-\(\)\.]/g, "");
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

const FREE_TEMPLATES = [
  { id: "classic-dark", name: "Classic Dark" },
  { id: "clean-light", name: "Clean Light" },
  { id: "minimal", name: "Minimal" },
];

const inputCls =
  "w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-150 focus:border-[#EC4899] focus:ring-1 focus:ring-[#EC4899]/25";

// ─── bio grid (minimal) ───────────────────────────────────────────────────────

function BioGrid({ selected, onSelect, mode }) {
  const source = mode === "business"
    ? premadeBios.filter((b) => ["Business", "Professional"].includes(b.category))
    : premadeBios.filter((b) => b.category === "Friendly");
  const [pool, setPool] = useState(() => shuffleArray(source).slice(0, 6));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Premade bios</p>
        <button
          onClick={() => setPool(shuffleArray(source).slice(0, 6))}
          className="text-xs font-semibold"
          style={{ color: "#EC4899" }}
        >
          Shuffle ↺
        </button>
      </div>
      <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto">
        {pool.map((bio) => {
          const sel = selected === bio.text;
          return (
            <button
              key={bio.id}
              onClick={() => onSelect(bio.text)}
              className="text-left px-3 py-2 rounded-xl text-[12px] leading-relaxed transition-all"
              style={{
                background: sel ? "rgba(236,72,153,0.1)" : "#0d0d0d",
                border: sel ? "1px solid rgba(236,72,153,0.45)" : "1px solid rgba(255,255,255,0.05)",
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

// ─── page ─────────────────────────────────────────────────────────────────────

export default function EditPage({ params }) {
  const { username } = params;

  const [card, setCard] = useState(null);
  const [loadError, setLoadError] = useState(false);

  // Verification
  const [verified, setVerified] = useState(false);
  const [verifyPhone, setVerifyPhone] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // Edit fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [templateId, setTemplateId] = useState("classic-dark");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const imgInputRef = useRef(null);

  useEffect(() => {
    supabase
      .from("cards")
      .select("*")
      .eq("username", username)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setLoadError(true);
        } else {
          setCard(data);
          setName(data.name || "");
          setPhone(data.phone || "");
          setBio(data.bio || "");
          setTemplateId(data.template || "classic-dark");
          setImagePreview(data.image_url || null);
        }
      });
  }, [username]);

  function handleVerify() {
    const entered = convertPhone(verifyPhone);
    const stored = card?.phone || "";
    if (entered === stored) {
      setVerified(true);
      setVerifyError("");
    } else {
      setVerifyError("Phone number doesn't match this card. Try again.");
    }
  }

  async function handleImage(e) {
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
      setImageFile(compressed);
      setImagePreview(dataUrl);
    } catch (err) {
      console.error("Compression error:", err);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      let imageUrl = card.image_url;
      if (imageFile) {
        const ext = imageFile.type === "image/png" ? "png" : "jpg";
        const path = `${username}.${ext}`;
        await supabase.storage
          .from("card-images")
          .upload(path, imageFile, { contentType: imageFile.type, upsert: true });
        const { data: urlData } = supabase.storage
          .from("card-images")
          .getPublicUrl(path);
        imageUrl = urlData?.publicUrl ?? imageUrl;
      }

      const { error } = await supabase
        .from("cards")
        .update({ name, bio, phone: phone || null, template: templateId, image_url: imageUrl })
        .eq("username", username);

      if (error) throw error;
      setSaved(true);
      setCard((c) => ({ ...c, name, bio, phone, template: templateId, image_url: imageUrl }));
    } catch (err) {
      setSaveError(err?.message || "Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── loading / error ──────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 text-center" style={{ background: "#080808" }}>
        <div className="text-4xl mb-3">👻</div>
        <h1 className="font-heading text-xl font-bold text-white mb-2">Card not found</h1>
        <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
          We couldn't find a card at this URL.
        </p>
        <Link href="/find" className="font-semibold px-6 py-3 rounded-xl text-sm text-white" style={{ background: "#EC4899" }}>
          Find my card
        </Link>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#EC4899] border-t-transparent animate-spin" />
      </main>
    );
  }

  // ── verify ownership ─────────────────────────────────────────────────────────

  if (!verified) {
    return (
      <main className="min-h-screen" style={{ background: "#080808", overflowX: "hidden" }}>
        <div className="max-w-lg mx-auto px-5 pt-16 pb-24">
          <Link href={`/${username}`} className="inline-flex items-center gap-1.5 text-sm mb-8" style={{ color: "#94A3B8" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to card
          </Link>

          <h1 className="font-heading text-2xl font-bold text-white mb-1">Edit your card</h1>
          <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
            Enter the phone number on this card to verify it's yours.
          </p>

          <div className="flex flex-col gap-4">
            <input
              className={inputCls}
              type="tel"
              placeholder="0244 123 456"
              value={verifyPhone}
              onChange={(e) => { setVerifyPhone(e.target.value); setVerifyError(""); }}
            />
            {verifyError && (
              <p className="text-xs" style={{ color: "#f87171" }}>{verifyError}</p>
            )}
            <button
              onClick={handleVerify}
              disabled={!verifyPhone.trim()}
              className="w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 active:scale-[0.98]"
              style={{
                background: verifyPhone.trim()
                  ? "linear-gradient(135deg, #EC4899 0%, #db2777 100%)"
                  : "rgba(255,255,255,0.06)",
                color: verifyPhone.trim() ? "#fff" : "rgba(255,255,255,0.22)",
                cursor: verifyPhone.trim() ? "pointer" : "not-allowed",
                boxShadow: verifyPhone.trim() ? "0 6px 24px rgba(236,72,153,0.32)" : "none",
              }}
            >
              Verify &amp; Edit
            </button>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: "rgba(148,163,184,0.4)" }}>
            Forgot your number?{" "}
            <Link href="/find" style={{ color: "rgba(236,72,153,0.6)" }}>Find your card</Link>
          </p>
        </div>
        <footer className="text-center py-6 text-xs" style={{ color: "rgba(148,163,184,0.3)" }}>
          Made with SimoForge ⚡
        </footer>
      </main>
    );
  }

  // ── edit form ────────────────────────────────────────────────────────────────

  if (saved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 text-center" style={{ background: "#080808" }}>
        <div className="text-5xl mb-4">✅</div>
        <h1 className="font-heading text-2xl font-bold text-white mb-2">Card updated!</h1>
        <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>Your changes are live.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href={`/${username}`} className="w-full py-3.5 rounded-xl font-semibold text-white text-sm text-center transition-all" style={{ background: "#EC4899" }}>
            View my card
          </Link>
          <button onClick={() => setSaved(false)} className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all" style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}>
            Edit again
          </button>
        </div>
      </main>
    );
  }

  const isGroup = card.type === "group";

  return (
    <main className="min-h-screen" style={{ background: "#080808", overflowX: "hidden" }}>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
          width: "120%", height: "100%",
          background: "radial-gradient(ellipse at center, rgba(236,72,153,0.09) 0%, transparent 70%)",
        }} />
      </div>
      <div className="relative z-10 max-w-lg mx-auto px-5 pt-14 pb-28">
        <Link href={`/${username}`} className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: "#94A3B8" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to card
        </Link>

        <h1 className="font-heading text-2xl font-bold text-white mb-1">Edit card</h1>
        <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
          Changes go live immediately.
        </p>

        <div className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
              {isGroup ? "Group name" : "Name or nickname"}
            </label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          {/* Phone — personal only */}
          {!isGroup && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>WhatsApp number</label>
              <input className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 244 123 456" />
            </div>
          )}

          {/* Profile picture */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
              {isGroup ? "Group picture" : "Profile picture"}
            </label>
            {imagePreview ? (
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => imgInputRef.current?.click()}>
                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" style={{ border: "2px solid #EC4899" }} />
                <div>
                  <p className="text-sm text-white font-medium">Photo uploaded ✓</p>
                  <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Tap to change</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => imgInputRef.current?.click()}
                className="w-full py-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                style={{ background: "#0d0d0d", border: "2px dashed rgba(255,255,255,0.1)" }}
              >
                <span className="text-sm" style={{ color: "#94A3B8" }}>Upload new photo</span>
              </div>
            )}
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>Bio</label>
            <BioGrid
              selected={bio}
              onSelect={setBio}
              mode={card.mode || "friendly"}
            />
            <textarea
              className={`${inputCls} resize-none mt-3`}
              rows={3}
              placeholder="Or write your own bio..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>Template</label>
            <div className="grid grid-cols-3 gap-2">
              {FREE_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className="py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: templateId === t.id ? "rgba(236,72,153,0.12)" : "#111111",
                    border: templateId === t.id ? "1.5px solid #EC4899" : "1px solid rgba(255,255,255,0.08)",
                    color: templateId === t.id ? "#EC4899" : "#94A3B8",
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {saveError && (
            <p className="text-xs text-center" style={{ color: "#f87171" }}>{saveError}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 active:scale-[0.98]"
            style={{
              background: saving || !name.trim()
                ? "rgba(255,255,255,0.06)"
                : "linear-gradient(135deg, #EC4899 0%, #db2777 100%)",
              color: saving || !name.trim() ? "rgba(255,255,255,0.22)" : "#fff",
              cursor: saving || !name.trim() ? "not-allowed" : "pointer",
              boxShadow: saving || !name.trim() ? "none" : "0 6px 24px rgba(236,72,153,0.32)",
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <footer className="text-center py-6 text-xs" style={{ color: "rgba(148,163,184,0.3)" }}>
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
