import { convertPhone } from "@/lib/utils";

const MILESTONES = [10, 50, 100, 500, 1000, 5000];

export function getMilestoneHit(prevViews, newViews) {
  return MILESTONES.find((m) => newViews >= m && prevViews < m) ?? null;
}

const MESSAGES = {
  10:   (name, url) => `🎉 Hey ${name}! Your AddMe card just hit *10 views*. People are checking you out!\n\nKeep sharing your link to get more adds 👇\n${url}`,
  50:   (name, url) => `🔥 *50 people* have viewed your AddMe card, ${name}! You're getting popular.\n\nShare again to keep the momentum 👇\n${url}`,
  100:  (name, url) => `💯 *100 views!* ${name}, your card is doing numbers 🚀\n\nPost it on your status again — the adds will keep coming 👇\n${url}`,
  500:  (name, url) => `🚀 *500 views, ${name}!* Your AddMe card is going viral. Time to share again.\n\n👇\n${url}`,
  1000: (name, url) => `👑 *1,000 views!* ${name}, you're an AddMe legend. Celebrate by sharing again 🎊\n\n${url}`,
  5000: (name, url) => `🏆 *5,000 views!* ${name}, you're in the top tier on AddMe. Incredible.\n\n${url}`,
};

function formatPhone(raw) {
  const n = convertPhone(raw);
  return n.length >= 10 ? n : null;
}

export async function sendViewMilestoneNotification(card, milestone, baseUrl) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const cardUrl = `${(baseUrl || "https://addme-app-silk.vercel.app").replace(/\/$/, "")}/${card.username}`;

  const phone = formatPhone(card.phone);
  if (!phone) return;

  const body = (MESSAGES[milestone] ?? ((n, u) => `Your AddMe card hit ${milestone} views! 🎉\n${u}`))(card.name, cardUrl);

  if (!token || !phoneId) {
    // Not configured — log so developer can see it's working
    console.log(`[AddMe Notify] Milestone ${milestone} for @${card.username} → would send to ${phone}:\n${body}`);
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body, preview_url: false },
      }),
    });
    if (!res.ok) console.error("[AddMe Notify] WhatsApp API error:", await res.text());
  } catch (err) {
    console.error("[AddMe Notify] fetch error:", err);
  }
}
