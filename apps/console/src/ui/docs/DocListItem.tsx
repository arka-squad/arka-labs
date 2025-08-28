import React from "react";
import { COLOR, RAD } from "../tokens";

export const DocListItem: React.FC<{
  name: string;
  type: string;
  size: number;
  tags?: string[];
  href?: string;
  onDelete?: () => void;
}> = ({ name, type, size, tags = [], href, onDelete }) => (
  <li
    className="flex items-center justify-between gap-2 px-4 py-3 text-sm"
    style={{ background: COLOR.block, borderBottom: `1px solid ${COLOR.border}` }}
  >
    <div className="flex flex-col overflow-hidden">
      {href ? (
        <a href={href} className="truncate" style={{ color: COLOR.text }}>
          {name}
        </a>
      ) : (
        <span className="truncate" style={{ color: COLOR.text }}>
          {name}
        </span>
      )}
      <span className="text-xs" style={{ color: COLOR.textMuted }}>
        {type} · {(size / 1024).toFixed(1)}KB
      </span>
    </div>
    <div className="flex items-center gap-2">
      {tags.map((t) => (
        <span
          key={t}
          className="px-3 py-1 text-xs"
          style={{
            background: COLOR.block,
            border: `1px solid ${COLOR.border}`,
            color: COLOR.text,
            borderRadius: RAD.xl,
          }}
        >
          {t}
        </span>
      ))}
      {onDelete && (
        <button
          onClick={onDelete}
          className="px-2 py-1 text-xs"
          style={{
            background: COLOR.border,
            color: COLOR.text,
            borderRadius: RAD.xl,
          }}
        >
          Supprimer
        </button>
      )}
    </div>
  </li>
);

