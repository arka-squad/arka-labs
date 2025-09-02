
import Link from 'next/link';

export type NavItemProps = {
  id?: string;
  href: string;
  label: string;
  active?: boolean;
  ['data-codex-id']?: string;
};

export default function NavItem({
  id,
  href,
  label,
  active = false,
  'data-codex-id': dataCodexId,
}: NavItemProps) {

  return (
    <Link
      id={id}
      href={href}
      data-codex-id={dataCodexId}
      className={`w-full rounded-2xl px-4 py-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C1319] ${
        active
          ? 'text-white shadow'
          : 'text-slate-100 hover:bg-slate-800 focus:bg-slate-800 hover:text-white focus:text-white'
      }`}

      aria-current={active ? 'page' : undefined}

      style={
        active
          ? { background: 'linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)' }
          : { backgroundColor: '#151F27' }
      }
    >
      {label}
    </Link>
  );
}
