// 汎用ボタンコンポーネント

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = ''
}) => {
  const baseClasses = `
    font-serif-jp font-bold
    rounded-lg
    transition-all duration-200
    btn-press
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `;

  const variantClasses = {
    primary: 'bg-gradient-to-r from-kin to-amber-500 text-kon hover:from-amber-400 hover:to-kin shadow-lg',
    secondary: 'bg-ai text-washi border-2 border-kin/30 hover:bg-ai/80',
    danger: 'bg-shu text-washi hover:bg-red-700',
    ghost: 'bg-transparent text-washi hover:bg-white/10 border border-white/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
