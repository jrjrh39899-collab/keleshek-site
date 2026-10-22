"use client";

import Link from "next/link";
import Image from "next/image";
import { useData } from "@/context/DataContext";

export default function Home() {
  const { members, achievements, siteContent } = useData();

  const leader = members.find((m) => m.id === "leader") || members[0];
  const coordinators = members.filter((m) => m.id !== "leader");

  return (
    <main className="min-h-screen">
      {/* ═══════ HEADER / NAV ═══════ */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-700 to-blue-500 text-lg shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-shadow group-hover:shadow-[0_0_32px_rgba(99,102,241,0.6)]">
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

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#team" className="text-sm text-white/50 transition hover:text-white">
              Команда
            </a>
            <a href="#achievements" className="text-sm text-white/50 transition hover:text-white">
              Достижения
            </a>
            <a href="#about" className="text-sm text-white/50 transition hover:text-white">
              О школе
            </a>
            <a href="#stand" className="text-sm text-white/50 transition hover:text-white">
              Стенд
            </a>
          </nav>
        </div>
      </header>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28">
        {/* ambient hero glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            {siteContent.heroTag}
          </div>

          <h2
            className="hero-title mb-6 font-[Space_Grotesk] text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl"
            style={{
              background: "linear-gradient(180deg, #fff 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {siteContent.heroTitleLine1}
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #818cf8, #38bdf8, #fbbf24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {siteContent.heroTitleLine2}
            </span>
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/50 md:text-lg">
            {siteContent.heroDesc}
          </p>

          {/* stat pills */}
          <div className="flex flex-wrap justify-center gap-4">
            {siteContent.stats.map((s) => (
              <div
                key={s.lbl}
                className="glass-card flex flex-col px-6 py-3 text-left"
              >
                <span className="font-[Space_Grotesk] text-xl font-bold text-white">
                  {s.val}
                </span>
                <span className="text-[0.7rem] uppercase tracking-wider text-white/40">
                  {s.lbl}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TEAM SECTION ═══════ */}
      <section id="team" className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          {/* Section heading */}
          <div className="mb-14 text-center">
            <h3 className="mb-2 font-[Space_Grotesk] text-2xl font-bold text-white md:text-3xl">
              Структура координаторов
            </h3>
            <p className="text-sm text-white/40">
              Нажми на кружок любого лидера для перехода к его портфолио
            </p>
          </div>

          {/* ── LEADER: central hero card ── */}
          {leader && (
            <div className="mb-16 flex justify-center">
              <Link
                href={`/member/${leader.id}`}
                className="group relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-gradient-to-br from-indigo-950/60 to-slate-950/80 px-8 py-10 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-amber-400/80 hover:shadow-[0_20px_60px_rgba(251,191,36,0.20)]"
              >
                {/* internal glow */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-400/[0.06] to-transparent" />

                {/* avatar */}
                <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
                  <div
                    className="avatar-ring flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-amber-400 bg-gradient-to-br from-indigo-800 to-sky-700 text-6xl shadow-[0_0_40px_rgba(251,191,36,0.3)] transition-transform duration-300 group-hover:scale-105"
                    style={{ "--ring-color": leader.color || "#fbbf24" } as React.CSSProperties}
                  >
                    {leader.photoUrl ? (
                      <img
                        src={leader.photoUrl}
                        alt={leader.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      leader.emoji
                    )}
                  </div>
                  {/* crown badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 to-amber-700 px-4 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white shadow-lg">
                    ★ Глава Совета ★
                  </div>
                </div>

                <h4 className="relative font-[Space_Grotesk] text-2xl font-bold text-white">
                  {leader.name}
                </h4>
                <p className="relative mb-4 text-sm font-bold uppercase tracking-widest text-amber-300">
                  {leader.roleFull}
                </p>
                <p className="relative mb-6 text-sm italic leading-relaxed text-white/60">
                  «{leader.quote}»
                </p>

                <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-slate-900 transition group-hover:gap-3">
                  Открыть портфолио
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          )}

          {/* ── COORDINATORS GRID ── */}
          <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coordinators.map((c, i) => (
              <Link
                key={c.id}
                href={`/member/${c.id}`}
                className="animate-fade-in-up glass-card group relative flex flex-col items-center px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                style={
                  {
                    "--ring-color": c.color,
                  } as React.CSSProperties
                }
              >
                {/* top accent bar */}
                <div
                  className="absolute left-0 right-0 top-0 h-[3px] rounded-t-[20px] opacity-60 transition-all group-hover:h-[5px] group-hover:opacity-100"
                  style={{ background: c.color }}
                />

                {/* avatar */}
                <div className="relative mb-5">
                  <div
                    className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border-2 text-4xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110"
                    style={{
                      borderColor: c.color,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    {c.photoUrl ? (
                      <img
                        src={c.photoUrl}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      c.emoji
                    )}
                  </div>
                  {/* number badge */}
                  <div
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-extrabold text-slate-900"
                    style={{ background: c.color }}
                  >
                    {i + 1}
                  </div>
                </div>

                <h5 className="mb-1 font-[Space_Grotesk] text-lg font-bold text-white">
                  {c.name}
                </h5>
                <p
                  className="mb-3 text-[0.75rem] font-bold uppercase tracking-widest"
                  style={{ color: c.color }}
                >
                  {c.role}
                </p>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-white/45">
                  {c.bio ? `${c.bio.slice(0, 115)}...` : ""}
                </p>

                <span className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                  Подробнее
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ACHIEVEMENTS SECTION ═══════ */}
      <section id="achievements" className="border-t border-white/[0.06] px-6 py-20 bg-black/20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/[0.08] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              🏆 Наш прогресс и результаты
            </div>
            <h3 className="mb-2 font-[Space_Grotesk] text-2xl font-bold text-white md:text-3xl">
              Достижения школьного совета
            </h3>
            <p className="text-sm text-white/40">
              Победы на турнирах, запущенные проекты и награды наших координаторов
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="glass-card flex flex-col justify-between overflow-hidden p-6 transition-transform hover:-translate-y-1.5 hover:border-amber-400/40"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-3xl">{ach.icon || "🏆"}</span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-300">
                      {ach.year}
                    </span>
                  </div>

                  {ach.photoUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={ach.photoUrl}
                        alt={ach.title}
                        className="h-32 w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}

                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    {ach.category}
                  </span>
                  <h4 className="mb-2 font-[Space_Grotesk] text-base font-bold text-white">
                    {ach.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-white/50">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ABOUT SECTION ═══════ */}
      <section id="about" className="border-t border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h3 className="mb-2 font-[Space_Grotesk] text-2xl font-bold text-white md:text-3xl">
              О нашей школе и движении
            </h3>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/40">
              Что такое Keleshek Orayları и зачем это нужно
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card p-8">
              <div className="mb-4 text-3xl">🏫</div>
              <h4 className="mb-3 font-[Space_Grotesk] text-lg font-bold text-white">
                {siteContent.schoolTitle}
              </h4>
              <p className="text-sm leading-relaxed text-white/50">
                {siteContent.schoolDesc}
              </p>
            </div>

            <div className="glass-card p-8">
              <div className="mb-4 text-3xl">🚀</div>
              <h4 className="mb-3 font-[Space_Grotesk] text-lg font-bold text-white">
                {siteContent.missionTitle}
              </h4>
              <p className="text-sm leading-relaxed text-white/50">
                {siteContent.missionDesc}
              </p>
            </div>

            <div className="glass-card p-8 md:col-span-2">
              <div className="mb-4 text-3xl">🎯</div>
              <h4 className="mb-3 font-[Space_Grotesk] text-lg font-bold text-white">
                Наши ценности
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {siteContent.values.map((v) => (
                  <div key={v.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <span className="mb-2 block text-2xl">{v.icon}</span>
                    <h5 className="mb-1 text-sm font-bold text-white">{v.title}</h5>
                    <p className="text-xs leading-relaxed text-white/40">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ REAL SCHOOL STAND PHOTO ═══════ */}
      <section id="stand" className="border-t border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card grid items-center gap-8 overflow-hidden p-8 md:grid-cols-2">
            {/* photo */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
              <Image
                src={siteContent.standPhotoUrl || "/images/board-photo.png"}
                alt="Стенд Keleshek Orayları в школе"
                width={800}
                height={500}
                unoptimized
                className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-slate-900/80 px-3 py-1 text-[0.7rem] font-semibold text-amber-300 backdrop-blur-sm">
                📸 Стенд в школе
              </div>
            </div>

            {/* text */}
            <div>
              <h3 className="mb-4 font-[Space_Grotesk] text-2xl font-bold text-white">
                {siteContent.standTitle}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-white/50">
                {siteContent.standDesc}
              </p>
              <div className="flex flex-col gap-3">
                {siteContent.standPoints.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.06] px-6 py-10 text-center">
        <p className="text-sm text-white/30">
          © 2026{" "}
          <strong className="text-white/50">
            Keleshek Orayları — Oqıwshılar Keńesi
          </strong>
          . Создано с ❤️ для нашей школы.
        </p>
        <p className="mt-3 text-[11px] text-white/20">
          Панель управления: <kbd className="font-mono text-white/30">Ctrl + Shift + H</kbd>
        </p>
      </footer>
    </main>
  );
}
