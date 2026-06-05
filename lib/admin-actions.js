"use server";

import { getServerSupabase } from "@/lib/supabase-server";

function auth(key) {
  if (!process.env.ADMIN_KEY) return false;
  return key === process.env.ADMIN_KEY;
}

export async function verifyAdmin(key) {
  return auth(key) ? { ok: true } : { error: "Wrong password" };
}

export async function getAllCards(key) {
  if (!auth(key)) return { error: "Unauthorized" };
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("cards")
    .select("username, name, bio, image_url, image_position, type, mode, views, created_at, is_featured, is_promoted, promoted_until, phone")
    .order("created_at", { ascending: false });
  return error ? { error: error.message } : { data };
}

export async function setFeatured(username, value, key) {
  if (!auth(key)) return { error: "Unauthorized" };
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("cards")
    .update({ is_featured: value })
    .eq("username", username);
  return error ? { error: error.message } : { ok: true };
}

export async function setPromoted(username, value, weeks, key) {
  if (!auth(key)) return { error: "Unauthorized" };
  const supabase = getServerSupabase();
  const promotedUntil = value
    ? new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString()
    : null;
  const { error } = await supabase
    .from("cards")
    .update({ is_promoted: value, promoted_until: promotedUntil })
    .eq("username", username);
  return error ? { error: error.message } : { ok: true };
}

export async function boostViews(username, amount, key) {
  if (!auth(key)) return { error: "Unauthorized" };
  const supabase = getServerSupabase();
  const { data: card } = await supabase
    .from("cards")
    .select("views")
    .eq("username", username)
    .single();
  if (!card) return { error: "Card not found" };
  const { error } = await supabase
    .from("cards")
    .update({ views: (card.views ?? 0) + amount })
    .eq("username", username);
  return error ? { error: error.message } : { ok: true };
}

export async function deleteCard(username, imageUrl, key) {
  if (!auth(key)) return { error: "Unauthorized" };
  const supabase = getServerSupabase();

  // Delete image from storage first (try all common extensions)
  if (imageUrl) {
    const ext = imageUrl.includes(".png") ? "png" : imageUrl.includes(".webp") ? "webp" : "jpg";
    await supabase.storage.from("card-images").remove([`${username}.${ext}`]);
  }

  // Delete the card row from the database
  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("username", username);

  return error ? { error: error.message } : { ok: true };
}
