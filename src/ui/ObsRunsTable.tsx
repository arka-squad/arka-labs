import React from "react";

export type RunRow = {
  id: number;
  lot: string;
  sprint: string;
  ttft_ms: number;
  rtt_ms: number;
  error_rate_percent: number;
};

export const ObsRunsTable: React.FC<{
  rows: RunRow[];
  page: number;
  total: number;
  limit?: number;
  onPage: (page: number) => void;
}> = ({ rows, page, total, limit = 20, onPage }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ color: "var(--arka-text)" }}>
          <thead>
            <tr className="text-left" style={{ color: "var(--arka-text-muted)" }}>
              <th className="px-2 py-1">Run</th>
              <th className="px-2 py-1">Lot</th>
              <th className="px-2 py-1">Sprint</th>
              <th className="px-2 py-1">TTFT (ms)</th>
              <th className="px-2 py-1">RTT (ms)</th>
              <th className="px-2 py-1">Err (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t"
                style={{ borderColor: "var(--arka-border)" }}
              >
                <td className="px-2 py-1">{r.id}</td>
                <td className="px-2 py-1">{r.lot}</td>
                <td className="px-2 py-1">{r.sprint}</td>
                <td className="px-2 py-1">{r.ttft_ms.toFixed(1)}</td>
                <td className="px-2 py-1">{r.rtt_ms.toFixed(1)}</td>
                <td className="px-2 py-1">{r.error_rate_percent.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div
          className="flex justify-end gap-2 text-xs"
          style={{ color: "var(--arka-text)" }}
        >
          <button
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            className="disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            {page}/{totalPages}
          </span>
          <button
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            className="disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
