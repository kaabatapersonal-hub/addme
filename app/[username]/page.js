import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Properly converts Ghanaian phone numbers to wa.me format
function convertForWa(raw) {
  const n = (raw || "").replace(/[\s\-\(\)\+\.]/g, "");
  if (n.startsWith("233")) return n;
  if (n.startsWith("0")) return "233" + n.slice(1);
  return n;
}

export async function generateMetadata({ params }) {
  const supabase = getSupabase();
  const { data: card } = await supabase
    .from("cards")
    .select("name, bio, image_url, type")
    .eq("username", params.username)
    .single();

  if (!card) {
    return { title: "Card not found — AddMe", description: "This AddMe card doesn't exist." };
  }

  const isGroup = card.type === "group";
  const title = isGroup ? `Join ${card.name}'s WhatsApp Group` : `Add ${card.name} on WhatsApp`;
  const description = card.bio || (isGroup ? `Join ${card.name} on WhatsApp` : `Add ${card.name} on WhatsApp instantly.`);

  return {
    title: `${title} — AddMe`,
    description,
    openGraph: {
      title, description, type: "website",
      images: card.image_url ? [{ url: card.image_url, width: 500, height: 500, alt: card.name }] : [],
    },
    twitter: { card: "summary", title, description, images: card.image_url ? [card.image_url] : [] },
  };
}

export const dynamic = "force-dynamic";

function WAIcon() {
  return (
    <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function NotFound() {
  return (
    <main style={{ background: "#080808", minHeight: "100vh" }} className="flex flex-col items-center justify-center px-5 text-center">
      <div className="mb-6 text-5xl">👻</div>
      <h1 className="font-heading text-2xl font-bold text-white mb-3">This card doesn't exist</h1>
      <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
        The link may be wrong or the card has been removed.
      </p>
      <Link href="/create" className="inline-flex items-center gap-2 font-semibold text-white px-7 py-3.5 rounded-xl text-[15px]"
        style={{ background: "#EC4899" }}>
        Create your own card free →
      </Link>
    </main>
  );
}

export default async function CardPage({ params }) {
  const { username } = params;
  const supabase = getSupabase();

  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !card) return <NotFound />;

  supabase.from("cards").update({ views: (card.views ?? 0) + 1 }).eq("username", username).then(() => {});

  const isGroup = card.type === "group";
  const displayName = card.name || "Unknown";
  const initial = displayName.charAt(0).toUpperCase();
  const btnLabel = isGroup ? "Join our WhatsApp Group" : "Add me on WhatsApp";

  const waHref = isGroup
    ? card.group_link
    : `https://wa.me/${convertForWa(card.phone || "")}`;

  const hasImage = Boolean(card.image_url);

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "#0a0a0a" }}>

      {/* Full-screen background */}
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image_url}
          alt={displayName}
          style={{
            position: "fixed", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
          }}
        />
      ) : (
        <div style={{
          position: "fixed", inset: 0,
          background: "linear-gradient(160deg, #1a0533 0%, #6D28D9 55%, #EC4899 100%)",
        }} />
      )}

      {/* Gradient overlay — heavier at bottom for text readability */}
      <div style={{
        position: "fixed", inset: 0,
        background: hasImage
          ? "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.96) 100%)"
          : "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)",
      }} />

      {/* Views badge — top left */}
      {card.views > 0 && (
        <div style={{
          position: "fixed", top: 18, left: 18, zIndex: 50,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 100, padding: "6px 14px",
          color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600,
        }}>
          👁 {card.views.toLocaleString()} view{card.views !== 1 ? "s" : ""}
        </div>
      )}

      {/* Content — pinned to bottom */}
      <div style={{
        position: "relative", zIndex: 10,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 20px 48px",
      }}>

        {/* No-image avatar */}
        {!hasImage && (
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "3px solid rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 42, fontWeight: 700, color: "#fff",
              margin: "0 auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}>
              {initial}
            </div>
          </div>
        )}

        {/* Name */}
        <h1 style={{
          color: "#fff", fontWeight: 800,
          fontSize: "clamp(1.8rem, 7vw, 2.4rem)",
          lineHeight: 1.15, marginBottom: 8,
          textShadow: "0 2px 16px rgba(0,0,0,0.4)",
        }}>
          {displayName}
        </h1>

        {/* Bio */}
        {card.bio && (
          <p style={{
            color: "rgba(255,255,255,0.78)",
            fontSize: 15, lineHeight: 1.6,
            marginBottom: 26,
            textShadow: "0 1px 8px rgba(0,0,0,0.35)",
            maxWidth: 320,
          }}>
            {card.bio}
          </p>
        )}

        {/* WhatsApp CTA */}
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: "#25D366",
              color: "#fff", borderRadius: 20,
              padding: "18px 0", fontWeight: 700, fontSize: 17,
              marginBottom: 12,
              boxShadow: "0 8px 32px rgba(37,211,102,0.5)",
              textDecoration: "none",
            }}
          >
            <WAIcon />
            {btnLabel}
          </a>
        )}

        {/* Glass growth CTA */}
        <Link href="/create" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.14)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.22)",
          color: "#fff", borderRadius: 20,
          padding: "15px 0", fontWeight: 600, fontSize: 15,
          marginBottom: 20, textDecoration: "none",
        }}>
          ✨ Create your own card — free
        </Link>

        {/* Edit / Find */}
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          Is this your card?{" "}
          <Link href={`/edit/${card.username}`} style={{ color: "rgba(255,255,255,0.58)", textDecoration: "none" }}>
            Edit it
          </Link>
          {" · "}
          <Link href="/find" style={{ color: "rgba(255,255,255,0.58)", textDecoration: "none" }}>
            Find your card
          </Link>
        </p>
      </div>

      <footer style={{
        position: "relative", zIndex: 10,
        textAlign: "center", padding: "12px 0 20px",
        fontSize: 11, color: "rgba(255,255,255,0.18)",
      }}>
        Made with SimoForge ⚡
      </footer>
    </main>
  );
}
