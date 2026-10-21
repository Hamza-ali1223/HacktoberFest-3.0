import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Sparkles, Filter, SlidersHorizontal, RotateCcw, 
  Briefcase, Users, CheckCircle2, ArrowRight, X, ArrowUpRight,
  ChevronDown, Layers, Repeat2, Coins, HeartHandshake, Zap
} from 'lucide-react';
import { api } from '../services/api';
import GigCard from '../components/GigCard';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  { id: 'All', label: 'All Opportunities' },
  { id: 'Programming', label: 'Programming & Tech' },
  { id: 'Design', label: 'Design & Creative' },
  { id: 'Writing', label: 'Writing & Academics' },
  { id: 'Tutoring', label: 'Tutoring & Prep' }
];

const TYPES = ['All', 'Offering', 'Requesting'];
const PAYMENT_TYPES = ['All', 'Paid', 'Skill Swap', 'Free'];
const STATUSES = ['All', 'Open', 'In Progress', 'Completed'];

export default function Discover() {
  const [gigs, setGigs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load stats dynamically from backend
  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  // Fetch gigs whenever filters change
  const fetchGigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getGigs({
        q: searchQuery,
        category: selectedCategory,
        type: selectedType,
        payment_type: selectedPayment,
        status: selectedStatus,
        min_budget: minBudget,
        max_budget: maxBudget
      });
      setGigs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGigs();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedType, selectedPayment, selectedStatus, minBudget, maxBudget]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedPayment('All');
    setSelectedStatus('All');
    setMinBudget('');
    setMaxBudget('');
  };

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'All') count++;
    if (selectedPayment !== 'All') count++;
    if (selectedStatus !== 'All') count++;
    if (minBudget || maxBudget) count++;
    return count;
  }, [selectedType, selectedPayment, selectedStatus, minBudget, maxBudget]);

  const hasAnyFilter = searchQuery || selectedCategory !== 'All' || activeFilterCount > 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Compact Editorial Hero Section */}
      <section className="relative bg-white border-b border-ink-200/70 pt-8 pb-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Top Label & Headline */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-light text-brand text-[11px] font-semibold tracking-wide border border-brand-border/60 mb-2.5">
                <Sparkles className="w-3 h-3 text-brand" />
                <span>Student Freelance &amp; Skill Exchange</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink-900 leading-tight">
                Exchange skills. Find gigs. <span className="text-brand">Collaborate on campus.</span>
              </h1>
            </div>

            {/* Platform Stats Ribbon (Slim, elegant row instead of bulky cards) */}
            {stats && (
              <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-canvas/70 px-3.5 py-2 rounded-xl border border-ink-200/70 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-ink-900 text-sm sm:text-base">{stats.open_gigs}</span>
                  <span className="text-ink-500 text-[11px]">Open</span>
                </div>
                <span className="text-ink-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-brand text-sm sm:text-base">{stats.total_students}</span>
                  <span className="text-ink-500 text-[11px]">Students</span>
                </div>
                <span className="text-ink-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-700 text-sm sm:text-base">{stats.completed_gigs}</span>
                  <span className="text-ink-500 text-[11px]">Completed</span>
                </div>
              </div>
            )}
          </div>

          {/* Unified High-Craft Search Field */}
          <div className="relative">
            <div className="flex items-center bg-white rounded-xl shadow-subtle border border-ink-200/90 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all p-1.5">
              <Search className="w-4 h-4 text-ink-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search gigs, skills, or subjects (e.g., React, Figma, Calculus, LaTeX, Docker)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-lg text-ink-400 hover:text-ink-800 transition-colors mr-1"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Marketplace Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Category Tabs & Filter Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-200/60 mb-5">
          {/* Category Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isSelected
                      ? 'bg-ink-900 text-white shadow-xs'
                      : 'bg-white text-ink-700 hover:text-ink-900 hover:bg-ink-50 border border-ink-200/70'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Filter Drawer Toggle & Quick Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                showFilters || activeFilterCount > 0
                  ? 'bg-brand-light text-brand border-brand-border/80 shadow-xs'
                  : 'bg-white text-ink-700 border-ink-200/80 hover:bg-ink-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {hasAnyFilter && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-500 hover:text-ink-900 bg-white border border-ink-200/70 hover:bg-ink-50 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Refined Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-ink-200/80 shadow-subtle mb-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100 mb-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                Filter Marketplace
              </span>
              <button
                onClick={() => setShowFilters(false)}
                className="text-xs text-ink-400 hover:text-ink-700 p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Type Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
                  Intent
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-ink-200 bg-canvas/40 px-2.5 py-1.5 text-ink-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>{t === 'All' ? 'All (Offering & Requesting)' : t}</option>
                  ))}
                </select>
              </div>

              {/* Payment Model Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
                  Compensation
                </label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full text-xs rounded-lg border border-ink-200 bg-canvas/40 px-2.5 py-1.5 text-ink-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {PAYMENT_TYPES.map(p => (
                    <option key={p} value={p}>{p === 'All' ? 'All Models' : p}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full text-xs rounded-lg border border-ink-200 bg-canvas/40 px-2.5 py-1.5 text-ink-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range (PKR) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
                  Budget (PKR)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-1/2 text-xs rounded-lg border border-ink-200 bg-canvas/40 px-2.5 py-1.5 text-ink-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <span className="text-xs text-ink-400 font-bold">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-1/2 text-xs rounded-lg border border-ink-200 bg-canvas/40 px-2.5 py-1.5 text-ink-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags Row (Dismissible chips) */}
        {hasAnyFilter && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs text-ink-400 font-medium">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-ink-100 text-ink-800">
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-ink-100 text-ink-800">
                <span>{selectedCategory}</span>
                <button onClick={() => setSelectedCategory('All')} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-ink-100 text-ink-800">
                <span>{selectedType}</span>
                <button onClick={() => setSelectedType('All')} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPayment !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-ink-100 text-ink-800">
                <span>{selectedPayment}</span>
                <button onClick={() => setSelectedPayment('All')} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-ink-100 text-ink-800">
                <span>{selectedStatus}</span>
                <button onClick={() => setSelectedStatus('All')} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minBudget || maxBudget) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-ink-100 text-ink-800">
                <span>PKR {minBudget || '0'} - {maxBudget || '∞'}</span>
                <button onClick={() => { setMinBudget(''); setMaxBudget(''); }} className="hover:text-ink-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm text-ink-500 font-medium">
            Showing <strong className="text-ink-900 font-bold">{gigs.length}</strong> opportunities
          </p>
        </div>

        {/* Responsive Gigs Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-ink-200/70 animate-pulse p-5 flex flex-col justify-between">
                <div>
                  <div className="h-4 bg-ink-100 rounded w-1/3 mb-3" />
                  <div className="h-5 bg-ink-200 rounded w-3/4 mb-2" />
                  <div className="h-3.5 bg-ink-100 rounded w-full mb-1" />
                  <div className="h-3.5 bg-ink-100 rounded w-2/3" />
                </div>
                <div className="h-8 bg-ink-50 rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-center">
            <p className="font-semibold text-sm">Failed to load gigs: {error}</p>
          </div>
        ) : gigs.length === 0 ? (
          <EmptyState
            title="No matching campus opportunities found"
            description="Try modifying your search keywords, picking another category, or resetting your filter criteria."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
