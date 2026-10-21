import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, ArrowLeft, Send, CheckCircle2, XCircle, Clock, 
  ShieldCheck, Star, Users, MessageSquare, AlertCircle, Sparkles, UserCheck 
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PaymentBadge, { TypeBadge } from '../components/PaymentBadge';
import StudentAvatar from '../components/StudentAvatar';
import ReviewCard from '../components/ReviewCard';

export default function GigDetails() {
  const { id } = useParams();
  const { currentUser, refreshCurrentUser } = useUser();
  const { addToast } = useToast();

  const [gig, setGig] = useState(null);
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application submission modal/form state
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const gigData = await api.getGig(id);
      setGig(gigData);

      // Load applications
      const appsData = await api.getGigApplications(id);
      setApplications(appsData);

      // Load reviews if completed
      if (gigData.status === 'Completed') {
        const revsData = await api.getReviews({ gig_id: id });
        setReviews(revsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-6 w-32 bg-ink-200 rounded-lg mb-6 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-ink-200/70 p-8 animate-pulse mb-8" />
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-2xl border border-ink-200 shadow-card">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-ink-900 mb-1">Gig Not Found</h2>
          <p className="text-xs sm:text-sm text-ink-500 mb-6">{error || 'The requested gig does not exist.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Discover</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && Number(gig.user_id) === Number(currentUser.id);
  const userApplication = currentUser && applications.find(a => Number(a.applicant_id) === Number(currentUser.id));
  const isAcceptedApplicant = currentUser && Number(gig.accepted_applicant_id) === Number(currentUser.id);
  const isEligibleForReview = gig.status === 'Completed' && (isOwner || isAcceptedApplicant);
  const hasUserReviewed = currentUser && reviews.some(r => Number(r.reviewer_id) === Number(currentUser.id));

  // Handler: Apply to Gig
  const handleApply = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setApplyError('');

    if (!applyMessage.trim()) {
      setApplyError('Please write a message explaining why you are a good fit for this gig.');
      return;
    }

    try {
      setIsApplying(true);
      await api.applyToGig(gig.id, {
        applicant_id: currentUser.id,
        message: applyMessage
      });
      addToast('Application submitted successfully! The gig owner will review your pitch.', 'success');
      setApplyMessage('');
      loadData();
    } catch (err) {
      setApplyError(err.message);
      addToast(err.message, 'error');
    } finally {
      setIsApplying(false);
    }
  };

  // Handler: Accept Applicant
  const handleAcceptApplicant = async (applicationId, applicantName) => {
    try {
      await api.updateApplicationStatus(applicationId, {
        status: 'Accepted',
        user_id: currentUser.id
      });
      addToast(`Accepted ${applicantName}! Gig status changed to In Progress.`, 'success');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Handler: Reject Applicant
  const handleRejectApplicant = async (applicationId, applicantName) => {
    try {
      await api.updateApplicationStatus(applicationId, {
        status: 'Rejected',
        user_id: currentUser.id
      });
      addToast(`Application from ${applicantName} was rejected.`, 'info');
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Handler: Mark Completed (Owner only, from In Progress)
  const handleCompleteGig = async () => {
    try {
      await api.updateGig(gig.id, {
        status: 'Completed',
        user_id: currentUser.id
      });
      addToast('🎉 Congratulations! Gig marked as Completed. You can now leave a mutual review.', 'success');
      loadData();
      refreshCurrentUser();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Handler: Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!reviewComment.trim()) {
      setReviewError('Please provide a feedback comment.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await api.createReview({
        gig_id: gig.id,
        reviewer_id: currentUser.id,
        rating: reviewRating,
        comment: reviewComment
      });
      addToast('Review submitted and student rating updated!', 'success');
      setReviewComment('');
      loadData();
      refreshCurrentUser();
    } catch (err) {
      setReviewError(err.message);
      addToast(err.message, 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formattedDeadline = new Date(gig.deadline).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-500 hover:text-ink-900 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Discover</span>
      </Link>

      {/* Main Grid: Left Details, Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Gig Details Card */}
          <div className="bg-white rounded-2xl border border-ink-200/90 shadow-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-ink-100 text-ink-800 border border-ink-200/50">
                  {gig.category}
                </span>
                <TypeBadge type={gig.type} />
                <PaymentBadge paymentType={gig.payment_type} budget={gig.budget} />
              </div>
              <StatusBadge status={gig.status} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight leading-snug mb-4">
              {gig.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-ink-500 pb-6 border-b border-ink-100 mb-6">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-ink-400 shrink-0" />
                <span>Target Deadline: <strong className="text-ink-800 font-bold whitespace-nowrap">{formattedDeadline}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-ink-400 shrink-0" />
                <span><strong className="text-ink-800 font-bold">{applications.length}</strong> Applicants</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
                Project Overview &amp; Requirements
              </h3>
              <p className="whitespace-pre-line text-sm sm:text-base text-ink-800 leading-relaxed font-normal">
                {gig.description}
              </p>
            </div>

            {/* In Progress Owner Milestone Banner */}
            {gig.status === 'In Progress' && isOwner && (
              <div className="mt-8 p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Project Currently In Progress</span>
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Collaborating with <strong className="font-semibold">{gig.accepted_applicant_name || 'assigned student'}</strong>. When deliverables are complete, mark this gig complete to exchange mutual reviews.
                  </p>
                </div>
                <button
                  onClick={handleCompleteGig}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all whitespace-nowrap self-start sm:self-auto hover:scale-102 active:scale-98"
                >
                  Mark Completed
                </button>
              </div>
            )}
          </div>

          {/* APPLICATION SECTION (For Students who do NOT own this gig) */}
          {!isOwner && (
            <div className="bg-white rounded-2xl border border-ink-200/90 shadow-card p-6 sm:p-8">
              <h3 className="text-lg font-bold text-ink-900 mb-1">
                Apply for this Collaboration
              </h3>

              {userApplication ? (
                <div className="p-4 sm:p-5 rounded-xl bg-canvas border border-ink-200/80 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                      Your Application Status
                    </span>
                    <StatusBadge status={userApplication.status} />
                  </div>
                  <p className="text-xs text-ink-500 italic mb-2">
                    Submitted on {new Date(userApplication.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-ink-800 bg-white p-3.5 rounded-xl border border-ink-100 leading-relaxed">
                    &ldquo;{userApplication.message}&rdquo;
                  </p>
                </div>
              ) : gig.status !== 'Open' ? (
                <div className="p-4 rounded-xl bg-ink-50 border border-ink-200 text-sm text-ink-600 mt-3">
                  This gig is currently <strong className="text-ink-900 font-semibold">{gig.status}</strong> and is no longer accepting new proposals.
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4 mt-3">
                  <p className="text-xs sm:text-sm text-ink-600">
                    Introduce yourself, highlight your relevant tools or experience, and explain how you can help complete this gig.
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                      Your Pitch Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Hi! I have extensive experience with React and Tailwind CSS. I have built similar components and can deliver cleanly before the deadline..."
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      className="w-full text-sm rounded-xl border border-ink-200 p-3.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>

                  {applyError && (
                    <p className="text-xs font-semibold text-rose-600">{applyError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isApplying}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-hover shadow-sm transition-all disabled:opacity-50 hover:scale-102 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isApplying ? 'Submitting Application...' : 'Send Application Pitch'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* OWNER MANAGEMENT PANEL (Applicant Review & Selection) */}
          {isOwner && (
            <div className="bg-white rounded-2xl border border-ink-200/90 shadow-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-ink-100">
                <div>
                  <h3 className="text-lg font-bold text-ink-900">
                    Applicant Proposals
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Review candidate pitches. Accepting one student atomically closes the gig to others.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-ink-100 text-ink-700">
                  {applications.length} Proposals
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="py-10 text-center text-ink-400 text-sm italic">
                  No applications received yet for this gig.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 sm:p-5 rounded-xl border border-ink-200/80 bg-canvas/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <StudentAvatar
                          name={app.applicant_name}
                          avatarUrl={app.applicant_avatar}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-sm font-bold text-ink-900">
                              {app.applicant_name}
                            </h4>
                            <span className="text-xs text-ink-400">•</span>
                            <span className="text-xs text-ink-600 font-medium">
                              {app.applicant_major} ({app.applicant_semester})
                            </span>
                            {app.applicant_rating && (
                              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-bold text-amber-800 border border-amber-200/50">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {app.applicant_rating}
                              </div>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-ink-800 bg-white p-3.5 rounded-xl border border-ink-100 mb-2.5 leading-relaxed font-normal">
                            &ldquo;{app.message}&rdquo;
                          </p>

                          {app.applicant_skills && app.applicant_skills.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {app.applicant_skills.map((s, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-ink-200 text-ink-600 font-semibold">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="sm:self-center shrink-0 flex items-center gap-2">
                        {app.status === 'Pending' && gig.status === 'Open' ? (
                          <>
                            <button
                              onClick={() => handleAcceptApplicant(app.id, app.applicant_name)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectApplicant(app.id, app.applicant_name)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-600 hover:text-rose-600 hover:bg-rose-50 border border-ink-200 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <StatusBadge status={app.status} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MUTUAL REVIEWS SECTION (When Gig is Completed) */}
          {gig.status === 'Completed' && (
            <div className="bg-white rounded-2xl border border-ink-200/90 shadow-card p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Mutual Verified Reviews</span>
                </h3>
                <p className="text-xs text-ink-500 mt-1">
                  Peer feedback exchanged between the gig owner and the accepted collaborator.
                </p>
              </div>

              {/* Review Submission Form if Eligible and hasn't reviewed yet */}
              {isEligibleForReview && !hasUserReviewed && (
                <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-brand-light/30 border border-brand-border/60 space-y-4">
                  <h4 className="text-sm font-bold text-ink-900">
                    Write a review for {isOwner ? gig.accepted_applicant_name : gig.owner_name}
                  </h4>

                  {/* Interactive Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-2">
                      Star Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (reviewHoverRating || reviewRating)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-ink-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-ink-800 ml-2">
                        {reviewRating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                      Your Feedback &amp; Collaboration Experience
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe how the collaboration went, communication, quality, and promptness..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs sm:text-sm rounded-xl border border-ink-200 bg-white p-3.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-xs font-semibold text-rose-600">{reviewError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand hover:bg-brand-hover shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Publishing Review...' : 'Publish Mutual Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-ink-400 italic">No reviews recorded yet for this gig.</p>
                ) : (
                  reviews.map((rev) => (
                    <ReviewCard key={rev.id} review={rev} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Poster Card & Collaborator Card */}
        <div className="space-y-6">
          {/* Gig Owner Card */}
          <div className="bg-white rounded-2xl border border-ink-200/90 shadow-card p-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block mb-4">
              Posted By
            </span>

            <div className="flex items-center gap-3.5 mb-4">
              <StudentAvatar
                name={gig.owner_name}
                avatarUrl={gig.owner_avatar}
                size="lg"
              />
              <div className="min-w-0">
                <h4 className="text-base font-bold text-ink-900 leading-tight">
                  {gig.owner_name}
                </h4>
                <p className="text-xs text-ink-600 font-medium truncate mt-0.5">
                  {gig.owner_major}
                </p>
                <p className="text-[11px] text-ink-400">
                  {gig.owner_semester}
                </p>
              </div>
            </div>

            {/* Owner Dynamic Rating from Database */}
            <div className="p-3 bg-canvas/70 rounded-xl border border-ink-100 flex items-center justify-between mb-4">
              <span className="text-xs text-ink-600 font-medium">Reputation</span>
              {gig.owner_rating ? (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-extrabold text-ink-900">{gig.owner_rating}</span>
                  <span className="text-[11px] text-ink-500">({gig.owner_review_count} reviews)</span>
                </div>
              ) : (
                <span className="text-xs text-ink-400 italic">No ratings yet</span>
              )}
            </div>

            {gig.owner_bio && (
              <p className="text-xs text-ink-600 leading-relaxed mb-4 font-normal">
                {gig.owner_bio}
              </p>
            )}

            {gig.owner_skills && gig.owner_skills.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block mb-2">
                  Skills &amp; Tech
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {gig.owner_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-canvas border border-ink-200/80 text-ink-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accepted Collaborator Card (if In Progress or Completed) */}
          {gig.accepted_applicant_name && (
            <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-card p-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accepted Collaborator</span>
              </span>

              <div className="flex items-center gap-3">
                <StudentAvatar
                  name={gig.accepted_applicant_name}
                  avatarUrl={gig.accepted_applicant_avatar}
                  size="md"
                />
                <div>
                  <h4 className="text-sm font-bold text-ink-900">
                    {gig.accepted_applicant_name}
                  </h4>
                  <p className="text-xs text-ink-500">
                    {gig.accepted_applicant_major}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
