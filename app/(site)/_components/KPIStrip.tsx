import KpiBlock from './KpiBlock';

export default function KPIStrip({
  ttft_ms = 1.5,
  rtt_ms = 3.2,
  error_rate_percent = 0.8,
}: { ttft_ms?: number; rtt_ms?: number; error_rate_percent?: number }) {
  return (
    <section aria-label="Indicateurs clés" className="mx-auto mt-10 max-w-[1440px] px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiBlock label="TTFT p95" value={ttft_ms} unit="ms" series={[1.9,1.7,1.6,1.5,1.6,1.5]} />
        <KpiBlock label="RTT p95" value={rtt_ms} unit="ms" series={[3.4,3.3,3.2,3.2,3.3,3.2]} />
        <KpiBlock label="Erreurs p95" value={error_rate_percent} unit="%" series={[0.9,0.8,0.8,0.9,0.8,0.8]} />
      </div>
    </section>
  );
}

