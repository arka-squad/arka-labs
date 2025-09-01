'use client';
import { useState, useEffect } from 'react';
import { uiLog } from '../../../lib/ui-log';
import { useRole } from '../../../src/role-context';
import { Block } from './types';
import { BlockCard } from './BlockCard';
import { RBACGuard } from './RBACGuard';

export default function PromptBuilderPage() {
  const { role } = useRole();
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    fetch('/api/prompt-blocks')
      .then((r) => r.json())
      .then(setBlocks);
    uiLog('mount', { role });
  }, [role]);

  async function add() {
    const res = await fetch('/api/prompt-blocks', {
      method: 'POST',
      body: JSON.stringify({
        titre: 'Nouveau',
        valeur: '',
        declencheur: '',
        versioned: role === 'owner',
      }),
    });
    const block: Block = await res.json();
    setBlocks((b) => [...b, block]);
    uiLog('prompt_add', { role });
  }

  async function update(block: Block) {
    await fetch('/api/prompt-blocks', {
      method: 'PATCH',
      body: JSON.stringify(block),
    });
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b)));
  }

  function remove(id: number) {
    setBlocks((b) => b.filter((blk) => blk.id !== id));
    uiLog('prompt_remove', { role });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Prompt Builder</h1>
        <RBACGuard roles={['editor', 'admin', 'owner']}>
          <button
            onClick={add}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
          >
            Ajouter bloc
          </button>
        </RBACGuard>
      </div>
      <ul className="space-y-4">
        {blocks.map((b) => (
          <BlockCard
            key={b.id}
            block={b}
            readOnly={role !== 'owner'}
            showBadge={b.versioned}
            onChange={role === 'owner' ? update : undefined}
            onRemove={role === 'viewer' ? undefined : () => remove(b.id)}
          />
        ))}
      </ul>
    </div>
  );
}
