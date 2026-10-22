import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Member, Achievement, SiteContent, SupabaseConfig } from "@/types";

const STORAGE_KEY_CONFIG = "keleshek_supabase_config";

export function getStoredSupabaseConfig(): SupabaseConfig {
  if (typeof window === "undefined") {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch {
    // ignore
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = "";
let lastUsedKey = "";

export function getSupabase(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === config.url && lastUsedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });
    lastUsedUrl = config.url;
    lastUsedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error("Ошибка инициализации Supabase:", err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await testClient.from("keleshek_content").select("key").limit(1);
    if (error && error.code !== "PGRST116") {
      // If table doesn't exist yet, it's connected to Supabase but schema is missing
      if (error.message.includes("does not exist") || error.code === "42P01") {
        return {
          success: true,
          message: "Подключение успешно! Таблицы ещё не созданы — запустите SQL-скрипт схемы в Supabase.",
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: "Соединение с Supabase установлено отлично!" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: errorMsg };
  }
}

// ─────────────────────────────────────────────────────────────
// FETCH / SAVE DATA
// ─────────────────────────────────────────────────────────────

export async function fetchMembersFromSupabase(): Promise<Member[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("keleshek_members")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return null;

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      roleFull: item.role_full || "",
      emoji: item.emoji || "⭐",
      photoUrl: item.photo_url || "",
      color: item.color || "#38bdf8",
      colorGlow: item.color_glow || "rgba(56, 189, 248, 0.30)",
      bio: item.bio || "",
      quote: item.quote || "",
      focus: item.focus || "",
      projects: item.projects || "",
      responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
    }));
  } catch (err) {
    console.warn("Не удалось получить участников из Supabase:", err);
    return null;
  }
}

export async function saveMembersToSupabase(members: Member[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const rows = members.map((m, index) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      role_full: m.roleFull,
      emoji: m.emoji,
      photo_url: m.photoUrl || "",
      color: m.color,
      color_glow: m.colorGlow,
      bio: m.bio,
      quote: m.quote,
      focus: m.focus,
      projects: m.projects,
      responsibilities: m.responsibilities,
      order_index: index,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("keleshek_members").upsert(rows);
    if (error) {
      console.error("Ошибка сохранения участников в Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Ошибка при сохранении участников:", err);
    return false;
  }
}

export async function fetchAchievementsFromSupabase(): Promise<Achievement[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("keleshek_achievements")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return null;

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category || "Общее",
      year: item.year || "2026",
      description: item.description || "",
      photoUrl: item.photo_url || "",
      icon: item.icon || "🏆",
    }));
  } catch (err) {
    console.warn("Не удалось получить достижения из Supabase:", err);
    return null;
  }
}

export async function saveAchievementsToSupabase(achievements: Achievement[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const rows = achievements.map((a, index) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      year: a.year,
      description: a.description,
      photo_url: a.photoUrl || "",
      icon: a.icon || "🏆",
      order_index: index,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("keleshek_achievements").upsert(rows);
    if (error) {
      console.error("Ошибка сохранения достижений в Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Ошибка при сохранении достижений:", err);
    return false;
  }
}

export async function fetchContentFromSupabase(): Promise<SiteContent | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("keleshek_content")
      .select("data")
      .eq("key", "main_content")
      .single();

    if (error || !data) return null;
    return data.data as SiteContent;
  } catch (err) {
    console.warn("Не удалось получить контент сайта из Supabase:", err);
    return null;
  }
}

export async function saveContentToSupabase(content: SiteContent): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("keleshek_content").upsert({
      key: "main_content",
      data: content,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Ошибка сохранения контента в Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Ошибка при сохранении контента:", err);
    return false;
  }
}

export async function uploadPhotoToSupabase(file: File): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const { data, error } = await supabase.storage.from("keleshek-photos").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error || !data) {
      console.error("Ошибка загрузки фото в Supabase Storage:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from("keleshek-photos").getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Ошибка при загрузке фото:", err);
    return null;
  }
}
