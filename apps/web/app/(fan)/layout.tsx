import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StadiumOS 2026 | Fan Experience",
  description: "Your FIFA World Cup 2026 match day companion",
};

export default function FanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
