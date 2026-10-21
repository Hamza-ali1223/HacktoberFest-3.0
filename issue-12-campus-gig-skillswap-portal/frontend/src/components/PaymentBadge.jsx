import React from 'react';
import { Coins, Repeat2, HeartHandshake, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function PaymentBadge({ paymentType, budget, size = 'sm' }) {
  if (paymentType === 'Paid') {
    const formatted = budget ? `PKR ${Number(budget).toLocaleString()}` : 'Paid';
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
        <Coins className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>{formatted}</span>
      </span>
    );
  }

  if (paymentType === 'Skill Swap') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
        <Repeat2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span>Skill Swap</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
      <HeartHandshake className="w-3.5 h-3.5 text-sky-600 shrink-0" />
      <span>Free Collab</span>
    </span>
  );
}

export function TypeBadge({ type }) {
  const isOffering = type === 'Offering';
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
        isOffering 
          ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80' 
          : 'bg-amber-50/90 text-amber-800 border-amber-200/80'
      }`}
    >
      {isOffering ? (
        <>
          <ArrowUpRight className="w-3 h-3 text-indigo-500" />
          <span>Offering</span>
        </>
      ) : (
        <>
          <ArrowDownLeft className="w-3 h-3 text-amber-600" />
          <span>Requesting</span>
        </>
      )}
    </span>
  );
}
