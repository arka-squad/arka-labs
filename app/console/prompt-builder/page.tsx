'use client';
import { useState, useEffect } from 'react';
import { PromptBlock } from '../../../src/ui/PromptBlock';
import { uiLog } from '../../../lib/ui-log';
import { useRole } from '../../../src/role-context';

interface Block { id: number; titre: string; valeur: string; declencheur: string; }

export default function PromptBuilderPage() {
  const { role } = useRole();
  const [blocks, setBlocks] = useState<Block[]>([]);
  useEffect(() => {
    uiLog('mount', { role });
  }, [role]);

  function add() {
    setBlocks((b) => [...b, { id: Date.now(), titre: 'Nouveau', valeur: '', declencheur: '' }]);
    uiLog('prompt_add', { role });
  }
  function remove(id: number) {
    setBlocks((b) => b.filter((blk) => blk.id !== id));
    uiLog('prompt_remove', { role });
  }

  return (
    <div className="space-y-4">
      <button
        onClick={add}
        disabled={role === 'viewer'}
        aria-disabled={role === 'viewer'}
        className="rounded-lg bg-slate-700 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"

      >
        Ajouter bloc
      </button>
      <ul className="space-y-4">
        {blocks.map((b) => (
          <PromptBlock
            key={b.id}
            titre={b.titre}
            valeur={b.valeur}
            declencheur={b.declencheur}
            readOnly={role === 'viewer'}
            onRemove={role === 'viewer' ? undefined : () => remove(b.id)}
          />
        ))}
      </ul>
    </div>
  );
}
