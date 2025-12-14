import React, { useState } from 'react';

interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        required={required}
        className={`input-float w-full ${icon ? 'pl-12' : ''} peer`}
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          icon ? 'left-12' : 'left-4'
        } ${
          isFocused || hasValue
            ? '-top-2 text-xs bg-cream px-2 text-primary font-semibold'
            : 'top-1/2 -translate-y-1/2 text-gray-500'
        }`}
      >
        {label}
        {required && <span className="text-secondary ml-1">*</span>}
      </label>
    </div>
  );
};
