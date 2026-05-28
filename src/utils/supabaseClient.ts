import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Expose professional, error-safe Supabase integration helpers
export async function getOrCreateAnonymousUser() {
  if (!supabase) return null;
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.warn("Supabase session check warning:", sessionError.message);
    }
    if (session?.user) {
      return session.user;
    }
    
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn(
        "Supabase anonymous sign-in is disabled or failed. Falling back to Local Guest Mode.",
        error.message
      );
      return null;
    }
    return data?.user || null;
  } catch (error) {
    console.warn("Failed to authenticate anonymous user:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function fetchLevelsFromDB() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .order("level_number", { ascending: true });
    if (error) {
      console.warn("Supabase fetch levels query failed. Falling back to default levels:", error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn("Failed to fetch levels from Supabase:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function saveUserProgress(
  userId: string,
  levelIndex: number,
  score: number,
  hintsUsed: number,
  finished: boolean
) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: userId,
        current_level: levelIndex + 1, // Store as 1-indexed in database
        current_score: score,
        hints_used: hintsUsed,
        completed_at: finished ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    if (error) {
      console.warn("Supabase save progress upsert failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Failed to save progress to Supabase:", error instanceof Error ? error.message : error);
    return false;
  }
}

export async function getUserProgress(userId: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.warn("Supabase load progress query failed:", error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.warn("Failed to load progress from Supabase:", error instanceof Error ? error.message : error);
    return null;
  }
}
