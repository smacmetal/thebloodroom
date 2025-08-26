 // C:\Users\steph\thebloodroom\app\lib\chant.ts

"use server";

import { cookies } from "next/headers";
import { supabase } from "./supabaseClient";

/**
 * Insert a new chant into the Bloodroom
 * Resolves the current user automatically from br_user cookie.
 */
export async function insertChant(text: string) {
  const cookieStore = cookies();
  const username = cookieStore.get("br_user")?.value;

  if (!username) {
    throw new Error("Not authenticated. Please log in first.");
  }

  // Look up the User row from Supabase
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id, username")
    .eq("username", username)
    .single();

  if (userError || !user) {
    throw new Error("User not found or not authorized.");
  }

  // Insert the chant
  const { data, error } = await supabase
    .from("chants")
    .insert([{ text, user_id: user.id }])
    .select();

  if (error) {
    console.error("❌ Failed to insert chant:", error.message);
    throw new Error(error.message);
  }

  return data;
}
