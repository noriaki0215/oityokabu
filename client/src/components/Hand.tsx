// 手札表示コンポーネント

import React from 'react';
import { Card } from './Card';

interface HandProps {
  cards: number[];
  hideCards?: boolean;
  revealFirst?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Hand: React.FC<HandProps> = ({
  cards,
  hideCards = false,
  revealFirst = false,
  size = 'md',
  className = ''
}) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {cards.map((card, index) => (
        <Card
          key={index}
          value={card}
          isHidden={hideCards && !(revealFirst && index === 0)}
          size={size}
        />
      ))}
    </div>
  );
};
