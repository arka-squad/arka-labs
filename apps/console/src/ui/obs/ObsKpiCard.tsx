import React from "react";
import { GRADIENT } from "../tokens";

export type ObsKpiCardProps = {
  label: string;
  value: number | string;
  unit: string;
  gradient?: string;
};

export const ObsKpiCard: React.FC<ObsKpiCardProps> = ({ label, value, unit, gradient = GRADIENT }) => (
  <div className="rounded-2xl p-5 text-white" style={{ background: gradient }}>
    <div className="text-xs/4 opacity-90">{label}</div>
    <div className="mt-1 text-3xl font-bold">
      {value}
      <span className="ml-1 text-sm font-normal">{unit}</span>
    </div>
  </div>
);
