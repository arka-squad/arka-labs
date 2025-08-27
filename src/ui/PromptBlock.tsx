import React from "react";


const GRADIENT = 'var(--arka-grad-cta)';


export type PromptBlockProps = {
  titre: string;
  valeur: string;
  declencheur: string;
  readOnly?: boolean;
  onRemove?: () => void;
  Pill?: React.ComponentType<any>;
};
export const PromptBlock: React.FC<PromptBlockProps> = ({ titre, valeur, declencheur, readOnly, onRemove, Pill }) => (

  <li
    className="rounded-2xl border p-4"
    style={{ borderColor: 'var(--arka-border)', backgroundColor: 'var(--arka-card)' }}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {Pill ? (
            <Pill>{titre}</Pill>
          ) : (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: 'var(--arka-card)' }}
            >
              {titre}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ background: GRADIENT }}
          >

            versionné
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-medium">
            Valeur
            <textarea
              disabled={readOnly}
              className="mt-1 w-full resize-y rounded-xl border px-2 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-1"

              style={{ backgroundColor: 'var(--arka-bg)', borderColor: 'var(--arka-border)' }}

              rows={3}
              defaultValue={valeur}
            />
          </label>
          <label className="text-xs font-medium">
            Déclencheur
            <input
              disabled={readOnly}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-1"

              style={{ backgroundColor: 'var(--arka-bg)', borderColor: 'var(--arka-border)' }}

              defaultValue={declencheur}
            />
          </label>
        </div>
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
