"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useData } from "@/context/DataContext";
import { defaultMembers } from "@/data/initialData";

export default function MemberProfileView({ id }: { id: string }) {
  const { members } = useData();

  // Find in context or fallback to default
  const member = members.find((m) => m.id === id) || defaultMembers.find((m) => m.id === id);

  if (!member) return notFound();

  const isLeader = member.id === "leader";

  return (
    <main className="min-h-screen">
      {/* ═══ NAV ═══ */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-700 to-blue-500 text-lg shadow-[0_0_24px_rgba(99,102,241,0.4)]">
              ⭐
            </div>
            <div>
              <h1 className="font-[Space_Grotesk] text-sm font-bold tracking-wide text-white/90">
                KELESHEK ORAYLARI
              </h1>
              <p className="text-[0.65rem] uppercase tracking-[2px] text-white/40">
                Oqıwshılar Keńesi
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Назад к команде
          </Link>
        </div>
      </header>

      {/* ═══ PROFILE HERO ═══ */}
      <section className="relative overflow-hidden px-6 pb-12 pt-16 md:pt-24">
        {/* background glow matching member color */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: member.colorGlow || `${member.color}33` }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* avatar */}
          <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center md:h-48 md:w-48">
            <div
              className="avatar-ring flex h-full w-full items-center justify-center overflow-hidden rounded-full text-7xl shadow-[0_0_50px_var(--glow)] transition-transform hover:scale-105 md:text-8xl"
              style={
                {
                  "--ring-color": member.color,
                  "--glow": member.colorGlow || `${member.color}33`,
                  borderWidth: "4px",
                  borderStyle: "solid",
                  borderColor: member.color,
                  background: `radial-gradient(circle at 40% 30%, ${member.color}25, #111118)`,
                } as React.CSSProperties
              }
            >
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                member.emoji
              )}
            </div>
            {isLeader && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 to-amber-700 px-4 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white shadow-lg">
                ★ Глава Совета ★
              </div>
            )}
          </div>

          <h2 className="mb-2 font-[Space_Grotesk] text-3xl font-extrabold text-white md:text-4xl">
            {member.name}
          </h2>
          <p
            className="mb-6 text-sm font-bold uppercase tracking-[3px]"
            style={{ color: member.color }}
          >
            {member.roleFull}
          </p>

          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
            {member.bio}
          </p>

          {/* quote */}
          {member.quote && (
            <div className="mx-auto max-w-lg rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <p className="text-sm italic leading-relaxed text-white/60">
                «{member.quote}»
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="glass-card p-6">
            <div className="mb-1 font-[Space_Grotesk] text-lg font-bold text-white">
              {member.focus}
            </div>
            <div className="text-[0.7rem] uppercase tracking-wider text-white/35">
              Основной фокус
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="mb-1 font-[Space_Grotesk] text-lg font-bold text-white">
              {member.projects}
            </div>
            <div className="text-[0.7rem] uppercase tracking-wider text-white/35">
              Проекты в работе
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RESPONSIBILITIES ═══ */}
      {member.responsibilities && member.responsibilities.length > 0 && (
        <section className="border-t border-white/[0.06] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h3 className="mb-8 text-center font-[Space_Grotesk] text-xl font-bold text-white">
              Сфера ответственности
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {member.responsibilities.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
                >
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-slate-900"
                    style={{ background: member.color }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm text-white/70">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CONTACT CTA ═══ */}
      <section className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="glass-card p-8">
            <div className="mb-3 text-3xl">💡</div>
            <h4 className="mb-2 font-[Space_Grotesk] text-lg font-bold text-white">
              Хочешь предложить идею?
            </h4>
            <p className="mb-6 text-sm text-white/40">
              Подойди к нашему стенду в холле школы или напиши через актив своего класса!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              ← Вернуться к команде
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] px-6 py-10 text-center">
        <p className="text-sm text-white/30">
          © 2026{" "}
          <strong className="text-white/50">
            Keleshek Orayları — Oqıwshılar Keńesi
          </strong>
        </p>
      </footer>
    </main>
  );
}
