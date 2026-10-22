"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Trigger keyboard event or notify user
    const event = new KeyboardEvent("keydown", {
      key: "h",
      shiftKey: true,
      ctrlKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center text-white">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/10 text-3xl">
        ⚡
      </div>
      <h2 className="mb-2 font-[Space_Grotesk] text-2xl font-bold">
        Панель администратора
      </h2>
      <p className="mb-6 max-w-md text-sm text-white/50">
        Если окно входа не открылось автоматически, нажмите комбинацию клавиш{" "}
        <kbd className="rounded bg-white/10 px-2 py-1 font-mono text-amber-300">
          Ctrl + Shift + H
        </kbd>
      </p>
      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "h",
              shiftKey: true,
              ctrlKey: true,
              bubbles: true,
            })
          );
        }}
        className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
      >
        Открыть окно входа
      </button>
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mt-4 text-xs text-white/40 hover:text-white"
      >
        ← На главную
      </button>
    </div>
  );
}
