import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Star, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PaymentBadge, { TypeBadge } from './PaymentBadge';
import StudentAvatar from './StudentAvatar';

export default function GigCard({ gig }) {
  const deadlineDate = gig.deadline 
    ? new Date(gig.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

  const isExpired = gig.status === 'Expired';
  const isOpen = gig.status === 'Open';

  // Calculate days remaining if open
  let daysLeft = null;
  if (isOpen && gig.deadline) {
    const diffTime = new Date(gig.deadline) - new Date();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="group relative bg-white rounded-xl border border-ink-200/80 hover:border-brand-border hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex flex-col justify-between overflow-hidden animate-card-enter">
      {/* Top Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Meta Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-ink-100 text-ink-700 border border-ink-200/50">
              {gig.category}
            </span>
            <TypeBadge type={gig.type} />
          </div>
          <StatusBadge status={gig.status} size="xs" />
        </div>

        {/* Gig Title */}
        <Link to={`/gigs/${gig.id}`} className="group-hover:text-brand transition-colors block mb-2.5">
          <h3 className="text-base font-bold text-ink-900 leading-snug line-clamp-2">
            {gig.title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-ink-600 leading-relaxed line-clamp-3 mb-5">
          {gig.description}
        </p>

        {/* Auto spacer */}
        <div className="mt-auto" />

        {/* Student Poster Info */}
        <div className="pt-3.5 border-t border-ink-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <StudentAvatar
              name={gig.owner_name}
              avatarUrl={gig.owner_avatar}
              size="sm"
            />
            <div className="truncate">
              <span className="text-xs font-bold text-ink-900 block truncate leading-tight">
                {gig.owner_name}
              </span>
              <span className="text-[11px] text-ink-500 block truncate leading-tight mt-0.5">
                {gig.owner_major || gig.owner_semester}
              </span>
            </div>
          </div>

          {/* Poster Rating */}
          {gig.owner_rating ? (
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-900">
                {gig.owner_rating}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-ink-400 shrink-0 font-medium bg-ink-50 px-2 py-0.5 rounded border border-ink-100">
              New
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Bar */}
      <div className="px-4 sm:px-5 py-2.5 bg-[#FAF9F6] border-t border-ink-100 flex items-center justify-between gap-2.5 text-xs">
        <PaymentBadge paymentType={gig.payment_type} budget={gig.budget} />

        <div className="flex items-center gap-2.5 text-ink-500 shrink-0">
          {/* Deadline / Urgency indicator */}
          <div 
            className={`flex items-center gap-1 font-medium ${
              isExpired 
                ? 'text-rose-600' 
                : daysLeft !== null && daysLeft <= 3 
                ? 'text-amber-700 font-semibold' 
                : 'text-ink-600'
            }`}
            title={`Deadline: ${deadlineDate}`}
          >
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span>
              {isExpired ? 'Expired' : daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d left` : deadlineDate}
            </span>
          </div>

          {/* Applications Received */}
          {gig.application_count !== undefined && (
            <div className="flex items-center gap-1 text-ink-500" title={`${gig.application_count} applications received`}>
              <Users className="w-3.5 h-3.5 opacity-70" />
              <span className="font-semibold text-ink-700">{gig.application_count}</span>
            </div>
          )}

          {/* Quick Details Link */}
          <Link
            to={`/gigs/${gig.id}`}
            className="p-1 rounded-md text-ink-400 group-hover:text-brand hover:bg-white transition-colors"
            title="View Details & Apply"
            aria-label={`View details for ${gig.title}`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
