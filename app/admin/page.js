"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { verifyAdmin, getAllCards, setFeatured, setPromoted, boostViews, deleteCard } from "@/lib/admin-actions";

const WEEK_OPTIONS = [
  { label: "1 week", weeks: 1 },
  { label: "2 weeks", weeks: 2 },
  { label: "1 month", weeks: 4 },
  { label: "3 months", weeks: 13 },
];

function timeLeft(until) {
  if (!until) return null;
  const ms = new Date(until) - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / 86400000);
  if (days > 6) return `${Math.floor(days / 7)}w left`;
  return `${days}d left`;
}

function StatPill({ label, value, color }) {
  return (
    <div className="text-center px-5 py-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p style={{ color: color || "#fff", fontWeight: 800, fontSize: "1.6rem", lineHeight: 1 }}>{value}</p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 6 }}>{label}</p>
    </div>
  );
}

function CardRow({ card, adminKey, onUpdate, onDelete }) {
  const [isPending, startTransition] = useTransition();
  const [promWeeks, setPromWeeks] = useState(1);
  const [boostAmt, setBoostAmt] = useState(10);
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isExpired = card.promoted_until && new Date(card.promoted_until) < new Date();
  const activePromo = card.is_promoted && !isExpired;

  function flash(text) {
    setMsg(text);
    setTimeout(() => setMsg(""), 2000);
  }

  function toggleFeatured() {
    startTransition(async () => {
      const res = await setFeatured(card.username, !card.is_featured, adminKey);
      if (res.ok) { flash(card.is_featured ? "Unfeatured" : "Featured ✓"); onUpdate(); }
      else flash("Error: " + res.error);
    });
  }

  function togglePromoted() {
    startTransition(async () => {
      const res = await setPromoted(card.username, !activePromo, promWeeks, adminKey);
      if (res.ok) { flash(activePromo ? "Promotion removed" : `Promoted for ${promWeeks}w ✓`); onUpdate(); }
      else flash("Error: " + res.error);
    });
  }

  function handleBoost() {
    startTransition(async () => {
      const res = await boostViews(card.username, boostAmt, adminKey);
      if (res.ok) { flash(`+${boostAmt} views ✓`); onUpdate(); }
      else flash("Error: " + res.error);
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    startTransition(async () => {
      const res = await deleteCard(card.username, card.image_url, adminKey);
      if (res.ok) onDelete(card.username);
      else flash("Delete failed: " + res.error);
    });
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: activePromo
          ? "rgba(236,72,153,0.06)"
          : card.is_featured
          ? "rgba(168,85,247,0.06)"
          : "rgba(255,255,255,0.03)",
        border: activePromo
          ? "1px solid rgba(236,72,153,0.25)"
          : card.is_featured
          ? "1px solid rgba(168,85,247,0.22)"
          : "1px solid rgba(255,255,255,0.07)",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{
          width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          overflow: "hidden",
          background: card.image_url ? "#111" : "linear-gradient(135deg, #7c3aed, #EC4899)",
          border: "1.5px solid rgba(255,255,255,0.1)",
        }}>
          {card.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: card.image_position || "center" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>
              {(card.name || "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{card.name || "—"}</p>
            {card.is_featured && <span style={{ fontSize: 9, fontWeight: 800, color: "#a855f7", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 100, padding: "2px 7px", letterSpacing: "0.08em" }}>FEATURED</span>}
            {activePromo && <span style={{ fontSize: 9, fontWeight: 800, color: "#EC4899", background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 100, padding: "2px 7px", letterSpacing: "0.08em" }}>PROMOTED · {timeLeft(card.promoted_until)}</span>}
            {isExpired && card.is_promoted && <span style={{ fontSize: 9, fontWeight: 800, color: "#94A3B8", background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 100, padding: "2px 7px" }}>EXPIRED</span>}
          </div>
          <div className="flex items-center gap-3">
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>@{card.username}</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{card.type} · {card.views ?? 0} views</p>
          </div>
        </div>

        <a href={`/${card.username}`} target="_blank" rel="noopener noreferrer"
          style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, flexShrink: 0, textDecoration: "none" }}>
          View →
        </a>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {/* Feature toggle */}
        <button
          onClick={toggleFeatured}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: card.is_featured ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.06)",
            border: card.is_featured ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.1)",
            color: card.is_featured ? "#a855f7" : "rgba(255,255,255,0.45)",
          }}
        >
          {card.is_featured ? "★ Featured" : "☆ Feature"}
        </button>

        {/* Promote — weeks picker + toggle */}
        <div className="flex items-center gap-1.5">
          <select
            value={promWeeks}
            onChange={(e) => setPromWeeks(Number(e.target.value))}
            className="rounded-xl text-xs px-2 py-1.5 outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            {WEEK_OPTIONS.map((o) => (
              <option key={o.weeks} value={o.weeks}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={togglePromoted}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: activePromo ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.06)",
              border: activePromo ? "1px solid rgba(236,72,153,0.4)" : "1px solid rgba(255,255,255,0.1)",
              color: activePromo ? "#EC4899" : "rgba(255,255,255,0.45)",
            }}
          >
            {activePromo ? "⚡ Promoted" : "⚡ Promote"}
          </button>
        </div>

        {/* View boost */}
        <div className="flex items-center gap-1.5">
          <select
            value={boostAmt}
            onChange={(e) => setBoostAmt(Number(e.target.value))}
            className="rounded-xl text-xs px-2 py-1.5 outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            {[10, 25, 50, 100, 250, 500].map((n) => (
              <option key={n} value={n}>+{n}</option>
            ))}
          </select>
          <button
            onClick={handleBoost}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
          >
            👁 Boost
          </button>
        </div>

        {/* Delete — two-tap confirm */}
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ml-auto"
          style={{
            background: confirmDelete ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.04)",
            border: confirmDelete ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.08)",
            color: confirmDelete ? "#f87171" : "rgba(255,255,255,0.25)",
          }}
        >
          {confirmDelete ? "⚠️ Tap again to delete" : "🗑 Delete"}
        </button>
      </div>

      {msg && (
        <p className="text-xs mt-2 font-semibold" style={{ color: msg.startsWith("Error") ? "#f87171" : "#25D366" }}>
          {msg}
        </p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | featured | promoted
  const [adminKey, setAdminKey] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const res = await verifyAdmin(key);
    if (res.ok) {
      setAdminKey(key);
      setAuthed(true);
      fetchCards(key);
    } else {
      setAuthError("Wrong password. Try again.");
    }
    setAuthLoading(false);
  }

  async function fetchCards(k) {
    const res = await getAllCards(k || adminKey);
    if (res.data) setCards(res.data);
  }

  const filtered = cards.filter((c) => {
    const matchSearch = !search.trim() ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.username?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "featured" ? c.is_featured :
      filter === "promoted" ? c.is_promoted : true;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: cards.length,
    promoted: cards.filter(c => c.is_promoted && new Date(c.promoted_until) > new Date()).length,
    featured: cards.filter(c => c.is_featured).length,
    totalViews: cards.reduce((sum, c) => sum + (c.views ?? 0), 0),
  };

  if (!authed) {
    return (
      <main style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="text-center mb-8">
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
            <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>AddMe Admin</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Enter your admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Admin password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoFocus
              className="addme-input"
              style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
            />
            {authError && <p className="text-xs text-center" style={{ color: "#f87171" }}>{authError}</p>}
            <button
              type="submit"
              disabled={authLoading || !key}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all"
              style={{ background: "#EC4899", opacity: authLoading || !key ? 0.5 : 1 }}
            >
              {authLoading ? "Checking..." : "Enter"}
            </button>
          </form>
          <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.18)" }}>
            Set <code style={{ color: "rgba(255,255,255,0.3)" }}>ADMIN_KEY</code> in your Vercel env vars
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080808", overflowX: "hidden" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* Header */}
        <div style={{ paddingTop: 48, marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Admin Panel</h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>AddMe · SimoForge</p>
          </div>
          <Link href="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textDecoration: "none" }}>← Home</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <StatPill label="Total cards" value={stats.total} />
          <StatPill label="Promoted" value={stats.promoted} color="#EC4899" />
          <StatPill label="Featured" value={stats.featured} color="#a855f7" />
          <StatPill label="Total views" value={stats.totalViews >= 1000 ? `${(stats.totalViews/1000).toFixed(1)}k` : stats.totalViews} />
        </div>

        {/* Search + filter */}
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
            placeholder="Search name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => fetchCards()} style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, padding: "0 10px", background: "none", border: "none", cursor: "pointer" }} title="Refresh">↻</button>
        </div>

        <div className="flex gap-2 mb-5">
          {[["all", "All"], ["promoted", "⚡ Promoted"], ["featured", "★ Featured"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filter === val ? "#EC4899" : "rgba(255,255,255,0.05)",
                color: filter === val ? "#fff" : "rgba(255,255,255,0.45)",
                border: filter === val ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs self-center" style={{ color: "rgba(255,255,255,0.25)" }}>
            {filtered.length} card{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Card list */}
        <div className="flex flex-col gap-3">
          {filtered.map((card) => (
            <CardRow
              key={card.username}
              card={card}
              adminKey={adminKey}
              onUpdate={() => fetchCards()}
              onDelete={(username) => setCards((prev) => prev.filter((c) => c.username !== username))}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.25)" }}>
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm">No cards match this filter</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-10" style={{ color: "rgba(255,255,255,0.12)", letterSpacing: "0.05em" }}>
          © AddMe · Made with SimoForge ⚡
        </p>
      </div>
    </main>
  );
}
