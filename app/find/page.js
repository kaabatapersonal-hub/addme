"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function convertPhone(raw) {
  let n = raw.replace(/[\s\-\(\)\.]/g, "");
  if (n.startsWith("+233")) n = n.slice(1);
  else if (n.startsWith("0")) n = "233" + n.slice(1);
  return n;
}


export default function FindPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cards, setCards] = useState([]);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const displayBase = baseUrl.replace(/^https?:\/\//, "");

  async function handleFind(e) {
    e?.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const converted = convertPhone(phone);
      // Build alternate formats so existing cards with raw phones are also found
      const raw = phone.trim().replace(/[\s\-\(\)\.]/g, "");
      const local = raw.startsWith("233") ? "0" + raw.slice(3) : raw;
      const intl = "+" + converted;

      const { data } = await supabase
        .from("cards")
        .select("username, name, bio, image_url, views, type, created_at")
        .in("phone", [converted, raw, local, intl])
        .order("created_at", { ascending: false });
      setCards(data || []);
      setSearched(true);
    } catch {
      setCards([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-page)", overflowX: "hidden" }}>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
          width: "120%", height: "100%",
          background: "radial-gradient(ellipse at center, rgba(236,72,153,0.09) 0%, transparent 70%)",
        }} />
      </div>
      <div className="relative z-10 max-w-lg mx-auto px-5 pt-14 pb-24">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: "var(--fg-muted)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </Link>

        <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
          Find my card 🔍
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--fg-muted)" }}>
          Enter the phone number you used when creating your card.
        </p>

        <form onSubmit={handleFind} className="flex flex-col gap-4">
          <input
            className="addme-input"
            type="tel"
            placeholder="0244 123 456 or +233244123456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 active:scale-[0.98]"
            style={{
              background: loading || !phone.trim()
                ? "rgba(255,255,255,0.06)"
                : "linear-gradient(135deg, #EC4899 0%, #db2777 100%)",
              color: loading || !phone.trim() ? "rgba(255,255,255,0.22)" : "#ffffff",
              cursor: loading || !phone.trim() ? "not-allowed" : "pointer",
              boxShadow: loading || !phone.trim() ? "none" : "0 6px 24px rgba(236,72,153,0.32)",
            }}
          >
            {loading ? "Searching..." : "Find my card"}
          </button>
        </form>

        {/* Results */}
        {searched && (
          <div className="mt-8">
            {cards.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🤔</div>
                <p className="font-semibold mb-1" style={{ color: "var(--fg)" }}>No card found</p>
                <p className="text-sm mb-6" style={{ color: "var(--fg-muted)" }}>
                  No card was created with that number.
                </p>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-xl text-sm transition-all"
                  style={{ background: "#EC4899" }}
                >
                  Create your card free →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
                  {cards.length === 1 ? "Found your card:" : `Found ${cards.length} cards:`}
                </p>
                {cards.map((card) => {
                  const initial = (card.name || "?").charAt(0).toUpperCase();
                  const cardUrl = `${displayBase}/${card.username}`;
                  return (
                    <div
                      key={card.username}
                      className="rounded-2xl p-4 flex items-center gap-4"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 overflow-hidden"
                        style={{
                          background: card.image_url
                            ? "transparent"
                            : "linear-gradient(135deg, #EC4899 0%, #9d174d 100%)",
                          overflow: "hidden",
                        }}
                      >
                        {card.image_url ? (
                          <img
                            src={card.image_url}
                            alt={card.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          initial
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--fg)" }}>
                          {card.name}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate font-mono"
                          style={{ color: "var(--fg-muted)" }}
                        >
                          {cardUrl}
                        </p>
                        {card.views > 0 && (
                          <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
                            👁 {card.views.toLocaleString()} views
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <Link
                          href={`/${card.username}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: "rgba(236,72,153,0.12)",
                            color: "#EC4899",
                            border: "1px solid rgba(236,72,153,0.25)",
                          }}
                        >
                          View
                        </Link>
                        <Link
                          href={`/edit/${card.username}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all text-center"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "#94A3B8",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <footer
        className="text-center py-6 text-xs"
        style={{ color: "var(--fg-dim)" }}
      >
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
