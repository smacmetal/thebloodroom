 "use server";

import { cookies } from "next/headers";
import { supabase } from "./supabaseClient";

type User = {
  id: string;
  username: string;
  role: string;
};

/**
 * Insert a new chant into the Bloodroom
 * Resolves the current user automatically from br_user cookie.
 */
export async function insertChant(text: string) {
  // ✅ must await cookies()
  const cookieStore = await cookies();
  const username = cookieStore.get("br_user")?.value;

  if (!username) {
    throw new Error("No user cookie found — cannot insert chant.");
  }

  // ✅ select role from users
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, role")
    .eq("username", username)
    .single<User>();

  if (error || !user) {
    throw new Error("Failed to resolve user from Supabase.");
  }

  // ✅ now you can safely use user.role
  const { error: insertError } = await supabase.from("messages").insert({
    content: text,
    user_id: user.id,
    author: user.username,
    author_role: user.role,
  });

  if (insertError) {
    throw new Error("Failed to insert chant into messages.");
  }

  return { success: true };
}
