import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, AlertCircle, Coins, Calendar, 
  FileText, CheckCircle2, Repeat2, HeartHandshake, HelpCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import StudentAvatar from '../components/StudentAvatar';

export default function CreateGig() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [type, setType] = useState('Offering');
  const [paymentType, setPaymentType] = useState('Paid');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Please select an active demo student account.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    if (paymentType === 'Paid') {
      const numBudget = Number(budget);
      if (!numBudget || numBudget <= 0) {
        setError('Please enter a positive budget amount in PKR for paid gigs.');
        return;
      }
    }

    if (!deadline) {
      setError('Please select a target deadline date.');
      return;
    }

    if (new Date(deadline) <= new Date()) {
      setError('The deadline must be in the future.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        user_id: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        payment_type: paymentType,
        budget: paymentType === 'Paid' ? Number(budget) : null,
        deadline: new Date(deadline).toISOString()
      };

      const newGig = await api.createGig(payload);
      addToast('🎉 Opportunity published to marketplace!', 'success');
      setTimeout(() => {
        navigate(`/gigs/${newGig.id}`);
      }, 500);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-500 hover:text-ink-900 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Discover</span>
      </Link>

      <div className="bg-white rounded-2xl border border-ink-200/90 shadow-card p-6 sm:p-10">
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-ink-100 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand bg-brand-light px-2.5 py-1 rounded-full mb-2 border border-brand-border/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Marketplace</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
              Post an Opportunity
            </h1>
            <p className="text-xs sm:text-sm text-ink-500 mt-1">
              Whether you are offering your expertise or requesting peer help on a project.
            </p>
          </div>

          {currentUser && (
            <div className="hidden sm:flex items-center gap-2.5 p-2 rounded-xl bg-canvas border border-ink-100">
              <StudentAvatar name={currentUser.name} avatarUrl={currentUser.avatar_url} size="sm" />
              <div className="text-left text-xs">
                <p className="font-bold text-ink-900">{currentUser.name}</p>
                <p className="text-[10px] text-ink-400 font-medium">Posting Student</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gig Intent & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
                What is your role?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Offering', label: 'Offering Skills' },
                  { id: 'Requesting', label: 'Requesting Help' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border text-center transition-all ${
                      type === t.id
                        ? 'bg-ink-900 text-white border-ink-900 shadow-sm'
                        : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-canvas/40 px-3.5 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              >
                <option value="Programming">Programming &amp; Tech</option>
                <option value="Design">UI/UX &amp; Graphic Design</option>
                <option value="Writing">Writing &amp; Proofreading</option>
                <option value="Tutoring">Academic Tutoring</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
              Gig Title
            </label>
            <input
              type="text"
              required
              placeholder="E.g., Full-Stack React & Node.js Mentorship for Semester Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
              Description &amp; Deliverables
            </label>
            <textarea
              required
              rows={5}
              placeholder="Provide a detailed description of what you are offering or requesting, required tools, expectations, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-ink-200 p-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand leading-relaxed"
            />
          </div>

          {/* Compensation Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
              Compensation Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  id: 'Paid', 
                  label: 'Paid Gig', 
                  desc: 'Monetary reward in PKR', 
                  icon: Coins, 
                  color: 'text-emerald-600' 
                },
                { 
                  id: 'Skill Swap', 
                  label: 'Skill Swap', 
                  desc: 'Trade skills and knowledge', 
                  icon: Repeat2, 
                  color: 'text-purple-600' 
                },
                { 
                  id: 'Free', 
                  label: 'Free Collab', 
                  desc: 'Volunteer / peer study help', 
                  icon: HeartHandshake, 
                  color: 'text-sky-600' 
                }
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentType(opt.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand bg-brand-light/50 ring-1 ring-brand shadow-xs'
                        : 'border-ink-200 hover:border-ink-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${opt.color}`} />
                      <span className="text-sm font-bold text-ink-900">{opt.label}</span>
                    </div>
                    <p className="text-[11px] text-ink-500 leading-tight">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget & Target Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2 flex items-center justify-between">
                <span>Budget (PKR)</span>
                {paymentType !== 'Paid' && (
                  <span className="text-[10px] text-ink-400 font-normal lowercase">(Not required for swap/free)</span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-ink-400 font-bold">₨</span>
                <input
                  type="number"
                  disabled={paymentType !== 'Paid'}
                  placeholder={paymentType === 'Paid' ? '3500' : 'N/A'}
                  value={paymentType === 'Paid' ? budget : ''}
                  onChange={(e) => setBudget(e.target.value)}
                  className={`w-full rounded-xl border pl-8 pr-4 py-2.5 text-sm font-semibold ${
                    paymentType === 'Paid'
                      ? 'border-ink-200 text-ink-900 focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white'
                      : 'border-ink-100 bg-ink-100/50 text-ink-400 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
                Target Deadline
              </label>
              <input
                type="date"
                required
                min={minDateStr}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white"
              />
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="pt-5 border-t border-ink-100 flex items-center justify-end gap-3">
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-hover shadow-sm transition-all disabled:opacity-50 hover:scale-102 active:scale-98"
            >
              {loading ? 'Publishing...' : 'Publish to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
