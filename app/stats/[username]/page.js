"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

const MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000];

function getNextMilestone(views) {
  return MILESTONES.find((m) => m > views) ?? null;
}
function getPrevMilestone(views) {
  const passed = MILESTONES.filter((m) => m <= views);
  return passed.length > 1 ? passed[passed.length - 2] : 0;
}

function MilestoneBar({ views }) {
  const next = getNextMilestone(views);
  const prev = getPrevMilestone(views);
  if (!next) {
    return (
      <p className="text-sm font-semibold" style={{ color: "#EC4899" }}>
        🏆 You've reached every milestone!
      </p>
    );
  }
  const pct = Math.min(100, Math.round(((views - prev) / (next - prev)) * 100));
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
        <span>{views.toLocaleString()} views</span>
        <span>Next: {next.toLocaleString()} views</span>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 100, width: `${pct}%`,
          background: "linear-gradient(90deg, #a855f7, #EC4899)",
          transition: "width 1s ease",
        }} />
      </div>
      <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
        {(next - views).toLocaleString()} more views to reach {next.toLocaleString()} 🚀
      </p>
    </div>
  );
}

function ShareButtons({ cardUrl, name }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = `${name}'s AddMe card — tap to add them on WhatsApp: ${cardUrl}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Add ${name} on WhatsApp`, text, url: cardUrl });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(cardUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  async function handleInvite() {
    const text = `I got ${name}'s AddMe card — you can add them on WhatsApp with one tap 🔥\n\n${cardUrl}\n\nMake your own free at addme.app 👇`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ text }); return; } catch (e) { if (e?.name === "AbortError") return; }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleShare}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{ background: "#EC4899", color: "#fff" }}
      >
        {copied ? "✓ Link copied!" : (
          <>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share card to get more views
          </>
        )}
      </button>
      <button
        onClick={handleInvite}
        className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.7)" }}
      >
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Invite a friend to AddMe
      </button>
    </div>
  );
}

export default function StatsPage({ params }) {
  const { username } = params;
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase()
      .from("cards")
      .select("username, name, bio, image_url, image_position, views, created_at, type")
      .eq("username", username)
      .single()
      .then(({ data }) => {
        setCard(data);
        setLoading(false);
      });
  }, [username]);

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://addme-app-silk.vercel.app").replace(/\/$/, "");
  const cardUrl = `${baseUrl}/${username}`;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(236,72,153,0.3)", borderTopColor: "#EC4899", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  if (!card) {
    return (
      <main style={{ minHeight: "100vh", background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👻</div>
        <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Card not found</h1>
        <Link href="/create" style={{ color: "#EC4899", fontSize: 14 }}>Create your card →</Link>
      </main>
    );
  }

  const views = card.views ?? 0;
  const daysActive = Math.max(1, Math.floor((Date.now() - new Date(card.created_at).getTime()) / 86400000));
  const avgPerDay = (views / daysActive).toFixed(1);

  return (
    <main style={{ minHeight: "100vh", background: "#080808", overflowX: "hidden" }}>

      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(236,72,153,0.12) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 480, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* Back link */}
        <div style={{ paddingTop: 52, marginBottom: 28 }}>
          <Link href={`/${username}`} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none", fontWeight: 500,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            View card
          </Link>
        </div>

        {/* Card mini-header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
            background: card.image_url ? "#111" : "linear-gradient(135deg, #7c3aed, #EC4899)",
            border: "2px solid rgba(255,255,255,0.12)",
          }}>
            {card.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.image_url} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: card.image_position || "center" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff" }}>
                {(card.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>{card.name}</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>addme.app/{username}</p>
          </div>
        </div>

        {/* Big view counter */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, padding: "32px 24px 28px",
          marginBottom: 16, textAlign: "center",
        }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Total views
          </p>
          <p style={{
            color: "#fff", fontWeight: 800, lineHeight: 1,
            fontSize: "clamp(3.5rem, 15vw, 5rem)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {views.toLocaleString()}
          </p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 10 }}>
            Active {daysActive} {daysActive === 1 ? "day" : "days"} · avg {avgPerDay} views/day
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Days active", value: daysActive },
            { label: "Avg / day", value: avgPerDay },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18, padding: "18px 16px", textAlign: "center",
            }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.1 }}>{s.value}</p>
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, marginTop: 6 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Milestone progress */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "20px 20px",
          marginBottom: 28,
        }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Milestone progress
          </p>
          <MilestoneBar views={views} />
        </div>

        {/* Share to boost */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Boost your views
          </p>
          <ShareButtons cardUrl={cardUrl} name={card.name} />
        </div>

        {/* Tip */}
        <div style={{
          background: "rgba(236,72,153,0.08)",
          border: "1px solid rgba(236,72,153,0.18)",
          borderRadius: 16, padding: "14px 16px",
          display: "flex", gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.6 }}>
            <strong style={{ color: "rgba(255,255,255,0.8)" }}>Pro tip:</strong> Post your card on your WhatsApp Status every 3 days for consistent adds. Stories expire in 24 hours — keep showing up.
          </p>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 32, letterSpacing: "0.05em" }}>
          © AddMe · Made with SimoForge ⚡
        </p>
      </div>
    </main>
  );
}
