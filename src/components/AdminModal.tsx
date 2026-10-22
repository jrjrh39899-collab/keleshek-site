"use client";

import React, { useState, useEffect, useRef } from "react";
import { useData } from "@/context/DataContext";
import { Member, Achievement, SiteContent } from "@/types";
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
  uploadPhotoToSupabase,
} from "@/lib/supabase";

const SECRET_PASSWORD = "RTX_5090_ROG_";
const AUTH_STORAGE_KEY = "keleshek_admin_auth_v2";

export default function AdminModal() {
  const {
    members,
    achievements,
    siteContent,
    isSupabaseConfigured,
    saveAllData,
    resetToDefaults,
    syncWithSupabase,
  } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  // Active Tab: 'members' | 'achievements' | 'content' | 'supabase'
  const [activeTab, setActiveTab] = useState<"members" | "achievements" | "content" | "supabase">("members");

  // Local draft copies for editing
  const [draftMembers, setDraftMembers] = useState<Member[]>(members);
  const [draftAchievements, setDraftAchievements] = useState<Achievement[]>(achievements);
  const [draftContent, setDraftContent] = useState<SiteContent>(siteContent);

  // Selected member to edit
  const [selectedMemberId, setSelectedMemberId] = useState<string>("leader");

  // Supabase form config
  const [sbUrl, setSbUrl] = useState("");
  const [sbKey, setSbKey] = useState("");
  const [sbStatusMsg, setSbStatusMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const standPhotoInputRef = useRef<HTMLInputElement>(null);
  const achievementPhotoInputRef = useRef<HTMLInputElement>(null);
  const [activeAchPhotoIndex, setActiveAchPhotoIndex] = useState<number | null>(null);

  // 1. Silent Keybinding Listener: Ctrl + Shift + H (or Cmd + Shift + H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Check saved session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
      setIsAuthenticated(isAuth);
      const conf = getStoredSupabaseConfig();
      setSbUrl(conf.url);
      setSbKey(conf.anonKey);
    }
  }, []);

  // Sync draft when opened or external data changes
  useEffect(() => {
    if (isOpen) {
      setDraftMembers(members);
      setDraftAchievements(achievements);
      setDraftContent(siteContent);
    }
  }, [isOpen, members, achievements, siteContent]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      setPasswordInput("");
      setAuthError(false);
      showToast("Успешный вход в режим администратора!");
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    showToast("Вы вышли из админ-панели");
  };

  // Save all changes
  const handleSaveAll = async () => {
    const res = await saveAllData(draftMembers, draftAchievements, draftContent);
    if (res.success) {
      if (res.supabaseSaved) {
        showToast("Успешно сохранено и синхронизировано с Supabase!");
      } else {
        showToast("Изменения сохранены локально на сайте!");
      }
    } else {
      showToast("Ошибка при сохранении!");
    }
  };

  // Helper for editing current member
  const currentMember = draftMembers.find((m) => m.id === selectedMemberId) || draftMembers[0];

  const updateCurrentMember = (fields: Partial<Member>) => {
    setDraftMembers((prev) =>
      prev.map((m) => (m.id === selectedMemberId ? { ...m, ...fields } : m))
    );
  };

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "member" | "stand" | "achievement") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      // 1. If Supabase is available, try uploading to bucket
      let uploadedUrl: string | null = null;
      if (isSupabaseConfigured) {
        uploadedUrl = await uploadPhotoToSupabase(file);
      }

      // 2. If no Supabase or upload failed, use base64
      if (!uploadedUrl) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          applyPhotoUrl(target, base64);
          setIsUploadingPhoto(false);
          showToast("Фото загружено локально!");
        };
        reader.readAsDataURL(file);
        return;
      }

      applyPhotoUrl(target, uploadedUrl);
      setIsUploadingPhoto(false);
      showToast("Фото успешно загружено в Supabase Storage!");
    } catch {
      setIsUploadingPhoto(false);
      showToast("Ошибка при загрузке фото");
    }
  };

  const applyPhotoUrl = (target: "member" | "stand" | "achievement", url: string) => {
    if (target === "member") {
      updateCurrentMember({ photoUrl: url });
    } else if (target === "stand") {
      setDraftContent((c) => ({ ...c, standPhotoUrl: url }));
    } else if (target === "achievement" && activeAchPhotoIndex !== null) {
      setDraftAchievements((prev) =>
        prev.map((ach, idx) => (idx === activeAchPhotoIndex ? { ...ach, photoUrl: url } : ach))
      );
    }
  };

  // Responsibilities management
  const addResponsibility = () => {
    const updated = [...currentMember.responsibilities, "Новая обязанность"];
    updateCurrentMember({ responsibilities: updated });
  };

  const updateResponsibility = (index: number, val: string) => {
    const updated = [...currentMember.responsibilities];
    updated[index] = val;
    updateCurrentMember({ responsibilities: updated });
  };

  const removeResponsibility = (index: number) => {
    const updated = currentMember.responsibilities.filter((_, i) => i !== index);
    updateCurrentMember({ responsibilities: updated });
  };

  // Achievements management
  const addAchievement = () => {
    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      title: "Новое достижение",
      category: "Общее",
      year: new Date().getFullYear().toString(),
      description: "Краткое описание события или победы",
      icon: "🏆",
      photoUrl: "",
    };
    setDraftAchievements([newAch, ...draftAchievements]);
  };

  const updateAchievementItem = (id: string, fields: Partial<Achievement>) => {
    setDraftAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...fields } : a))
    );
  };

  const removeAchievementItem = (id: string) => {
    setDraftAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  // Test Supabase config
  const handleTestAndSaveSupabase = async () => {
    setSbStatusMsg({ text: "Проверка подключения...", success: true });
    const res = await testSupabaseConnection(sbUrl, sbKey);
    setSbStatusMsg({ text: res.message, success: res.success });
    if (res.success) {
      saveStoredSupabaseConfig({ url: sbUrl, anonKey: sbKey });
      showToast("Настройки Supabase сохранены!");
    }
  };

  // One-click sync with Supabase
  const handleSyncSupabase = async () => {
    showToast("Синхронизация с базой данных...");
    const res = await syncWithSupabase();
    showToast(res.message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 animate-bounce rounded-xl border border-indigo-500/50 bg-[#12121e] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.5)]">
          ✨ {toastMsg}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoUpload(e, "member")}
      />
      <input
        type="file"
        ref={standPhotoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoUpload(e, "stand")}
      />
      <input
        type="file"
        ref={achievementPhotoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoUpload(e, "achievement")}
      />

      {/* Modal Container */}
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-indigo-500/30 bg-[#0d0e17] text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
        {/* Top Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-sky-400 to-amber-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-lg shadow-md">
              ⚡
            </span>
            <div>
              <h2 className="font-[Space_Grotesk] text-lg font-bold tracking-wide">
                Панель управления Keleshek
              </h2>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>Хоткей: <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-amber-300">Ctrl+Shift+H</kbd></span>
                <span>•</span>
                <span className={isSupabaseConfigured ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                  {isSupabaseConfigured ? "🟢 Supabase БД подключена" : "🟡 Локальный режим (без Supabase)"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-slate-950 transition hover:opacity-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  💾 Сохранить всё
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  Выйти
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Unauthenticated View: Password Screen */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-3xl shadow-[0_0_30px_rgba(251,191,36,0.2)]">
              🔒
            </div>
            <h3 className="mb-2 font-[Space_Grotesk] text-2xl font-bold text-white">
              Вход для администратора
            </h3>
            <p className="mb-6 max-w-sm text-sm text-white/50">
              Введите секретный ключ доступа для управления сайтом, участниками и базой данных Supabase.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(false);
                  }}
                  placeholder="Пароль доступа..."
                  autoFocus
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-mono tracking-wider text-white placeholder-white/30 outline-none transition focus:border-indigo-400 focus:bg-white/10"
                />
                {authError && (
                  <p className="mt-2 text-xs font-semibold text-rose-400">
                    ❌ Неверный пароль доступа!
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
              >
                Войти в панель
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex border-b border-white/10 bg-black/30 px-6">
              {[
                { id: "members", label: "👥 Координаторы и Лидер", icon: "⭐" },
                { id: "achievements", label: "🏆 Достижения", icon: "🏆" },
                { id: "content", label: "🏫 О школе и Стенд", icon: "📝" },
                { id: "supabase", label: "⚡ База данных Supabase", icon: "🗄️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? "border-indigo-400 text-white bg-indigo-500/10"
                      : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* ───────────────── TAB 1: MEMBERS ───────────────── */}
              {activeTab === "members" && (
                <div className="space-y-6">
                  {/* Member Selector Pills */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                      Выберите координатора для редактирования:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {draftMembers.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMemberId(m.id)}
                          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                            selectedMemberId === m.id
                              ? "border-amber-400 bg-amber-400/20 text-white shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                              : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span>{m.emoji}</span>
                          <span>{m.role}</span>
                          {m.id === "leader" && (
                            <span className="rounded bg-amber-400/30 px-1 py-0.5 text-[10px] text-amber-300">
                              Лидер
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form for selected member */}
                  <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-3">
                    {/* Column 1: Photo & Main Avatar preview */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
                      <div className="relative mb-4 flex h-32 w-32 items-center justify-center">
                        <div
                          className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 shadow-xl"
                          style={{
                            borderColor: currentMember.color,
                            background: `radial-gradient(circle, ${currentMember.color}20, #0d0e17)`,
                          }}
                        >
                          {currentMember.photoUrl ? (
                            <img
                              src={currentMember.photoUrl}
                              alt={currentMember.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl">{currentMember.emoji}</span>
                          )}
                        </div>
                      </div>

                      <div className="w-full space-y-2">
                        <button
                          type="button"
                          disabled={isUploadingPhoto}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full rounded-xl border border-indigo-400/40 bg-indigo-500/20 py-2 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/30"
                        >
                          {isUploadingPhoto ? "Загрузка..." : "📸 Загрузить фото с устройства"}
                        </button>

                        <div className="pt-2">
                          <label className="mb-1 block text-[11px] text-white/50 text-left">
                            Или вставьте прямую ссылку на фото:
                          </label>
                          <input
                            type="text"
                            value={currentMember.photoUrl || ""}
                            onChange={(e) => updateCurrentMember({ photoUrl: e.target.value })}
                            placeholder="https://... / фото.jpg"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-400"
                          />
                        </div>

                        {currentMember.photoUrl && (
                          <button
                            type="button"
                            onClick={() => updateCurrentMember({ photoUrl: "" })}
                            className="text-[11px] text-rose-400 hover:underline"
                          >
                            Вернуть эмодзи (удалить фото)
                          </button>
                        )}
                      </div>

                      <div className="mt-4 w-full pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-white/50">Цвет акцента:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentMember.color}
                            onChange={(e) => updateCurrentMember({ color: e.target.value, colorGlow: `${e.target.value}4d` })}
                            className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={currentMember.color}
                            onChange={(e) => updateCurrentMember({ color: e.target.value, colorGlow: `${e.target.value}4d` })}
                            className="w-20 rounded border border-white/15 bg-white/5 px-2 py-1 font-mono text-[11px] text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 2 & 3: Detailed Fields */}
                    <div className="space-y-4 lg:col-span-2">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-white/60">
                            Имя и Фамилия:
                          </label>
                          <input
                            type="text"
                            value={currentMember.name}
                            onChange={(e) => updateCurrentMember({ name: e.target.value })}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-white/60">
                            Эмодзи-символ:
                          </label>
                          <input
                            type="text"
                            value={currentMember.emoji}
                            onChange={(e) => updateCurrentMember({ emoji: e.target.value })}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-white/60">
                            Короткое название (на плашке):
                          </label>
                          <input
                            type="text"
                            value={currentMember.role}
                            onChange={(e) => updateCurrentMember({ role: e.target.value })}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-white/60">
                            Полное название должности:
                          </label>
                          <input
                            type="text"
                            value={currentMember.roleFull}
                            onChange={(e) => updateCurrentMember({ roleFull: e.target.value })}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-white/60">
                          Цитата:
                        </label>
                        <input
                          type="text"
                          value={currentMember.quote}
                          onChange={(e) => updateCurrentMember({ quote: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm italic text-white/90 outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-white/60">
                            Основной фокус:
                          </label>
                          <input
                            type="text"
                            value={currentMember.focus}
                            onChange={(e) => updateCurrentMember({ focus: e.target.value })}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-white/60">
                            Проекты в работе:
                          </label>
                          <input
                            type="text"
                            value={currentMember.projects}
                            onChange={(e) => updateCurrentMember({ projects: e.target.value })}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-white/60">
                          Подробное описание (Биография):
                        </label>
                        <textarea
                          rows={3}
                          value={currentMember.bio}
                          onChange={(e) => updateCurrentMember({ bio: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400"
                        />
                      </div>

                      {/* Responsibilities */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-xs font-semibold text-white/60">
                            Сфера ответственности / Задачи:
                          </label>
                          <button
                            type="button"
                            onClick={addResponsibility}
                            className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 hover:bg-indigo-500/30"
                          >
                            + Добавить пункт
                          </button>
                        </div>
                        <div className="space-y-2">
                          {currentMember.responsibilities.map((resp, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs font-mono text-white/40">{idx + 1}.</span>
                              <input
                                type="text"
                                value={resp}
                                onChange={(e) => updateResponsibility(idx, e.target.value)}
                                className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-400"
                              />
                              <button
                                type="button"
                                onClick={() => removeResponsibility(idx)}
                                className="rounded-lg px-2 py-1 text-xs text-rose-400 hover:bg-rose-500/20"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────── TAB 2: ACHIEVEMENTS ───────────────── */}
              {activeTab === "achievements" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-[Space_Grotesk] text-base font-bold text-white">
                        Список школьных достижений и побед
                      </h4>
                      <p className="text-xs text-white/40">
                        Отображаются в блоке достижений на главной странице
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 transition hover:opacity-90 shadow-md"
                    >
                      + Добавить достижение
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {draftAchievements.map((ach, idx) => (
                      <div
                        key={ach.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ach.icon || "🏆"}
                              onChange={(e) => updateAchievementItem(ach.id, { icon: e.target.value })}
                              className="h-8 w-10 text-center rounded-lg border border-white/15 bg-white/5 text-base"
                            />
                            <input
                              type="text"
                              value={ach.category}
                              onChange={(e) => updateAchievementItem(ach.id, { category: e.target.value })}
                              placeholder="Категория (Спорт, IT...)"
                              className="w-28 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-amber-300 font-semibold uppercase"
                            />
                            <input
                              type="text"
                              value={ach.year}
                              onChange={(e) => updateAchievementItem(ach.id, { year: e.target.value })}
                              placeholder="Год"
                              className="w-16 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/60 font-mono"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAchievementItem(ach.id)}
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Удалить
                          </button>
                        </div>

                        <div>
                          <label className="text-[11px] text-white/40 block mb-1">Заголовок победы / события:</label>
                          <input
                            type="text"
                            value={ach.title}
                            onChange={(e) => updateAchievementItem(ach.id, { title: e.target.value })}
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white outline-none focus:border-indigo-400"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-white/40 block mb-1">Описание:</label>
                          <textarea
                            rows={2}
                            value={ach.description}
                            onChange={(e) => updateAchievementItem(ach.id, { description: e.target.value })}
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 outline-none focus:border-indigo-400"
                          />
                        </div>

                        {/* Achievement Photo */}
                        <div className="pt-2 border-t border-white/5">
                          <label className="text-[11px] text-white/40 block mb-1">Фотография / Грамота:</label>
                          <div className="flex items-center gap-2">
                            {ach.photoUrl ? (
                              <img
                                src={ach.photoUrl}
                                alt={ach.title}
                                className="h-10 w-10 rounded-lg object-cover border border-white/20"
                              />
                            ) : null}
                            <input
                              type="text"
                              value={ach.photoUrl || ""}
                              onChange={(e) => updateAchievementItem(ach.id, { photoUrl: e.target.value })}
                              placeholder="URL фото или ссылка"
                              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAchPhotoIndex(idx);
                                achievementPhotoInputRef.current?.click();
                              }}
                              className="rounded-lg bg-indigo-500/20 px-2 py-1 text-xs text-indigo-300 font-semibold"
                            >
                              Загрузить
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ───────────────── TAB 3: SITE CONTENT ───────────────── */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  {/* Hero Banner settings */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <h4 className="font-[Space_Grotesk] text-base font-bold text-amber-300">
                      1. Главный баннер (Hero)
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Верхний тег:</label>
                        <input
                          type="text"
                          value={draftContent.heroTag}
                          onChange={(e) => setDraftContent({ ...draftContent, heroTag: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Заголовок строка 1:</label>
                        <input
                          type="text"
                          value={draftContent.heroTitleLine1}
                          onChange={(e) => setDraftContent({ ...draftContent, heroTitleLine1: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-white/60 block mb-1">Заголовок строка 2 (градиент):</label>
                        <input
                          type="text"
                          value={draftContent.heroTitleLine2}
                          onChange={(e) => setDraftContent({ ...draftContent, heroTitleLine2: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-white/60 block mb-1">Подзаголовок Hero:</label>
                        <textarea
                          rows={2}
                          value={draftContent.heroDesc}
                          onChange={(e) => setDraftContent({ ...draftContent, heroDesc: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* School & Mission */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
                      <h4 className="font-[Space_Grotesk] text-base font-bold text-sky-300">
                        2. Блок «Наша школа»
                      </h4>
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Заголовок:</label>
                        <input
                          type="text"
                          value={draftContent.schoolTitle}
                          onChange={(e) => setDraftContent({ ...draftContent, schoolTitle: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Текст описания:</label>
                        <textarea
                          rows={4}
                          value={draftContent.schoolDesc}
                          onChange={(e) => setDraftContent({ ...draftContent, schoolDesc: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
                      <h4 className="font-[Space_Grotesk] text-base font-bold text-purple-300">
                        3. Блок «Наша миссия»
                      </h4>
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Заголовок:</label>
                        <input
                          type="text"
                          value={draftContent.missionTitle}
                          onChange={(e) => setDraftContent({ ...draftContent, missionTitle: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 block mb-1">Текст описания:</label>
                        <textarea
                          rows={4}
                          value={draftContent.missionDesc}
                          onChange={(e) => setDraftContent({ ...draftContent, missionDesc: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* School Stand Section */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <h4 className="font-[Space_Grotesk] text-base font-bold text-amber-300">
                      4. Блок стенда в холле школы
                    </h4>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-white/60 block mb-1">Заголовок стенда:</label>
                          <input
                            type="text"
                            value={draftContent.standTitle}
                            onChange={(e) => setDraftContent({ ...draftContent, standTitle: e.target.value })}
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 block mb-1">Текст о стенде:</label>
                          <textarea
                            rows={3}
                            value={draftContent.standDesc}
                            onChange={(e) => setDraftContent({ ...draftContent, standDesc: e.target.value })}
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Stand Photo Preview & Upload */}
                      <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/40 p-4">
                        <img
                          src={draftContent.standPhotoUrl || "/images/board-photo.png"}
                          alt="Стенд"
                          className="max-h-40 rounded-lg object-contain mb-3"
                        />
                        <button
                          type="button"
                          onClick={() => standPhotoInputRef.current?.click()}
                          className="rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/30"
                        >
                          Загрузить новое фото стенда
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────── TAB 4: SUPABASE DATABASE ───────────────── */}
              {activeTab === "supabase" && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div
                    className={`rounded-2xl border p-5 ${
                      isSupabaseConfigured
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-amber-500/30 bg-amber-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{isSupabaseConfigured ? "🟢" : "🟡"}</span>
                      <div>
                        <h4 className="font-[Space_Grotesk] text-base font-bold text-white">
                          {isSupabaseConfigured
                            ? "Supabase подключен и готов к синхронизации"
                            : "Локальный режим: Supabase не настроен"}
                        </h4>
                        <p className="text-xs text-white/60">
                          {isSupabaseConfigured
                            ? "Все изменения сохраняются в облачную базу данных Supabase и доступны всем пользователям."
                            : "Сайт сохраняет все изменения в локальном браузере. Чтобы подключить облачную БД, введите данные ниже."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supabase Credentials Form */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <h4 className="font-[Space_Grotesk] text-base font-bold text-white">
                      Подключение к Supabase
                    </h4>

                    <div>
                      <label className="text-xs text-white/60 block mb-1">
                        Project URL (из Supabase: Settings → API):
                      </label>
                      <input
                        type="text"
                        value={sbUrl}
                        onChange={(e) => setSbUrl(e.target.value)}
                        placeholder="https://your-project.supabase.co"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60 block mb-1">
                        Anon Public Key:
                      </label>
                      <input
                        type="text"
                        value={sbKey}
                        onChange={(e) => setSbKey(e.target.value)}
                        placeholder="ey..."
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-mono text-white outline-none focus:border-indigo-400"
                      />
                    </div>

                    {sbStatusMsg && (
                      <p
                        className={`text-xs font-medium ${
                          sbStatusMsg.success ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {sbStatusMsg.text}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleTestAndSaveSupabase}
                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90"
                      >
                        Проверить и сохранить ключи
                      </button>

                      <button
                        type="button"
                        onClick={handleSyncSupabase}
                        className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                      >
                        Синхронизировать данные в БД
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Вы уверены, что хотите сбросить все данные к исходным?")) {
                            resetToDefaults();
                            showToast("Данные сброшены к исходным!");
                          }
                        }}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 ml-auto"
                      >
                        Сбросить всё к исходным
                      </button>
                    </div>
                  </div>

                  {/* SQL Schema Instructions */}
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-[Space_Grotesk] text-sm font-bold text-amber-300">
                        📜 SQL Скрипт для создания таблиц в Supabase
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const sqlCode = `-- Таблицы для Keleshek Site
CREATE TABLE IF NOT EXISTS public.keleshek_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    role_full TEXT,
    emoji TEXT,
    photo_url TEXT,
    color TEXT DEFAULT '#38bdf8',
    color_glow TEXT DEFAULT 'rgba(56, 189, 248, 0.30)',
    bio TEXT,
    quote TEXT,
    focus TEXT,
    projects TEXT,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    order_index INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.keleshek_achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Общее',
    year TEXT DEFAULT '2026',
    description TEXT,
    photo_url TEXT,
    icon TEXT DEFAULT '🏆',
    order_index INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.keleshek_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.keleshek_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keleshek_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keleshek_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All Members" ON public.keleshek_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Achievements" ON public.keleshek_achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Content" ON public.keleshek_content FOR ALL USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('keleshek-photos', 'keleshek-photos', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Storage" ON storage.objects FOR ALL USING (bucket_id = 'keleshek-photos') WITH CHECK (bucket_id = 'keleshek-photos');`;
                          navigator.clipboard.writeText(sqlCode);
                          showToast("SQL-код скопирован в буфер обмена!");
                        }}
                        className="rounded-lg bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-amber-400/30"
                      >
                        📋 Скопировать весь SQL
                      </button>
                    </div>
                    <p className="text-xs text-white/50">
                      Откройте <strong>Supabase Dashboard → SQL Editor → New query</strong>, вставьте скопированный код и нажмите <strong>Run</strong>. После этого таблицы будут созданы!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-white/10 bg-black/40 px-6 py-3">
              <span className="text-[11px] text-white/40">
                Секретный хоткей: <span className="text-amber-300 font-mono">Ctrl + Shift + H</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:opacity-95"
                >
                  💾 Сохранить изменения
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
