import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Calendar, ArrowUpRight, Compass, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import StatusBadge from '../components/StatusBadge';
import PaymentBadge from '../components/PaymentBadge';
import StudentAvatar from '../components/StudentAvatar';
import EmptyState from '../components/EmptyState';

export default function MyApplications() {
  const { currentUser } = useUser();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await api.getUserApplications(currentUser.id);
      setApplications(data);
    } catch (err) {
      console.error('Error loading user applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [currentUser]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="pb-6 border-b border-ink-100 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
            My Submitted Pitches
          </h1>
          {currentUser && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-light text-brand border border-brand-border/40 shrink-0">
              {currentUser.name}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-ink-500">
          Track the status of your applications and collaborate once accepted by gig owners.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-ink-200/70 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications submitted yet"
          description="Browse open campus opportunities on the Discover page and apply with your skills."
          actionText="Explore Discover Feed"
          onAction={() => window.location.href = '/'}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-5 sm:p-6 bg-white rounded-2xl border border-ink-200/90 shadow-card hover:border-brand-border/90 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-ink-100 text-ink-700">
                    {app.gig_category}
                  </span>
                  <PaymentBadge paymentType={app.gig_payment_type} budget={app.gig_budget} />
                  <StatusBadge status={app.status} />
                </div>

                <Link
                  to={`/gigs/${app.gig_id}`}
                  className="text-base sm:text-lg font-bold text-ink-900 hover:text-brand transition-colors block mb-2 leading-snug"
                >
                  {app.gig_title}
                </Link>

                <p className="text-xs sm:text-sm text-ink-800 bg-[#F8F8F5] p-3.5 rounded-xl border border-ink-100/90 mb-3.5 leading-relaxed font-normal">
                  &ldquo;{app.message}&rdquo;
                </p>

                <div className="flex items-center gap-4 text-xs text-ink-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <StudentAvatar name={app.owner_name} avatarUrl={app.owner_avatar} size="xs" />
                    <span className="font-medium">Gig Owner: <strong className="text-ink-800 font-bold">{app.owner_name}</strong></span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-ink-400" />
                    <span>Submitted on {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="sm:self-center shrink-0">
                <Link
                  to={`/gigs/${app.gig_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-brand bg-brand-light hover:bg-brand/10 transition-colors"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
