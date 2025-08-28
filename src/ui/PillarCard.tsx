import React from 'react';
import { COLOR } from '../../apps/console/src/ui/tokens';

export type PillarCardProps = {
  icon: string;
  label: string;
  desc: string;
};

export const PillarCard: React.FC<PillarCardProps> = ({ icon, label, desc }) => (
  <div className="space-y-2 text-center">
    <div className="text-3xl">{icon}</div>
    <div className="text-base font-semibold" style={{ color: COLOR.text }}>
      {label}
    </div>
    <p className="text-xs" style={{ color: COLOR.textMuted }}>
      {desc}
    </p>
  </div>
);

