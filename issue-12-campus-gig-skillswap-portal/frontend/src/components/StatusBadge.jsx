import React from 'react';

const STATUS_CONFIGS = {
  'Open': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    dot: 'bg-emerald-500'
  },
  'In Progress': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
    dot: 'bg-amber-500'
  },
  'Completed': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
    dot: 'bg-blue-500'
  },
  'Expired': {
    bg: 'bg-zinc-100 text-zinc-600 border-zinc-200/80',
    dot: 'bg-zinc-400'
  },
  'Cancelled': {
    bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
    dot: 'bg-rose-500'
  },
  'Pending': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
    dot: 'bg-amber-500'
  },
  'Accepted': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    dot: 'bg-emerald-500'
  },
  'Rejected': {
    bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
    dot: 'bg-rose-500'
  }
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIGS[status] || {
    bg: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    dot: 'bg-zinc-400'
  };

  const sizeClasses = size === 'xs' 
    ? 'text-[11px] px-2 py-0.5 gap-1.5' 
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
