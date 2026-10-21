const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const { spawn } = require('child_process');
const path = require('path');

let serverProcess = null;

async function ensureServerRunning() {
  try {
    await request('GET', '/api/stats');
    return;
  } catch (e) {
    console.log('Starting local backend server for tests...');
    serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
      stdio: 'pipe'
    });
    // Wait for server to bind
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        await request('GET', '/api/stats');
        console.log('Server is ready.');
        return;
      } catch (err) {}
    }
    throw new Error('Failed to start server within timeout.');
  }
}

async function runTests() {
  await ensureServerRunning();
  console.log('--- STARTING COMPREHENSIVE BACKEND VALIDATION SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Stats test
    const statsRes = await request('GET', '/api/stats');
    assert(statsRes.status === 200, 'Stats endpoint returns 200');
    assert(statsRes.data.total_students >= 12, `Total students >= 12 (Found ${statsRes.data.total_students})`);
    assert(statsRes.data.open_gigs > 0, `Open gigs > 0 (Found ${statsRes.data.open_gigs})`);
    assert(statsRes.data.completed_gigs >= 4, `Completed gigs >= 4 (Found ${statsRes.data.completed_gigs})`);

    // 2. Users test
    const usersRes = await request('GET', '/api/users');
    assert(usersRes.status === 200 && usersRes.data.length >= 12, `GET /api/users returns >= 12 users (Found ${usersRes.data.length})`);
    const userWithRating = usersRes.data.find(u => u.avg_rating !== null);
    assert(userWithRating !== undefined, `Calculated dynamic avg_rating found (User ${userWithRating.name} has rating ${userWithRating.avg_rating})`);

    // 3. Gigs & Combined Filtering test
    const gigsRes = await request('GET', '/api/gigs');
    assert(gigsRes.status === 200 && gigsRes.data.length >= 25, `GET /api/gigs returns >= 25 gigs (Found ${gigsRes.data.length})`);

    // Filter by category
    const progGigs = await request('GET', '/api/gigs?category=Programming');
    assert(progGigs.data.every(g => g.category === 'Programming'), 'Category filter works (All returned gigs are Programming)');

    // Combined filter: category=Programming & payment_type=Paid
    const combined = await request('GET', '/api/gigs?category=Programming&payment_type=Paid');
    assert(combined.data.every(g => g.category === 'Programming' && g.payment_type === 'Paid'), 'Combined filter works (Programming + Paid)');

    // Keyword search
    const searchRes = await request('GET', '/api/gigs?q=React');
    assert(searchRes.data.some(g => g.title.includes('React') || g.description.includes('React')), 'Keyword search works for "React"');

    // 4. Create Gig Validations
    // Fail on past deadline
    const pastGig = await request('POST', '/api/gigs', {
      user_id: 1,
      title: 'Past Gig',
      description: 'Test',
      type: 'Offering',
      category: 'Programming',
      payment_type: 'Paid',
      budget: 1000,
      deadline: '2020-01-01T00:00:00Z'
    });
    assert(pastGig.status === 400, 'Rejects gig creation with past deadline');

    // Fail on non-positive budget for Paid
    const zeroBudget = await request('POST', '/api/gigs', {
      user_id: 1,
      title: 'Zero Budget',
      description: 'Test',
      type: 'Offering',
      category: 'Programming',
      payment_type: 'Paid',
      budget: 0,
      deadline: '2026-12-31T00:00:00Z'
    });
    assert(zeroBudget.status === 400, 'Rejects Paid gig with 0 budget');

    // Success create gig (Free stores budget as null)
    const validGig = await request('POST', '/api/gigs', {
      user_id: 1,
      title: 'Valid Peer Mentorship on Algorithms',
      description: 'Offering free help with binary search and sorting algorithms.',
      type: 'Offering',
      category: 'Tutoring',
      payment_type: 'Free',
      budget: 500, // Should be normalized to null
      deadline: '2026-12-31T00:00:00Z'
    });
    assert(validGig.status === 201 && validGig.data.budget === null, 'Free gig created and budget stored as null');

    const createdGigId = validGig.data.id;

    // 5. Application workflow validations
    // Owner cannot apply to their own gig
    const ownApp = await request('POST', `/api/gigs/${createdGigId}/applications`, {
      applicant_id: 1,
      message: 'Trying to apply to my own gig'
    });
    assert(ownApp.status === 400, 'Owner cannot apply to their own gig');

    // User 2 applies successfully
    const validApp1 = await request('POST', `/api/gigs/${createdGigId}/applications`, {
      applicant_id: 2,
      message: 'I would love to learn binary search!'
    });
    assert(validApp1.status === 201, 'Student 2 applied successfully');

    // Duplicate application rejected
    const dupApp = await request('POST', `/api/gigs/${createdGigId}/applications`, {
      applicant_id: 2,
      message: 'Applying again'
    });
    assert(dupApp.status === 400, 'Duplicate application rejected');

    // User 3 also applies
    const validApp2 = await request('POST', `/api/gigs/${createdGigId}/applications`, {
      applicant_id: 3,
      message: 'I want to join as well!'
    });
    assert(validApp2.status === 201, 'Student 3 applied successfully');

    // 6. Applicant Selection (Acceptance Transaction)
    // Non-owner cannot accept applicant
    const nonOwnerAccept = await request('PATCH', `/api/applications/${validApp1.data.id}`, {
      status: 'Accepted',
      user_id: 2 // User 2 is not owner
    });
    assert(nonOwnerAccept.status === 403, 'Non-owner cannot accept applicant');

    // Owner accepts applicant 2
    const ownerAccept = await request('PATCH', `/api/applications/${validApp1.data.id}`, {
      status: 'Accepted',
      user_id: 1
    });
    assert(ownerAccept.status === 200 && ownerAccept.data.status === 'Accepted', 'Owner accepted student 2');

    // Verify other pending applications rejected & gig is now In Progress
    const updatedGig = await request('GET', `/api/gigs/${createdGigId}`);
    assert(updatedGig.data.status === 'In Progress', 'Gig transitioned to In Progress');
    assert(updatedGig.data.accepted_applicant_id === 2, 'Gig recorded accepted applicant ID 2');

    const appList = await request('GET', `/api/gigs/${createdGigId}/applications`);
    const app3 = appList.data.find(a => a.applicant_id === 3);
    assert(app3.status === 'Rejected', 'Student 3 pending application automatically marked Rejected');

    // 7. Status transition rules
    // First test illegal direct transition from Open -> Completed
    const newOpenGig = await request('POST', '/api/gigs', {
      user_id: 1,
      title: 'Another Open Gig',
      description: 'Testing invalid direct transition',
      type: 'Offering',
      category: 'Writing',
      payment_type: 'Free',
      deadline: '2026-12-31T00:00:00Z'
    });
    const illegalComplete = await request('PATCH', `/api/gigs/${newOpenGig.data.id}`, {
      status: 'Completed',
      user_id: 1
    });
    assert(illegalComplete.status === 400, 'Direct Open -> Completed transition rejected');

    // Now test legal transition from In Progress -> Completed on createdGigId
    const legalComplete = await request('PATCH', `/api/gigs/${createdGigId}`, {
      status: 'Completed',
      user_id: 1
    });
    assert(legalComplete.status === 200 && legalComplete.data.status === 'Completed', 'In Progress -> Completed transition succeeds');

    // 8. Mutual Reviews
    // Non-participant cannot review
    const nonPartReview = await request('POST', '/api/reviews', {
      gig_id: createdGigId,
      reviewer_id: 4, // User 4 did not participate
      rating: 5,
      comment: 'Random review'
    });
    assert(nonPartReview.status === 403, 'Non-participant review rejected');

    // Reviewer 1 (Owner) reviews Reviewee 2 (Accepted Applicant)
    const validRev1 = await request('POST', '/api/reviews', {
      gig_id: createdGigId,
      reviewer_id: 1,
      rating: 5,
      comment: 'Excellent student, very attentive and quick to learn!'
    });
    assert(validRev1.status === 201, 'Owner left 5-star review for accepted applicant');

    // Duplicate review rejected
    const dupRev = await request('POST', '/api/reviews', {
      gig_id: createdGigId,
      reviewer_id: 1,
      rating: 4,
      comment: 'Another review attempt'
    });
    assert(dupRev.status === 400, 'Duplicate review from same reviewer rejected');

    // Reviewer 2 (Accepted applicant) reviews Owner 1
    const validRev2 = await request('POST', '/api/reviews', {
      gig_id: createdGigId,
      reviewer_id: 2,
      rating: 5,
      comment: 'Bilal is an amazing mentor! Really helped me understand complex algorithms.'
    });
    assert(validRev2.status === 201, 'Accepted applicant left review for owner');

    console.log(`\n========================================`);
    console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================`);

    if (serverProcess) {
      serverProcess.kill();
    }

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    if (serverProcess) {
      serverProcess.kill();
    }
    console.error('Fatal test runner error:', err);
    process.exit(1);
  }
}

runTests();
