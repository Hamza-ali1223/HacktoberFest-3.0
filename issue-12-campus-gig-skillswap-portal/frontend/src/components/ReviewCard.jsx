import React from 'react';
import { Star } from 'lucide-react';
import StudentAvatar from './StudentAvatar';

export default function ReviewCard({ review }) {
  const formattedDate = review.created_at 
    ? new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="p-4 bg-white rounded-xl border border-ink-200/80 shadow-subtle flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <StudentAvatar name={review.reviewer_name} avatarUrl={review.reviewer_avatar} size="md" />
          <div>
            <h4 className="text-sm font-semibold text-ink-900">{review.reviewer_name}</h4>
            {review.gig_title && (
              <p className="text-xs text-ink-500 line-clamp-1">on &ldquo;{review.gig_title}&rdquo;</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-amber-800">{review.rating}.0</span>
        </div>
      </div>

      <p className="text-sm text-ink-700 leading-relaxed italic">
        &ldquo;{review.comment}&rdquo;
      </p>

      {formattedDate && (
        <span className="text-[11px] text-ink-400 self-end">
          {formattedDate}
        </span>
      )}
    </div>
  );
}
