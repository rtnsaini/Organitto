import React from 'react';

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'gold' | 'neu' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  icon,
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300';

  const variantClasses = {
    primary: 'btn-premium',
    gold: 'btn-gold',
    neu: 'btn-neu text-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white bg-transparent',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
