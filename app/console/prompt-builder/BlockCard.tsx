'use client';
import { Block } from './types';
import { BadgeVersioned } from './BadgeVersioned';
import { BlockForm } from './BlockForm';

export interface BlockCardProps {
  block: Block;
  readOnly?: boolean;
  showBadge?: boolean;
  onChange?: (b: Block) => void;
  onRemove?: () => void;
}

export function BlockCard({ block, readOnly, showBadge, onChange, onRemove }: BlockCardProps) {
  return (
    <li
      className="rounded-2xl border p-4"
      style={{ borderColor: 'var(--arka-border)', backgroundColor: 'var(--arka-card)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: 'var(--arka-card)' }}
            >
              {block.titre}
            </span>
            {showBadge && <BadgeVersioned />}
          </div>
          <BlockForm block={block} readOnly={readOnly} onChange={onChange} />
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="rounded-lg p-1 text-slate-300 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
            style={{ backgroundColor: 'var(--arka-border)' }}
            aria-label="Supprimer bloc"
          >
            <span aria-hidden>×</span>
          </button>
        )}
      </div>
    </li>
  );
}
