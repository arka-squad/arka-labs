'use client';

export default function Watermark() {
  const enabled = process.env.NEXT_PUBLIC_WATERMARK !== 'false';
  if (!enabled) return null;
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 40px, rgba(255,0,120,0.06) 40px 80px)',
      }}
    />
  );
}

