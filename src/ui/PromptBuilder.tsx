import React from 'react';

export type PromptItem = {
  id: string;
  titre: string;
  valeur: string;
};

export type PromptBuilderProps = {
  /** Optional initial blocks */
  initialBlocks?: PromptItem[];
  /** Callback fired when blocks change */
  onChange?: (blocks: PromptItem[]) => void;
  /** Key used for localStorage persistence */
  storageKey?: string;
};

/**
 * PromptBuilder allows composition of multiple prompt blocks
 * with local persistence and JSON serialization.
 */
export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  initialBlocks = [],
  onChange,
  storageKey = 'prompt_builder',
}) => {
  const [blocks, setBlocks] = React.useState<PromptItem[]>(() => {
    if (typeof window === 'undefined') return initialBlocks;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : initialBlocks;
    } catch {
      return initialBlocks;
    }
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(blocks));
      } catch {
        // ignore write errors
      }
    }
    onChange?.(blocks);
  }, [blocks, onChange, storageKey]);

  const updateBlock = (
    id: string,
    field: keyof Omit<PromptItem, 'id'>,
    value: string,
  ) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    );
  };

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), titre: '', valeur: '' },
    ]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div>
      <ul className="grid gap-4">
        {blocks.map((block) => (
          <li
            key={block.id}
            className="rounded-2xl border p-4"
            style={{
              borderColor: 'var(--arka-border)',
              backgroundColor: 'var(--arka-card)',
            }}
          >
            <div className="flex flex-col gap-2">
              <input
                className="rounded-lg border px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-1"
                style={{
                  backgroundColor: 'var(--arka-bg)',
                  borderColor: 'var(--arka-border)',
                }}
                placeholder="Titre"
                value={block.titre}
                onChange={(e) => updateBlock(block.id, 'titre', e.target.value)}
              />
              <textarea
                className="w-full resize-y rounded-xl border px-2 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-1"
                style={{
                  backgroundColor: 'var(--arka-bg)',
                  borderColor: 'var(--arka-border)',
                }}
                placeholder="Valeur"
                rows={3}
                value={block.valeur}
                onChange={(e) =>
                  updateBlock(block.id, 'valeur', e.target.value)
                }
              />
              <div className="text-right">
                <button
                  onClick={() => removeBlock(block.id)}
                  className="rounded-lg p-1 text-slate-300 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
                  style={{ backgroundColor: 'var(--arka-border)' }}
                  aria-label="Supprimer bloc"
                >
                  <span aria-hidden>×</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <button
          onClick={addBlock}
          className="rounded-lg px-3 py-2 text-sm text-white"
          style={{ background: 'var(--arka-grad-cta)' }}
        >
          Ajouter un bloc
        </button>
      </div>
    </div>
  );
};

/**
 * Utility to build JSON payload for the agent API
 */
export const buildPromptJSON = (blocks: PromptItem[]) =>
  JSON.stringify(blocks.map(({ titre, valeur }) => ({ titre, valeur })));

export default PromptBuilder;
