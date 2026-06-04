"use client";
import { useState } from "react";

export function ShareButton({ url, name }) {
  const [state, setState] = useState("idle"); // idle | copied

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Add ${name} on WhatsApp`,
          text: `Check out ${name}'s AddMe card!`,
          url,
        });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return; // user cancelled — do nothing
      }
    }
    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setState("copied");
    setTimeout(() => setState("idle"), 2200);
  }

  return (
    <button
      onClick={handleShare}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: "100%",
        background: state === "copied" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.14)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        border: state === "copied" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.22)",
        color: state === "copied" ? "#10B981" : "#fff",
        borderRadius: 20, padding: "15px 0",
        fontWeight: 600, fontSize: 15,
        marginBottom: 12, cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {state === "copied" ? (
        <>✓ Link copied!</>
      ) : (
        <>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share this card
        </>
      )}
    </button>
  );
}
