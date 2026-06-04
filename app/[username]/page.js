import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// Fresh client per request — avoids stale singleton state in server components
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ─── OG metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const supabase = getSupabase();
  const { data: card } = await supabase
    .from("cards")
    .select("name, bio, image_url, type")
    .eq("username", params.username)
    .single();

  if (!card) {
    return {
      title: "Card not found — AddMe",
      description: "This AddMe card doesn't exist.",
    };
  }

  const isGroup = card.type === "group";
  const title = isGroup
    ? `Join ${card.name}'s WhatsApp Group`
    : `Add ${card.name} on WhatsApp`;
  const description =
    card.bio ||
    (isGroup
      ? `Join ${card.name} on WhatsApp`
      : `Add ${card.name} on WhatsApp instantly. Tap to connect.`);

  return {
    title: `${title} — AddMe`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: card.image_url
        ? [{ url: card.image_url, width: 500, height: 500, alt: card.name }]
        : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: card.image_url ? [card.image_url] : [],
    },
  };
}

// Force server render on every request so views always increment
export const dynamic = "force-dynamic";

// ─── WhatsApp icon ────────────────────────────────────────────────────────────

function WAIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="currentColor"
      viewBox="0 0 24 24"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── not found state ──────────────────────────────────────────────────────────

function NotFound() {
  return (
    <main
      style={{ background: "#080808", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center px-5 text-center"
    >
      <div className="mb-6 text-5xl">👻</div>
      <h1 className="font-heading text-2xl font-bold text-white mb-3">
        This card doesn't exist
      </h1>
      <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
        The link may be wrong or the card has been removed.
      </p>
      <Link
        href="/create"
        className="inline-flex items-center gap-2 font-semibold text-white px-7 py-3.5 rounded-xl text-[15px] transition-all duration-200 active:scale-[0.98]"
        style={{ background: "#EC4899" }}
      >
        Create your own card free →
      </Link>
      <footer
        className="absolute bottom-8 text-xs"
        style={{ color: "rgba(148,163,184,0.35)" }}
      >
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function CardPage({ params }) {
  const { username } = params;
  const supabase = getSupabase();

  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !card) {
    return <NotFound />;
  }

  // Increment views (fire-and-forget — don't block render)
  supabase
    .from("cards")
    .update({ views: (card.views ?? 0) + 1 })
    .eq("username", username)
    .then(() => {});

  const isGroup = card.type === "group";
  const displayName = card.name || "Unknown";
  const initial = displayName.charAt(0).toUpperCase();

  // Build WhatsApp link
  const waHref = isGroup
    ? card.group_link
    : `https://wa.me/${(card.phone || "").replace(/[\s+\-()]/g, "")}`;

  const btnLabel = isGroup ? "Join our WhatsApp Group" : "Add me on WhatsApp";

  return (
    <main style={{ background: "#080808", minHeight: "100vh" }} className="relative flex flex-col items-center px-5 pb-24 overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-x-0 top-0 h-72 pointer-events-none">
        <div style={{
          position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
          width: "140%", height: "100%",
          background: "radial-gradient(ellipse at center, rgba(236,72,153,0.14) 0%, rgba(168,85,247,0.06) 45%, transparent 72%)",
        }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center pt-16 gap-0">

        {/* Avatar */}
        <div style={{
          width: 110, height: 110, borderRadius: "50%",
          border: "3px solid #EC4899",
          boxShadow: "0 0 0 6px rgba(236,72,153,0.1), 0 0 40px rgba(236,72,153,0.3)",
          overflow: "hidden",
          background: "linear-gradient(135deg, #EC4899 0%, #9d174d 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {card.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image_url} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#ffffff", fontSize: 46, fontWeight: 700, lineHeight: 1, fontFamily: "var(--font-geist-sans), sans-serif" }}>
              {initial}
            </span>
          )}
        </div>

        {/* Name + bio */}
        <div className="text-center mt-5 mb-6">
          <h1 className="font-heading font-bold text-white leading-tight" style={{ fontSize: 30 }}>
            {displayName}
          </h1>
          {card.bio && (
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "#94A3B8", maxWidth: 270, margin: "12px auto 0" }}>
              {card.bio}
            </p>
          )}
        </div>

        {/* WhatsApp CTA */}
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 font-bold text-white rounded-2xl transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "#25D366",
              padding: "17px 0", fontSize: 16,
              boxShadow: "0 8px 28px rgba(37,211,102,0.35)",
            }}
          >
            <WAIcon />
            {btnLabel}
          </a>
        )}

        {/* Views */}
        {card.views > 0 && (
          <p className="text-xs mt-4" style={{ color: "rgba(148,163,184,0.4)" }}>
            👁 {card.views.toLocaleString()} view{card.views !== 1 ? "s" : ""}
          </p>
        )}

        {/* Growth loop */}
        <div className="w-full mt-8">
          <div className="w-full h-px mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />

          <Link
            href="/create"
            className="w-full flex items-center justify-center gap-2 font-bold text-white rounded-2xl transition-all duration-200 active:scale-[0.97] mb-3"
            style={{
              background: "linear-gradient(135deg, #EC4899 0%, #db2777 100%)",
              padding: "15px 0", fontSize: 15,
              boxShadow: "0 6px 22px rgba(236,72,153,0.3)",
            }}
          >
            ✨ Create your own card — free
          </Link>

          <p className="text-center text-xs" style={{ color: "rgba(148,163,184,0.35)" }}>
            Is this your card?{" "}
            <Link href={`/edit/${card.username}`} style={{ color: "rgba(236,72,153,0.55)" }}>
              Edit it
            </Link>
            {" · "}
            <Link href="/find" style={{ color: "rgba(236,72,153,0.55)" }}>
              Find your card
            </Link>
          </p>
        </div>
      </div>

      <footer className="mt-auto pt-16 text-xs" style={{ color: "rgba(148,163,184,0.28)" }}>
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
