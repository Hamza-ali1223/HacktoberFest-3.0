import React, { useState, useEffect } from 'react';
import { Star, Award, Briefcase, CheckCircle2, UserCheck, Sparkles, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import StudentAvatar from '../components/StudentAvatar';
import ReviewCard from '../components/ReviewCard';

export default function Profile() {
  const { currentUser, users, switchUser } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await api.getUser(currentUser.id);
      setProfileData(data);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  if (loading || !profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-48 bg-white rounded-2xl border border-ink-200/70 animate-pulse p-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-ink-200/90 shadow-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-ink-100">
          <div className="flex items-start gap-4">
            <StudentAvatar
              name={profileData.name}
              avatarUrl={profileData.avatar_url}
              size="xl"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-ink-900 tracking-tight">
                  {profileData.name}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-light text-brand">
                  Student Member
                </span>
              </div>
              <p className="text-sm font-medium text-ink-600 mt-1">
                {profileData.major}
              </p>
              <p className="text-xs text-ink-400 mt-0.5">
                {profileData.semester} • Joined September 2026
              </p>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="sm:self-center">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
              Switch Student Demo
            </label>
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="text-xs font-medium rounded-xl border border-ink-200 bg-canvas px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.major.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio */}
        {profileData.bio && (
          <div className="py-5 border-b border-ink-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              About
            </h3>
            <p className="text-sm text-ink-700 leading-relaxed max-w-2xl">
              {profileData.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {profileData.skills && profileData.skills.length > 0 && (
          <div className="pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
              Skills &amp; Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-canvas border border-ink-200/80 text-ink-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid (Derived from backend data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Rating Card */}
        <div className="p-5 bg-white rounded-2xl border border-ink-200/90 shadow-card text-center">
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-2">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <span className="block text-2xl font-bold text-ink-900">
            {profileData.avg_rating !== null ? `${profileData.avg_rating}` : '—'}
          </span>
          <span className="text-xs text-ink-500">
            {profileData.review_count > 0 ? `Avg Rating (${profileData.review_count})` : 'No ratings yet'}
          </span>
        </div>

        {/* Gigs Posted */}
        <div className="p-5 bg-white rounded-2xl border border-ink-200/90 shadow-card text-center">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-brand mx-auto flex items-center justify-center mb-2">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="block text-2xl font-bold text-ink-900">
            {profileData.gigs_posted}
          </span>
          <span className="text-xs text-ink-500">Gigs Posted</span>
        </div>

        {/* Gigs Completed */}
        <div className="p-5 bg-white rounded-2xl border border-ink-200/90 shadow-card text-center">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="block text-2xl font-bold text-ink-900">
            {profileData.gigs_completed}
          </span>
          <span className="text-xs text-ink-500">Gigs Completed</span>
        </div>

        {/* Trust Status */}
        <div className="p-5 bg-white rounded-2xl border border-ink-200/90 shadow-card text-center">
          <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-2">
            <Award className="w-5 h-5" />
          </div>
          <span className="block text-2xl font-bold text-ink-900">Verified</span>
          <span className="text-xs text-ink-500">Campus Student</span>
        </div>
      </div>

      {/* Received Reviews Section */}
      <div className="bg-white rounded-2xl border border-ink-200/90 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink-100">
          <div>
            <h2 className="text-lg font-bold text-ink-900 tracking-tight">
              Community Reviews &amp; Testimonials
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Feedback from students who completed gigs or skill-swaps with {profileData.name}.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ink-100 text-ink-700">
            {profileData.reviews ? profileData.reviews.length : 0} Reviews
          </span>
        </div>

        {!profileData.reviews || profileData.reviews.length === 0 ? (
          <div className="py-8 text-center text-ink-400 text-xs sm:text-sm">
            No reviews received yet. Complete gigs to earn peer ratings and build campus reputation.
          </div>
        ) : (
          <div className="space-y-4">
            {profileData.reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
