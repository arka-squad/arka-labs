// app/console/layout.tsx
import React from "react";
import Topbar from "../../components/Topbar";
import SideNav from "./_components/SideNav";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0C1319] text-slate-100">
      <Topbar />
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
        <aside className="col-span-12 sm:col-span-3 lg:col-span-2">
          <nav className="sticky top-6 space-y-2">
            <SideNav />
          </nav>
        </aside>

        <section className="col-span-12 sm:col-span-9 lg:col-span-10">
          {children}
        </section>
      </div>
    </div>
  );
}