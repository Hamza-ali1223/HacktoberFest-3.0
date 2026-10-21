import React from 'react';

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700'
];

export default function StudentAvatar({ name = '', avatarUrl, size = 'md', className = '' }) {
  const getInitials = (n) => {
    if (!n) return 'CC';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const charCode = (name || 'A').charCodeAt(0);
  const colorClass = COLORS[charCode % COLORS.length];

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-medium',
    xl: 'w-16 h-16 text-xl font-semibold'
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover border border-black/5 ${sizeClasses[size] || sizeClasses.md} ${className}`}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium border border-black/5 select-none ${colorClass} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
