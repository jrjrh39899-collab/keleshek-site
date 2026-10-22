import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "@/components/ClientProvider";

export const metadata: Metadata = {
  title: "Keleshek Orayları — Oqıwshılar Keńesi",
  description:
    "Школьное самоуправление Keleshek Orayları — объединяем спорт, образование, IT, культуру, медиа и совет в единую движущую силу нашей школы.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* toolsbase.dev-style layered background */}
        <div className="bg-dots" />
        <div className="bg-glow" />
        <div className="bg-noise" />
        <div className="top-line" />

        <ClientProvider>
          <div className="relative z-10">{children}</div>
        </ClientProvider>
      </body>
    </html>
  );
}
