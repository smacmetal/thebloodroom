 "use server";

import { supabase } from "./supabaseClient";

/**
 * Insert a new chant into the Bloodroom
 */
export async function insertChant(text: string) {
  // Get the currently logged-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated. Please log in first.");
  }

  const { data, error } = await supabase
    .from("chants")
    .insert([{ text, user_id: user.id }]) // 👈 link to current auth UID
    .select();

  if (error) {
    console.error("❌ Failed to insert chant:", error.message);
    throw new Error(error.message);
  }

  return data;
}
