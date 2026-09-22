import React from 'react';
import { RiskLevel } from '../../types';

interface RiskGaugeProps {
  score: number;
  level?: RiskLevel;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animate?: boolean;
  subtitle?: string;
  unit?: string;
  displayValue?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score = 0,
  level,
  size = 180,
  strokeWidth = 14,
  showLabel = true,
  animate = true,
  subtitle = 'INDEX SCORE',
  unit = '',
  displayValue,
}) => {
  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, safeScore)) / 100) * circumference;

  const getRiskColor = (val: number) => {
    if (val >= 68) return '#ef4444';
    if (val >= 36) return '#f59e0b';
    return '#10b981';
  };

  const getRiskBgColor = (val: number) => {
    if (val >= 68) return 'rgba(239, 68, 68, 0.12)';
    if (val >= 36) return 'rgba(245, 158, 11, 0.12)';
    return 'rgba(16, 185, 129, 0.12)';
  };

  const color = getRiskColor(safeScore);
  const bgColor = getRiskBgColor(safeScore);

  const determinedLevel: RiskLevel =
    level || (safeScore >= 68 ? 'High' : safeScore >= 36 ? 'Moderate' : 'Low');

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center drop-shadow-sm"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2ece6"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: animate ? 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease' : 'none',
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-3xl font-black tracking-tight text-slate-800 font-display">
            {displayValue ? displayValue : `${score}${unit}`}
          </span>
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1"
            style={{ color, backgroundColor: bgColor }}
          >
            {determinedLevel} Risk
          </span>
          {subtitle && (
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low (&lt;35)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> High (&ge;68)
          </span>
        </div>
      )}
    </div>
  );
};

