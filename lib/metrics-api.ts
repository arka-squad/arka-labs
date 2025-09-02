export const computeKpis = (
  rows: { ttft_ms: number; rtt_ms: number; status: string }[] | any[],
) => {
  const asc = (a: number, b: number) => a - b;
  const p = (arr: number[], q: number) =>
    arr.length
      ? arr.sort(asc)[
          Math.min(arr.length - 1, Math.floor(q * (arr.length - 1)))
        ]
      : 0;
  const ttft = rows.map((r) => r.ttft_ms);
  const rtt = rows.map((r) => r.rtt_ms);
  const err = rows.filter((r) => String(r.status)[0] !== '2').length;
  return {
    p95: {
      ttft_ms: Math.round(p(ttft, 0.95)),
      rtt_ms: Math.round(p(rtt, 0.95)),
    },
    error_rate_percent: rows.length
      ? +((err * 100) / rows.length).toFixed(1)
      : 0,
  };
};

export const computeOverview = (
  rows: { ttft_ms: number; rtt_ms: number; status: string }[] | any[],
) => {
  const { p95, error_rate_percent } = computeKpis(rows);
  return {
    count_24h: rows.length,
    p95,
    error_rate_percent,
  };
};

export const parsePagination = (params: URLSearchParams) => {
  const rawPage = parseInt(params.get('page') ?? '1', 10);
  const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);
  const ps = params.get('page_size') ?? params.get('limit') ?? '20';
  const rawPageSize = parseInt(ps, 10);
  const page_size = Number.isNaN(rawPageSize)
    ? 20
    : Math.min(100, Math.max(1, rawPageSize));
  return { page, page_size };
};

export const formatRuns = (
  rows: any[],
  page: number,
  page_size: number,
  count: number,
) => ({ items: rows, page, page_size, count });
