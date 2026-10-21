import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Briefcase, Sparkles, ArrowRight, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import GigCard from '../components/GigCard';
import EmptyState from '../components/EmptyState';

export default function MyGigs() {
  const { currentUser } = useUser();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const loadMyGigs = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await api.getGigs({ user_id: currentUser.id });
      setGigs(data);
    } catch (err) {
      console.error('Error loading my gigs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyGigs();
  }, [currentUser]);

  const filteredGigs = activeTab === 'All' 
    ? gigs 
    : gigs.filter(g => g.status === activeTab);

  const getCount = (status) => {
    if (status === 'All') return gigs.length;
    return gigs.filter(g => g.status === status).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-100 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
              My Posted Opportunities
            </h1>
            {currentUser && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-light text-brand border border-brand-border/40 shrink-0">
                {currentUser.name}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-ink-500">
            Track applicant pitches, manage ongoing collaborations, and mark finished gigs to exchange mutual reviews.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-hover shadow-sm transition-all self-start sm:self-auto hover:scale-102 active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Gig</span>
        </Link>
      </div>

      {/* Filter Tabs with Dynamic Counts */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {['All', 'Open', 'In Progress', 'Completed'].map((tab) => {
          const count = getCount(tab);
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-ink-900 text-white shadow-sm'
                  : 'bg-white text-ink-700 hover:bg-ink-100 border border-ink-200/80 shadow-xs'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gigs List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-ink-200/70 animate-pulse" />
          ))}
        </div>
      ) : filteredGigs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={activeTab === 'All' ? 'You haven’t posted any gigs yet' : `No ${activeTab} gigs`}
          description={
            activeTab === 'All' 
              ? 'Share a skill you can teach or request help on your current university coursework.' 
              : `You do not have any gigs currently in ${activeTab} state.`
          }
          actionText={activeTab === 'All' ? 'Post an Opportunity Now' : undefined}
          onAction={activeTab === 'All' ? () => window.location.href = '/create' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.map(g => (
            <GigCard key={g.id} gig={g} />
          ))}
        </div>
      )}
    </div>
  );
}
