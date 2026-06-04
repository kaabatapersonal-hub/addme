"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function convertForWa(raw) {
  const n = (raw || "").replace(/[\s\-\(\)\+\.]/g, "");
  if (n.startsWith("233")) return n;
  if (n.startsWith("0")) return "233" + n.slice(1);
  return n;
}

function WAIcon() {
  return (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function CardTile({ card }) {
  const isGroup = card.type === "group";
  const initial = (card.name || "?").charAt(0).toUpperCase();
  const waHref = isGroup
    ? card.group_link
    : `https://wa.me/${convertForWa(card.phone || "")}`;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)",
      }}
    >
      {/* Photo / avatar area */}
      <Link href={`/${card.username}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            height: 120,
            background: card.image_url
              ? "transparent"
              : "linear-gradient(135deg, #EC4899 0%, #9d174d 100%)",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}
        >
          {card.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.image_url}
              alt={card.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          ) : (
            <span style={{ color: "#fff", fontSize: 40, fontWeight: 700 }}>{initial}</span>
          )}
          {isGroup && (
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
              borderRadius: 100, padding: "3px 8px",
              fontSize: 10, fontWeight: 700, color: "#fff",
            }}>
              Group
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link href={`/${card.username}`} style={{ textDecoration: "none" }}>
          <p className="font-bold text-[13px] leading-tight truncate" style={{ color: "var(--fg)" }}>
            {card.name}
          </p>
        </Link>

        {card.bio && (
          <p
            className="text-[11px] leading-relaxed"
            style={{
              color: "var(--fg-muted)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {card.bio}
          </p>
        )}

        {card.views > 0 && (
          <p className="text-[10px]" style={{ color: "var(--fg-dim)" }}>
            👁 {card.views.toLocaleString()} views
          </p>
        )}

        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-bold text-white transition-all active:scale-95"
            style={{ background: "#25D366", textDecoration: "none", boxShadow: "0 2px 10px rgba(37,211,102,0.3)" }}
          >
            <WAIcon />
            {isGroup ? "Join Group" : "Add on WhatsApp"}
          </a>
        )}
      </div>
    </div>
  );
}

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("cards")
      .select("username, name, bio, image_url, type, phone, group_link, views, created_at")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => {
        setCards(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = search.trim()
    ? cards.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.bio?.toLowerCase().includes(search.toLowerCase())
      )
    : cards;

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-page)", overflowX: "hidden" }}>
      {/* Gradient top */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "100%",
          background: "linear-gradient(to bottom, rgba(236,72,153,0.07) 0%, transparent 100%)",
        }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 pt-14 pb-28">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition-opacity hover:opacity-70"
            style={{ color: "var(--fg-muted)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>

          <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: "var(--fg)" }}>
            Discover People 🌍
          </h1>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Find new friends and add them on WhatsApp instantly
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4" style={{ color: "var(--fg-dim)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            className="addme-input"
            style={{ paddingLeft: 44 }}
            placeholder="Search by name or bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ height: 200, background: "var(--bg-card)", border: "1px solid var(--border)", opacity: 0.5 }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🤷</div>
            <p className="font-semibold" style={{ color: "var(--fg)" }}>
              {search ? "No results found" : "No cards yet"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--fg-muted)" }}>
              {search ? "Try a different name" : "Be the first to create one!"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: "var(--fg-dim)" }}>
              {filtered.length} {filtered.length === 1 ? "person" : "people"} found
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((card) => (
                <CardTile key={card.username} card={card} />
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm mb-3" style={{ color: "var(--fg-muted)" }}>
            Want to appear here?
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 font-bold text-white px-8 py-4 rounded-2xl text-[15px] transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #EC4899 0%, #db2777 100%)",
              boxShadow: "0 6px 24px rgba(236,72,153,0.32)",
            }}
          >
            ✨ Create your AddMe card
          </Link>
        </div>
      </div>

      <footer className="text-center py-6 text-xs" style={{ color: "var(--fg-dim)" }}>
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
