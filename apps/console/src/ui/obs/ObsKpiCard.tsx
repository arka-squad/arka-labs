import React from "react";
import { COLOR, GRADIENT, RAD } from "../tokens";

export type ObsKpiCardProps = {
  label: string;
  value: number | string;
  unit: string;
  gradient?: string;
};

export const ObsKpiCard: React.FC<ObsKpiCardProps> = ({
  label,
  value,
  unit,
  gradient = GRADIENT,
}) => (
  <div
    className="p-5"
    style={{ background: gradient, color: COLOR.text, borderRadius: RAD.xxl }}
  >
    <div className="text-xs opacity-90">{label}</div>
    <div className="mt-1 text-3xl font-bold">
      {value}
      <span className="ml-1 text-sm font-normal">{unit}</span>
    </div>
  </div>
);

