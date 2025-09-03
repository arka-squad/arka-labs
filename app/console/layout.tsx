import Topbar from "@components/Topbar";
import ConsoleShell from "@console/ConsoleShell";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
        {/* SideNav (serveur) & contenu */}
        <aside className="col-span-12 sm:col-span-3 lg:col-span-2">
          <ConsoleShell />
        </aside>
        <section className="col-span-12 sm:col-span-9 lg:col-span-10">{children}</section>
      </div>
    </div>
  );
}
