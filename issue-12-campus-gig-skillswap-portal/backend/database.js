const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'campus_connect.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      major TEXT NOT NULL,
      semester TEXT NOT NULL,
      bio TEXT,
      skills TEXT NOT NULL, -- JSON array
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gigs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Offering', 'Requesting')),
      category TEXT NOT NULL CHECK(category IN ('Programming', 'Design', 'Writing', 'Tutoring')),
      payment_type TEXT NOT NULL CHECK(payment_type IN ('Paid', 'Skill Swap', 'Free')),
      budget REAL,
      deadline TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Completed', 'Expired', 'Cancelled')),
      accepted_applicant_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (accepted_applicant_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gig_id INTEGER NOT NULL,
      applicant_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Accepted', 'Rejected')),
      created_at TEXT NOT NULL,
      UNIQUE(gig_id, applicant_id),
      FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
      FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gig_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      reviewee_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(gig_id, reviewer_id),
      FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_gigs_user_id ON gigs(user_id);
    CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category);
    CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
    CREATE INDEX IF NOT EXISTS idx_applications_gig_id ON applications(gig_id);
    CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
  `);
}

initSchema();

// Helper to auto-expire past deadline open gigs
function expirePastDueGigs() {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE gigs 
    SET status = 'Expired' 
    WHERE status = 'Open' AND deadline < ?
  `).run(now);
}

module.exports = {
  db,
  expirePastDueGigs
};
