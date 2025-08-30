 // C:\Users\steph\thebloodroom\app\lib\vault.ts

import { supabase } from "@/lib/supabase";

export type VaultMessage = {
  id?: string;
  chamber: string;
  author?: string;
  recipients?: string[];
  content?: string;
  content_html?: string;
  attachments?: any[];
  createdAt?: string;
  smsResults?: any[];
  auth_id?: string; // ✅ added so TS stops complaining
  meta?: Record<string, any>;
};

// Save a message into the Vault
export async function saveToVault(msg: VaultMessage) {
  const { data, error } = await supabase
    .from("vault")
    .insert([msg])
    .select("*")
    .single();

  if (error) {
    console.error("[vault] insert error", error);
    throw error;
  }

  return data;
}

// Get messages for a chamber
export async function getVaultMessages(chamber: string) {
  const { data, error } = await supabase
    .from("vault")
    .select("*")
    .eq("chamber", chamber)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[vault] fetch error", error);
    throw error;
  }

  return data || [];
}

// Delete a message by ID
export async function deleteVaultMessage(id: string) {
  const { error } = await supabase.from("vault").delete().eq("id", id);

  if (error) {
    console.error("[vault] delete error", error);
    throw error;
  }

  return { ok: true };
}
