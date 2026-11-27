import React from 'react';
import { Music } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl luxury-glass my-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center mb-5 shadow-xl">
        {icon || <Music className="w-7 h-7" />}
      </div>
      <h3 className="font-display text-2xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl luxury-btn-primary font-bold text-xs tracking-wide cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
