"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main id="main-content" className="flex-1 overflow-y-auto scrollbar-thin" tabIndex={-1}>
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
