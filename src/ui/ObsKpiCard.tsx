import React from "react";

export type ObsKpiCardProps = {
  label: string;
  value: number | string;
  unit: string;
  gradient: string;
};

export const ObsKpiCard: React.FC<ObsKpiCardProps> = ({
  label,
  value,
  unit,
  gradient,
}) => (
  <div
    className="rounded-xl p-3 text-center"
    style={{ background: gradient, color: "var(--arka-text)" }}
  >
    <div className="text-xs">{label}</div>
    <div className="text-base font-bold">
      {value}
      <span className="ml-1 text-xs font-normal">{unit}</span>
    </div>
  </div>
);
