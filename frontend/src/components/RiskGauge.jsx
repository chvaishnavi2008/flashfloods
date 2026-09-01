import React from 'react';

export default function RiskGauge({ score = 0, level = 'LOW', size = 'md' }) {
  // Score: 0 - 100
  const radius = size === 'lg' ? 48 : 36;
  const stroke = size === 'lg' ? 8 : 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return '#EF4444'; // Red
      case 'HIGH':
        return '#F97316'; // Orange
      case 'MODERATE':
        return '#F59E0B'; // Amber
      default:
        return '#10B981'; // Green
    }
  };

  const strokeColor = getColor(level);
  const dim = radius * 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={dim} width={dim} className="transform -rotate-90">
        <circle
          stroke="#334155"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`font-mono font-bold ${size === 'lg' ? 'text-xl' : 'text-sm'}`} style={{ color: strokeColor }}>
          {score}
        </span>
        <span className="text-[9px] font-mono text-slate-400 -mt-1">/100</span>
      </div>
    </div>
  );
}
