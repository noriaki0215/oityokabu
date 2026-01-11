// モーダルコンポーネント

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* モーダル本体 */}
      <div 
        className="
          relative
          bg-gradient-to-br from-kon to-ai
          border-2 border-kin/30
          rounded-xl
          p-6
          max-w-sm w-full
          shadow-2xl
          fade-in
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-washi/60 hover:text-washi text-xl"
        >
          ✕
        </button>

        {/* タイトル */}
        {title && (
          <h2 className="text-xl font-bold text-kin mb-4 font-serif-jp">
            {title}
          </h2>
        )}

        {/* コンテンツ */}
        {children}
      </div>
    </div>
  );
};
