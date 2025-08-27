import React from "react";
const GRADIENT = "linear-gradient(135deg, #FAB652 0%, #F25636 50%, #E0026D 100%)";

export type NavItemProps = {
  active?: boolean;
  label: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
export const NavItem: React.FC<NavItemProps> = ({ active, label, ...props }) => (
  <button
    {...props}
    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium outline-none ring-2 ring-transparent transition focus-visible:ring-slate-400 ${active ? "text-white shadow" : "hover:opacity-90"}`}
    style={active ? { background: GRADIENT } : { backgroundColor: "#151F27" }}
  >
    {label}
  </button>
);
