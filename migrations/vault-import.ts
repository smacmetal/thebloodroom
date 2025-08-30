import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. Load local JSON of old messages
const raw = fs.readFileSync("old-vault.json", "utf8");
const oldMessages = JSON.parse(raw);

// 2. Transform to Supabase schema
const records = oldMessages.map((m: any) => ({
  chamber: m.chamber || "workroom",
  author: m.author || "unknown",
  content: m.content || "",
  content_html: m.content_html || m.contentHtml || "",
  auth_id: m.auth_id || null,
  recipients: m.recipients || [],
  attachments: m.attachments || [],
  sms_results: m.smsResults || [],
  created_at: m.createdAt || new Date().toISOString(),
}));

// 3. Insert in batches
async function run() {
  const { error } = await supabase.from("vault").insert(records);
  if (error) {
    console.error("Migration failed:", error);
  } else {
    console.log(`✅ Migrated ${records.length} records into Supabase vault`);
  }
}

run();
