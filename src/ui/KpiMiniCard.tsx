import React from "react";

export type KpiMiniCardProps = {
  label: string;
  value: number | string;
  unit: string;
  background: string;
};
export const KpiMiniCard: React.FC<KpiMiniCardProps> = ({ label, value, unit, background }) => (
  <div className="rounded-xl p-3 text-center text-white" style={{ background }}>
    <div className="text-[10px]">{label}</div>
    <div className="text-base font-bold">
      {value}
      <span className="ml-1 text-[10px] font-normal">{unit}</span>
    </div>
  </div>
);
