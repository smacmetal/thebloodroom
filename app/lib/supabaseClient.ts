 // C:\Users\steph\thebloodroom\app\lib\supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

// Environment variables must be defined in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Export a single supabase client for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// If you ever need elevated privileges (server only), use this:
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
