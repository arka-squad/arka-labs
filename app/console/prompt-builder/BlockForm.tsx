'use client';
import { ChangeEvent } from 'react';
import { Block } from './types';

export interface BlockFormProps {
  block: Block;
  readOnly?: boolean;
  onChange?: (b: Block) => void;
}

export function BlockForm({ block, readOnly, onChange }: BlockFormProps) {
  const update = (field: keyof Block) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.({ ...block, [field]: e.target.value });
  };

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <label className="text-xs font-medium">
        Valeur
        <textarea
          disabled={readOnly}
          className="mt-1 w-full resize-y rounded-xl border px-2 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-1"
          style={{ backgroundColor: 'var(--arka-bg)', borderColor: 'var(--arka-border)' }}
          rows={3}
          value={block.valeur}
          onChange={update('valeur')}
        />
      </label>
      <label className="text-xs font-medium">
        Déclencheur
        <input
          disabled={readOnly}
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-1"
          style={{ backgroundColor: 'var(--arka-bg)', borderColor: 'var(--arka-border)' }}
          value={block.declencheur}
          onChange={update('declencheur')}
        />
      </label>
    </div>
  );
}
