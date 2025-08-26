"use server";

import { createClient } from "@supabase/supabase-js";

// 🔑 Create a Supabase client with anon key (safe on frontend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Insert a new chant into the Bloodroom
 */
export async function insertChant(text: string, userId: string) {
  const { data, error } = await supabase
    .from("chants")
    .insert([{ text, user_id: userId }])
    .select();

  if (error) {
    console.error("❌ Failed to insert chant:", error.message);
    throw new Error(error.message);
  }

  return data;
}
