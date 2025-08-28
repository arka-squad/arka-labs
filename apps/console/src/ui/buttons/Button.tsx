import React from "react"; import { COLOR, GRADIENT, RAD } from "../tokens";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
export const ButtonPrimary: React.FC<Props> = ({ className = "", ...p }) => (
  <button {...p} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 ${className}`} style={{ background: GRADIENT, borderRadius: RAD.xl }} />
);
export const ButtonSecondary: React.FC<Props> = ({ className = "", ...p }) => (
  <button {...p} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 ${className}`} style={{ background: COLOR.block, borderColor: COLOR.border, borderRadius: RAD.xl }} />
);
