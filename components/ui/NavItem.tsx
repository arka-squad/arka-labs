
export default function NavItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium outline-none ring-2 ring-transparent transition ${
        active ? 'text-white shadow' : 'hover:opacity-90'

      }`}

      aria-current={active ? 'page' : undefined}

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
