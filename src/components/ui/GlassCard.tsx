import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  tilt?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  tilt = false,
  onClick,
}) => {
  const baseClasses = 'glass-card p-6';
  const hoverClasses = hover ? 'hover:shadow-xl' : '';
  const tiltClasses = tilt ? 'card-3d' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${tiltClasses} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
