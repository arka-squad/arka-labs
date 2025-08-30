export default function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium outline-none ring-2 ring-transparent transition ${
        active ? 'text-white shadow' : 'hover:opacity-90'
      }`}

      style={
        active
          ? { background: 'linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)' }
          : { backgroundColor: '#151F27' }
      }

    >
      {label}
    </button>
  );
}
