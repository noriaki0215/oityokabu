// カードコンポーネント（株札風デザイン）

import React from 'react';

interface CardProps {
  value?: number;
  isHidden?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const KANJI_NUMBERS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

export const Card: React.FC<CardProps> = ({ 
  value, 
  isHidden = false, 
  size = 'md',
  className = ''
}) => {
  const isSpecial = value === 4 || value === 9;

  const sizeClasses = {
    sm: 'w-10 h-14 text-lg',
    md: 'w-14 h-20 text-2xl',
    lg: 'w-20 h-28 text-4xl',
  };

  if (isHidden || value === undefined) {
    return (
      <div 
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br from-kon to-ai
          rounded-lg
          border-2 border-kin/30
          flex items-center justify-center
          text-kin font-serif-jp font-bold
          shadow-lg
          ${className}
        `}
      >
        株
      </div>
    );
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        rounded-lg
        border-2
        flex flex-col items-center justify-center
        font-serif-jp font-bold
        shadow-lg
        relative
        overflow-hidden
        ${isSpecial 
          ? 'bg-gradient-to-br from-shu to-red-800 border-kin text-amber-100' 
          : 'bg-gradient-to-br from-washi to-amber-100 border-ai text-ai'
        }
        ${className}
      `}
    >
      {/* 装飾パターン */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1 left-1 text-xs">❋</div>
        <div className="absolute top-1 right-1 text-xs">❋</div>
        <div className="absolute bottom-1 left-1 text-xs">❋</div>
        <div className="absolute bottom-1 right-1 text-xs">❋</div>
      </div>
      
      {/* 数字 */}
      <span className="relative z-10">{KANJI_NUMBERS[value]}</span>
      
      {/* 小さい数字表示 */}
      <span className={`
        absolute bottom-0.5 right-1 text-xs opacity-60
        ${size === 'sm' ? 'text-[8px]' : ''}
      `}>
        {value}
      </span>

      {/* 特別札の装飾 */}
      {isSpecial && (
        <div className="absolute top-0.5 left-1 text-kin text-xs">
          ✦
        </div>
      )}
    </div>
  );
};
