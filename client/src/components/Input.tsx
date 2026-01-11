// 入力フィールドコンポーネント

import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  className = '',
  autoFocus = false,
  onKeyDown,
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      className={`
        w-full
        px-4 py-3
        bg-washi/10
        border-2 border-kin/30
        rounded-lg
        text-washi text-center text-lg
        font-serif-jp
        placeholder:text-washi/50
        focus:outline-none focus:border-kin
        transition-colors
        ${className}
      `}
    />
  );
};
