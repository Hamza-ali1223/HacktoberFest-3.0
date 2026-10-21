import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = SearchX, 
  title = 'No results found', 
  description = 'Try adjusting your search keywords or resetting filters.',
  actionText,
  onAction
}) {
  return (
    <div className="py-16 px-6 text-center bg-white rounded-2xl border border-ink-200/70 shadow-subtle max-w-lg mx-auto flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-sm text-ink-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-brand bg-brand-light hover:bg-brand/10 rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
