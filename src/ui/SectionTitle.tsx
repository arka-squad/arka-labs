import React, { ReactNode } from 'react';

export type SectionTitleProps = {
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export const SectionTitle: React.FC<SectionTitleProps> = ({ icon, children, action }) => (
  <div className="mb-4 flex items-center justify-between">
    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase">
      {icon}
      <span>{children}</span>
    </h2>
    {action}
  </div>
);
