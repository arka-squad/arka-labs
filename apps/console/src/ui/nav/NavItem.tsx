import React from "react"; import { COLOR, GRADIENT } from "../tokens";
export const NavItem: React.FC<{ active?: boolean; label: string; onClick?:()=>void }> = ({ active, label, onClick }) => (
  <button className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium outline-none ring-2 ring-transparent transition ${active? 'text-white shadow':'hover:opacity-90'}`} style={active?{ background: GRADIENT }:{ backgroundColor: COLOR.block }} onClick={onClick}>{label}</button>
);
