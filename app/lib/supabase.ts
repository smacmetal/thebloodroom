import { createClient } from "@supabase/supabase-js";

// Environment variables should be loaded correctly from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for elevated privileges)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
 