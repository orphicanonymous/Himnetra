import React from 'react';
import type { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

const labels: Record<RiskLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  return (
    <span
      className={`risk-badge risk-${level}`}
      style={{ fontSize: size === 'sm' ? '10px' : '11px' }}
    >
      <span
        style={{
          width: size === 'sm' ? 5 : 6,
          height: size === 'sm' ? 5 : 6,
          borderRadius: '50%',
          background: 'currentColor',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {labels[level]}
    </span>
  );
};
