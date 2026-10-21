const express = require('express');
const cors = require('cors');
const { db, expirePastDueGigs } = require('./database');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auto-seed if needed
seedDatabase();

// Middleware to keep expired gigs up-to-date
app.use((req, res, next) => {
  try {
    expirePastDueGigs();
  } catch (err) {
    console.error('Error expiring past-due gigs:', err);
  }
  next();
});

// Helper to compute user stats (rating, gigs posted, gigs completed)
function getUserWithStats(user) {
  if (!user) return null;
  const ratingRow = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as review_count 
    FROM reviews 
    WHERE reviewee_id = ?
  `).get(user.id);

  const postedRow = db.prepare(`
    SELECT COUNT(*) as count FROM gigs WHERE user_id = ?
  `).get(user.id);

  const completedRow = db.prepare(`
    SELECT COUNT(*) as count FROM gigs 
    WHERE (user_id = ? OR accepted_applicant_id = ?) AND status = 'Completed'
  `).get(user.id, user.id);

  return {
    ...user,
    skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills,
    avg_rating: ratingRow && ratingRow.avg_rating ? Number(ratingRow.avg_rating.toFixed(1)) : null,
    review_count: ratingRow ? ratingRow.review_count : 0,
    gigs_posted: postedRow ? postedRow.count : 0,
    gigs_completed: completedRow ? completedRow.count : 0
  };
}

// ==========================================
// 1. STATS ENDPOINT
// ==========================================
app.get('/api/stats', (req, res) => {
  try {
    const openGigs = db.prepare("SELECT COUNT(*) as count FROM gigs WHERE status = 'Open'").get().count;
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const completedGigs = db.prepare("SELECT COUNT(*) as count FROM gigs WHERE status = 'Completed'").get().count;
    const inProgressGigs = db.prepare("SELECT COUNT(*) as count FROM gigs WHERE status = 'In Progress'").get().count;

    res.json({
      open_gigs: openGigs,
      total_students: totalStudents,
      completed_gigs: completedGigs,
      in_progress_gigs: inProgressGigs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Utility endpoint to hold load event for headless screenshots
app.get('/api/delay', (req, res) => {
  const ms = Math.min(Number(req.query.ms) || 1200, 5000);
  setTimeout(() => {
    res.setHeader('Content-Type', 'text/html');
    res.send('<html><body>delayed</body></html>');
  }, ms);
});

// ==========================================
// 2. USERS ENDPOINTS
// ==========================================
app.get('/api/users', (req, res) => {
  try {
    const rawUsers = db.prepare('SELECT * FROM users ORDER BY name ASC').all();
    const users = rawUsers.map(getUserWithStats);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const rawUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!rawUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = getUserWithStats(rawUser);

    // Fetch user reviews
    const reviews = db.prepare(`
      SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar, g.title as gig_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN gigs g ON r.gig_id = g.id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.id);

    res.json({ ...user, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. GIGS ENDPOINTS
// ==========================================
app.get('/api/gigs', (req, res) => {
  try {
    const { q, category, type, payment_type, status, user_id, min_budget, max_budget } = req.query;

    let query = `
      SELECT g.*, 
             u.name as owner_name, 
             u.major as owner_major, 
             u.semester as owner_semester, 
             u.avatar_url as owner_avatar,
             (SELECT COUNT(*) FROM applications WHERE gig_id = g.id) as application_count,
             (SELECT AVG(rating) FROM reviews WHERE reviewee_id = g.user_id) as owner_rating
      FROM gigs g
      JOIN users u ON g.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (q && q.trim()) {
      query += ` AND (g.title LIKE ? OR g.description LIKE ?)`;
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    if (category && category !== 'All') {
      query += ` AND g.category = ?`;
      params.push(category);
    }

    if (type && type !== 'All') {
      query += ` AND g.type = ?`;
      params.push(type);
    }

    if (payment_type && payment_type !== 'All') {
      query += ` AND g.payment_type = ?`;
      params.push(payment_type);
    }

    if (status && status !== 'All') {
      query += ` AND g.status = ?`;
      params.push(status);
    }

    if (user_id) {
      query += ` AND g.user_id = ?`;
      params.push(user_id);
    }

    if (min_budget) {
      query += ` AND g.budget >= ?`;
      params.push(Number(min_budget));
    }

    if (max_budget) {
      query += ` AND g.budget <= ?`;
      params.push(Number(max_budget));
    }

    query += ` ORDER BY g.created_at DESC`;

    const gigs = db.prepare(query).all(...params).map(g => ({
      ...g,
      owner_rating: g.owner_rating ? Number(Number(g.owner_rating).toFixed(1)) : null
    }));

    res.json(gigs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/gigs/:id', (req, res) => {
  try {
    const gig = db.prepare(`
      SELECT g.*, 
             u.name as owner_name, 
             u.major as owner_major, 
             u.semester as owner_semester, 
             u.bio as owner_bio,
             u.skills as owner_skills,
             u.avatar_url as owner_avatar,
             (SELECT AVG(rating) FROM reviews WHERE reviewee_id = g.user_id) as owner_rating,
             (SELECT COUNT(*) FROM reviews WHERE reviewee_id = g.user_id) as owner_review_count,
             acc.name as accepted_applicant_name,
             acc.avatar_url as accepted_applicant_avatar,
             acc.major as accepted_applicant_major
      FROM gigs g
      JOIN users u ON g.user_id = u.id
      LEFT JOIN users acc ON g.accepted_applicant_id = acc.id
      WHERE g.id = ?
    `).get(req.params.id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    gig.owner_skills = typeof gig.owner_skills === 'string' ? JSON.parse(gig.owner_skills) : gig.owner_skills;
    gig.owner_rating = gig.owner_rating ? Number(Number(gig.owner_rating).toFixed(1)) : null;

    res.json(gig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gigs', (req, res) => {
  try {
    const { user_id, title, description, type, category, payment_type, budget, deadline } = req.body;

    // Validation
    if (!user_id || !title || !description || !type || !category || !payment_type || !deadline) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!['Offering', 'Requesting'].includes(type)) {
      return res.status(400).json({ error: "Type must be 'Offering' or 'Requesting'." });
    }

    if (!['Programming', 'Design', 'Writing', 'Tutoring'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category.' });
    }

    if (!['Paid', 'Skill Swap', 'Free'].includes(payment_type)) {
      return res.status(400).json({ error: 'Invalid payment type.' });
    }

    let finalBudget = null;
    if (payment_type === 'Paid') {
      const parsedBudget = Number(budget);
      if (!parsedBudget || parsedBudget <= 0) {
        return res.status(400).json({ error: 'A positive budget is required for Paid gigs.' });
      }
      finalBudget = parsedBudget;
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be a valid future date.' });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User does not exist.' });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO gigs (user_id, title, description, type, category, payment_type, budget, deadline, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?)
    `).run(user_id, title.trim(), description.trim(), type, category, payment_type, finalBudget, deadlineDate.toISOString(), now);

    const createdGig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(createdGig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/gigs/:id', (req, res) => {
  try {
    const gigId = req.params.id;
    const { status, user_id } = req.body;

    const gig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found.' });
    }

    // Only owner can update gig status
    if (user_id && Number(gig.user_id) !== Number(user_id)) {
      return res.status(403).json({ error: 'Only the gig owner can update the gig.' });
    }

    if (status) {
      const validStatuses = ['Open', 'In Progress', 'Completed', 'Expired', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
      }

      // Rule: Do not permit Open -> Completed directly. Must be from In Progress.
      if (status === 'Completed' && gig.status !== 'In Progress') {
        return res.status(400).json({ error: 'A gig can only be marked Completed from In Progress.' });
      }

      // Rule: Expired, Cancelled, Completed gigs cannot be changed back arbitrarily
      if (['Expired', 'Cancelled', 'Completed'].includes(gig.status) && status !== gig.status) {
        return res.status(400).json({ error: `Cannot change status of a ${gig.status} gig.` });
      }

      db.prepare('UPDATE gigs SET status = ? WHERE id = ?').run(status, gigId);
    }

    const updated = db.prepare('SELECT * FROM gigs WHERE id = ?').get(gigId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. APPLICATIONS ENDPOINTS
// ==========================================
app.get('/api/gigs/:id/applications', (req, res) => {
  try {
    const applications = db.prepare(`
      SELECT a.*, 
             u.name as applicant_name, 
             u.major as applicant_major, 
             u.semester as applicant_semester, 
             u.bio as applicant_bio, 
             u.skills as applicant_skills,
             u.avatar_url as applicant_avatar,
             (SELECT AVG(rating) FROM reviews WHERE reviewee_id = a.applicant_id) as applicant_rating,
             (SELECT COUNT(*) FROM reviews WHERE reviewee_id = a.applicant_id) as applicant_review_count
      FROM applications a
      JOIN users u ON a.applicant_id = u.id
      WHERE a.gig_id = ?
      ORDER BY a.created_at DESC
    `).all(req.params.id).map(a => ({
      ...a,
      applicant_skills: typeof a.applicant_skills === 'string' ? JSON.parse(a.applicant_skills) : a.applicant_skills,
      applicant_rating: a.applicant_rating ? Number(Number(a.applicant_rating).toFixed(1)) : null
    }));

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/applications/user/:userId', (req, res) => {
  try {
    const userApps = db.prepare(`
      SELECT a.*, 
             g.title as gig_title, 
             g.status as gig_status, 
             g.category as gig_category,
             g.type as gig_type,
             g.payment_type as gig_payment_type,
             g.budget as gig_budget,
             g.deadline as gig_deadline,
             u.name as owner_name,
             u.avatar_url as owner_avatar
      FROM applications a
      JOIN gigs g ON a.gig_id = g.id
      JOIN users u ON g.user_id = u.id
      WHERE a.applicant_id = ?
      ORDER BY a.created_at DESC
    `).all(req.params.userId);

    res.json(userApps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gigs/:id/applications', (req, res) => {
  try {
    const gigId = req.params.id;
    const { applicant_id, message } = req.body;

    if (!applicant_id || !message || !message.trim()) {
      return res.status(400).json({ error: 'Applicant ID and application message are required.' });
    }

    const gig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found.' });
    }

    // Rule: The applicant cannot own the gig
    if (Number(gig.user_id) === Number(applicant_id)) {
      return res.status(400).json({ error: 'You cannot apply to your own gig.' });
    }

    // Rule: The gig must be Open
    if (gig.status !== 'Open') {
      return res.status(400).json({ error: `Cannot apply to this gig because it is currently ${gig.status}.` });
    }

    // Rule: The deadline must not have passed
    if (new Date(gig.deadline) <= new Date()) {
      db.prepare("UPDATE gigs SET status = 'Expired' WHERE id = ?").run(gigId);
      return res.status(400).json({ error: 'This gig has expired and can no longer accept applications.' });
    }

    // Rule: Applicant cannot apply twice
    const existing = db.prepare('SELECT id FROM applications WHERE gig_id = ? AND applicant_id = ?').get(gigId, applicant_id);
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted an application for this gig.' });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO applications (gig_id, applicant_id, message, status, created_at)
      VALUES (?, ?, ?, 'Pending', ?)
    `).run(gigId, applicant_id, message.trim(), now);

    const created = db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept or Reject application
app.patch('/api/applications/:id', (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status, user_id } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'Accepted' or 'Rejected'." });
    }

    const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const gig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(application.gig_id);
    if (!gig) {
      return res.status(404).json({ error: 'Associated gig not found.' });
    }

    // Rule: Only gig owner can accept or reject
    if (user_id && Number(gig.user_id) !== Number(user_id)) {
      return res.status(403).json({ error: 'Only the gig owner can accept or reject applicants.' });
    }

    if (gig.status !== 'Open') {
      return res.status(400).json({ error: `Cannot modify application because gig is already ${gig.status}.` });
    }

    if (status === 'Accepted') {
      // SQLite Transaction:
      // 1. Mark this application Accepted
      // 2. Reject all other Pending applications for that gig
      // 3. Change gig status to 'In Progress' and set accepted_applicant_id
      const acceptTransaction = db.transaction(() => {
        db.prepare("UPDATE applications SET status = 'Accepted' WHERE id = ?").run(applicationId);
        db.prepare("UPDATE applications SET status = 'Rejected' WHERE gig_id = ? AND id != ? AND status = 'Pending'").run(gig.id, applicationId);
        db.prepare("UPDATE gigs SET status = 'In Progress', accepted_applicant_id = ? WHERE id = ?").run(application.applicant_id, gig.id);
      });
      acceptTransaction();
    } else {
      // Reject
      db.prepare("UPDATE applications SET status = 'Rejected' WHERE id = ?").run(applicationId);
    }

    const updatedApp = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId);
    res.json(updatedApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. REVIEWS ENDPOINTS
// ==========================================
app.get('/api/reviews', (req, res) => {
  try {
    const { gig_id, user_id } = req.query;
    let query = `
      SELECT r.*, 
             reviewer.name as reviewer_name, 
             reviewer.avatar_url as reviewer_avatar,
             reviewee.name as reviewee_name,
             reviewee.avatar_url as reviewee_avatar,
             g.title as gig_title
      FROM reviews r
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      JOIN users reviewee ON r.reviewee_id = reviewee.id
      JOIN gigs g ON r.gig_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (gig_id) {
      query += ` AND r.gig_id = ?`;
      params.push(gig_id);
    }

    if (user_id) {
      query += ` AND (r.reviewee_id = ? OR r.reviewer_id = ?)`;
      params.push(user_id, user_id);
    }

    query += ` ORDER BY r.created_at DESC`;
    const reviews = db.prepare(query).all(...params);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const { gig_id, reviewer_id, rating, comment } = req.body;

    if (!gig_id || !reviewer_id || rating === undefined || !comment || !comment.trim()) {
      return res.status(400).json({ error: 'gig_id, reviewer_id, rating (1-5), and comment are required.' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const gig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(gig_id);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found.' });
    }

    // Rule: Gig must be Completed
    if (gig.status !== 'Completed') {
      return res.status(400).json({ error: 'Reviews can only be submitted after a gig is Completed.' });
    }

    // Rule: Eligible participants are only owner and accepted applicant
    const isOwner = Number(gig.user_id) === Number(reviewer_id);
    const isAcceptedApplicant = Number(gig.accepted_applicant_id) === Number(reviewer_id);

    if (!isOwner && !isAcceptedApplicant) {
      return res.status(403).json({ error: 'Only participants in this completed gig may leave a review.' });
    }

    const reviewee_id = isOwner ? gig.accepted_applicant_id : gig.user_id;

    // Rule: Can review the other only once per gig
    const existing = db.prepare('SELECT id FROM reviews WHERE gig_id = ? AND reviewer_id = ?').get(gig_id, reviewer_id);
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a review for this gig.' });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO reviews (gig_id, reviewer_id, reviewee_id, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(gig_id, reviewer_id, reviewee_id, numericRating, comment.trim(), now);

    const createdReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(createdReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CampusConnect Backend Server running on http://localhost:${PORT}`);
});
