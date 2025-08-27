import React from "react"; import { GRADIENT } from "../tokens";
export const ObsKpiCard: React.FC<{ label:string; value:string; gradient?:string }> = ({ label, value, gradient=GRADIENT }) => (
  <div className="rounded-2xl p-5 text-white" style={{ background: gradient }}>
    <div className="text-xs/4 opacity-90">{label}</div>
    <div className="mt-1 text-3xl font-bold">{value}</div>
  </div>
);
