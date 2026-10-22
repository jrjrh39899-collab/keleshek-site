"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Member, Achievement, SiteContent } from "@/types";
import { defaultMembers, defaultAchievements, defaultSiteContent } from "@/data/initialData";
import {
  getSupabase,
  fetchMembersFromSupabase,
  saveMembersToSupabase,
  fetchAchievementsFromSupabase,
  saveAchievementsToSupabase,
  fetchContentFromSupabase,
  saveContentToSupabase,
} from "@/lib/supabase";

interface DataContextType {
  members: Member[];
  achievements: Achievement[];
  siteContent: SiteContent;
  isSupabaseConfigured: boolean;
  isLoading: boolean;
  isSaving: boolean;
  saveAllData: (
    newMembers: Member[],
    newAchievements: Achievement[],
    newContent: SiteContent
  ) => Promise<{ success: boolean; supabaseSaved: boolean }>;
  updateMember: (id: string, updated: Partial<Member>) => Promise<void>;
  updateAchievement: (id: string, updated: Partial<Achievement>) => Promise<void>;
  addAchievement: (achievement: Achievement) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  updateSiteContent: (content: Partial<SiteContent>) => Promise<void>;
  resetToDefaults: () => void;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEY_MEMBERS = "keleshek_data_members_v2";
const STORAGE_KEY_ACHIEVEMENTS = "keleshek_data_achievements_v2";
const STORAGE_KEY_CONTENT = "keleshek_data_content_v2";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from LocalStorage and then Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);

    // 1. Try reading from LocalStorage
    let currentMembers = defaultMembers;
    let currentAchievements = defaultAchievements;
    let currentContent = defaultSiteContent;

    try {
      const localM = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (localM) currentMembers = JSON.parse(localM);

      const localA = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      if (localA) currentAchievements = JSON.parse(localA);

      const localC = localStorage.getItem(STORAGE_KEY_CONTENT);
      if (localC) currentContent = JSON.parse(localC);

      setMembers(currentMembers);
      setAchievements(currentAchievements);
      setSiteContent(currentContent);
    } catch (e) {
      console.warn("Ошибка чтения localStorage:", e);
    }

    // 2. Try reading from Supabase
    const supabase = getSupabase();
    if (supabase) {
      setIsSupabaseConfigured(true);
      try {
        const [sbMembers, sbAchievements, sbContent] = await Promise.all([
          fetchMembersFromSupabase(),
          fetchAchievementsFromSupabase(),
          fetchContentFromSupabase(),
        ]);

        if (sbMembers && sbMembers.length > 0) {
          setMembers(sbMembers);
          localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(sbMembers));
        }
        if (sbAchievements && sbAchievements.length > 0) {
          setAchievements(sbAchievements);
          localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(sbAchievements));
        }
        if (sbContent) {
          setSiteContent(sbContent);
          localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(sbContent));
        }
      } catch (err) {
        console.warn("Ошибка подключения к Supabase при загрузке:", err);
      }
    } else {
      setIsSupabaseConfigured(false);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save all data
  const saveAllData = async (
    newMembers: Member[],
    newAchievements: Achievement[],
    newContent: SiteContent
  ): Promise<{ success: boolean; supabaseSaved: boolean }> => {
    setIsSaving(true);
    let supabaseSaved = false;

    try {
      // 1. Local state & localStorage
      setMembers(newMembers);
      setAchievements(newAchievements);
      setSiteContent(newContent);

      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(newMembers));
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(newAchievements));
      localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(newContent));

      // 2. Supabase if available
      const supabase = getSupabase();
      if (supabase) {
        setIsSupabaseConfigured(true);
        const [mRes, aRes, cRes] = await Promise.all([
          saveMembersToSupabase(newMembers),
          saveAchievementsToSupabase(newAchievements),
          saveContentToSupabase(newContent),
        ]);
        supabaseSaved = mRes && aRes && cRes;
      }
      return { success: true, supabaseSaved };
    } catch (err) {
      console.error("Ошибка сохранения данных:", err);
      return { success: false, supabaseSaved: false };
    } finally {
      setIsSaving(false);
    }
  };

  const updateMember = async (id: string, updated: Partial<Member>) => {
    const updatedMembers = members.map((m) => (m.id === id ? { ...m, ...updated } : m));
    await saveAllData(updatedMembers, achievements, siteContent);
  };

  const updateAchievement = async (id: string, updated: Partial<Achievement>) => {
    const updatedAchievements = achievements.map((a) => (a.id === id ? { ...a, ...updated } : a));
    await saveAllData(members, updatedAchievements, siteContent);
  };

  const addAchievement = async (achievement: Achievement) => {
    const updatedAchievements = [achievement, ...achievements];
    await saveAllData(members, updatedAchievements, siteContent);
  };

  const deleteAchievement = async (id: string) => {
    const updatedAchievements = achievements.filter((a) => a.id !== id);
    await saveAllData(members, updatedAchievements, siteContent);
  };

  const updateSiteContent = async (updated: Partial<SiteContent>) => {
    const newContent = { ...siteContent, ...updated };
    await saveAllData(members, achievements, newContent);
  };

  const resetToDefaults = () => {
    saveAllData(defaultMembers, defaultAchievements, defaultSiteContent);
  };

  const syncWithSupabase = async (): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: "Supabase не настроен. Укажите URL и Anon Key в настройках." };
    }

    setIsSaving(true);
    try {
      const [mOk, aOk, cOk] = await Promise.all([
        saveMembersToSupabase(members),
        saveAchievementsToSupabase(achievements),
        saveContentToSupabase(siteContent),
      ]);

      if (mOk && aOk && cOk) {
        setIsSupabaseConfigured(true);
        return { success: true, message: "Все данные (участники, достижения, контент) успешно синхронизированы с Supabase!" };
      } else {
        return {
          success: false,
          message: "Часть данных не удалось отправить. Убедитесь, что в Supabase выполнен скрипт создания таблиц (SQL Editor).",
        };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Ошибка: ${errorMsg}` };
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        members,
        achievements,
        siteContent,
        isSupabaseConfigured,
        isLoading,
        isSaving,
        saveAllData,
        updateMember,
        updateAchievement,
        addAchievement,
        deleteAchievement,
        updateSiteContent,
        resetToDefaults,
        syncWithSupabase,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
