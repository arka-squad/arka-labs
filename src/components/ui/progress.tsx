/**
 * Progress UI Component - B28 Phase 3
 */

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export function Progress({
  value,
  max = 100,
  className = '',
  color = 'blue'
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-300 ${colors[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}