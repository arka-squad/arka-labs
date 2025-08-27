import React from "react";

const GRADIENT = "linear-gradient(135deg, #FAB652 0%, #F25636 50%, #E0026D 100%)";

export type PromptBlockProps = {
  titre: string;
  valeur: string;
  declencheur: string;
  readOnly?: boolean;
  onRemove?: () => void;
  Pill?: React.ComponentType<any>;
};
export const PromptBlock: React.FC<PromptBlockProps> = ({ titre, valeur, declencheur, readOnly, onRemove, Pill }) => (
  <li className="rounded-2xl border p-4" style={{ borderColor: "#1F2A33", backgroundColor: "#151F27" }}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {Pill ? <Pill>{titre}</Pill> : <span className="rounded-full bg-[#151F27] px-3 py-1 text-xs font-medium">{titre}</span>}
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ background: GRADIENT }}>
            versionné
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-medium">
            Valeur
            <textarea
              disabled={readOnly}
              className="mt-1 w-full resize-y rounded-xl border px-2 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-1"
              style={{ backgroundColor: "#0C1319", borderColor: "#1F2A33" }}
              rows={3}
              defaultValue={valeur}
            />
          </label>
          <label className="text-xs font-medium">
            Déclencheur
            <input
              disabled={readOnly}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ring-2 ring-transparent focus:ring-1"
              style={{ backgroundColor: "#0C1319", borderColor: "#1F2A33" }}
              defaultValue={declencheur}
            />
          </label>
        </div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-lg p-1 text-slate-300 hover:opacity-90"
          style={{ backgroundColor: "#1F2A33" }}
          aria-label="Supprimer bloc"
        >
          <span aria-hidden>×</span>
        </button>
      )}
    </div>
  </li>
);
