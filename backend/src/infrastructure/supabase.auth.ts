import { createClient } from "@supabase/supabase-js";
import { config } from "../config/app.config.js";

export const supabaseAuth = createClient(config.supabase.url, config.supabase.publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
