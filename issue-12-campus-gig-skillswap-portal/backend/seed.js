const { db } = require('./database');

function seedDatabase(force = false) {
  if (force) {
    db.prepare('DELETE FROM reviews').run();
    db.prepare('DELETE FROM applications').run();
    db.prepare('DELETE FROM gigs').run();
    db.prepare('DELETE FROM users').run();
  } else {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount > 0) {
      console.log(`Database already seeded (${userCount} users found). Skipping.`);
      return;
    }
  }

  console.log('Seeding database with realistic campus data...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, major, semester, bio, skills, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertGig = db.prepare(`
    INSERT INTO gigs (id, user_id, title, description, type, category, payment_type, budget, deadline, status, accepted_applicant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertApp = db.prepare(`
    INSERT INTO applications (id, gig_id, applicant_id, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, gig_id, reviewer_id, reviewee_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // 14 Realistic Users (Exceeds 12 minimum)
    const users = [
      {
        id: 1,
        name: 'Bilal Ahmed',
        major: 'Software Engineering',
        semester: '6th Semester',
        bio: 'Full-stack MERN & Python developer. President of Campus Coding Club.',
        skills: JSON.stringify(['React', 'Node.js', 'Express', 'Tailwind CSS', 'PostgreSQL']),
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-01T10:00:00Z'
      },
      {
        id: 2,
        name: 'Ayesha Khan',
        major: 'Computer Systems Engineering',
        semester: '7th Semester',
        bio: 'UI/UX enthusiast with 3 years of Figma experience. Love crafting clean design systems.',
        skills: JSON.stringify(['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping']),
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-02T11:00:00Z'
      },
      {
        id: 3,
        name: 'Hamza Ali',
        major: 'Computer Science',
        semester: '5th Semester',
        bio: 'Competitive programmer (Codeforces Specialist) and Data Structures & Algorithms tutor.',
        skills: JSON.stringify(['C++', 'Python', 'Algorithms', 'Data Structures', 'Git']),
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-03T09:30:00Z'
      },
      {
        id: 4,
        name: 'Zainab Fatima',
        major: 'English Linguistics & Literature',
        semester: '8th Semester',
        bio: 'Academic proofreader, technical writer, and IEEE student chapter lead editor.',
        skills: JSON.stringify(['Technical Writing', 'Proofreading', 'LaTeX', 'Research Papers', 'Editing']),
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-04T14:15:00Z'
      },
      {
        id: 5,
        name: 'Daniyal Tariq',
        major: 'Electrical Engineering',
        semester: '6th Semester',
        bio: 'Embedded systems tinkerer, Arduino/ESP32 specialist, and circuit design hobbyist.',
        skills: JSON.stringify(['C', 'Arduino', 'PCB Design', 'MATLAB', 'Circuit Simulation']),
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-05T08:00:00Z'
      },
      {
        id: 6,
        name: 'Hira Siddiqui',
        major: 'Artificial Intelligence',
        semester: '4th Semester',
        bio: 'Machine learning practitioner. Passionate about computer vision and PyTorch.',
        skills: JSON.stringify(['Python', 'PyTorch', 'Data Analysis', 'Scikit-Learn', 'Pandas']),
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-06T16:20:00Z'
      },
      {
        id: 7,
        name: 'Usman Farooq',
        major: 'Software Engineering',
        semester: '7th Semester',
        bio: 'DevOps & Cloud architecture enthusiast. Docker, AWS, and CI/CD pipelines.',
        skills: JSON.stringify(['Docker', 'Linux', 'AWS', 'CI/CD', 'Bash Scripting']),
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-07T12:45:00Z'
      },
      {
        id: 8,
        name: 'Mahnoor Shah',
        major: 'Business Information Technology',
        semester: '5th Semester',
        bio: 'Graphic design & brand identity specialist. Canva Pro & Adobe Illustrator pro.',
        skills: JSON.stringify(['Illustrator', 'Branding', 'Social Media Graphics', 'Canva', 'Photoshop']),
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-08T15:10:00Z'
      },
      {
        id: 9,
        name: 'Saad Ur Rehman',
        major: 'Mathematics & Computer Science',
        semester: '6th Semester',
        bio: 'Calculus, Linear Algebra, and Discrete Math tutor. Helped 40+ juniors ace midterms.',
        skills: JSON.stringify(['Calculus', 'Linear Algebra', 'Discrete Math', 'Statistics', 'Tutoring']),
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-09T11:20:00Z'
      },
      {
        id: 10,
        name: 'Fatima Noor',
        major: 'Cyber Security',
        semester: '5th Semester',
        bio: 'Ethical hacker and web application security researcher. CTF player.',
        skills: JSON.stringify(['Web Security', 'Penetration Testing', 'Python', 'Networking', 'OWASP Top 10']),
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-10T09:00:00Z'
      },
      {
        id: 11,
        name: 'Omer Sheikh',
        major: 'Software Engineering',
        semester: '8th Semester',
        bio: 'Flutter and React Native mobile developer with 2 apps published on Play Store.',
        skills: JSON.stringify(['Flutter', 'Dart', 'React Native', 'Firebase', 'Mobile UI']),
        avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-11T13:30:00Z'
      },
      {
        id: 12,
        name: 'Sana Javed',
        major: 'Media Studies & Communication',
        semester: '6th Semester',
        bio: 'Copywriter, pitch deck designer, and presentation coach for startup competitions.',
        skills: JSON.stringify(['Presentation Design', 'Pitch Decks', 'Copywriting', 'Public Speaking']),
        avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-12T10:45:00Z'
      },
      {
        id: 13,
        name: 'Mustafa Raza',
        major: 'Data Science',
        semester: '3rd Semester',
        bio: 'Eager sophomore learning SQL, Python visualization, and web scraping.',
        skills: JSON.stringify(['SQL', 'Python', 'Excel', 'Data Visualization']),
        avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-13T14:00:00Z'
      },
      {
        id: 14,
        name: 'Khadija Mir',
        major: 'Computer Science',
        semester: '4th Semester',
        bio: 'Frontend developer learning Three.js and Tailwind CSS. Open source contributor.',
        skills: JSON.stringify(['JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git']),
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        created_at: '2026-09-14T17:15:00Z'
      }
    ];

    users.forEach(u => {
      insertUser.run(u.id, u.name, u.major, u.semester, u.bio, u.skills, u.avatar_url, u.created_at);
    });

    // 27 Gigs (Exceeds 25 minimum, all 4 categories, Offering/Requesting, Paid/Skill Swap/Free, Open/In Progress/Completed/Expired/Cancelled)
    const gigs = [
      // Open Gigs (Active)
      {
        id: 1,
        user_id: 1, // Bilal
        title: 'Full-Stack React & Express Dashboard Mentorship',
        description: 'Offering 1-on-1 tutoring sessions to help juniors build RESTful APIs and clean Tailwind interfaces for their semester projects.',
        type: 'Offering',
        category: 'Programming',
        payment_type: 'Paid',
        budget: 3500,
        deadline: '2026-11-20T23:59:59Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-15T09:00:00Z'
      },
      {
        id: 2,
        user_id: 3, // Hamza
        title: 'Need High-Fidelity Figma UI for Campus Bus Tracking App',
        description: 'Requesting a creative designer to build an 8-screen mobile UI for our FYP bus tracking project. Looking for modern, clean components.',
        type: 'Requesting',
        category: 'Design',
        payment_type: 'Paid',
        budget: 6000,
        deadline: '2026-11-15T18:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-16T10:30:00Z'
      },
      {
        id: 3,
        user_id: 4, // Zainab
        title: 'IEEE Research Paper Formatting & Proofreading',
        description: 'Offering thorough grammatical revision, LaTeX formatting, and reference sanity checks for student conference submissions.',
        type: 'Offering',
        category: 'Writing',
        payment_type: 'Skill Swap',
        budget: null,
        deadline: '2026-11-25T12:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-16T14:00:00Z'
      },
      {
        id: 4,
        user_id: 9, // Saad
        title: 'Calculus II & Differential Equations Crash Course',
        description: 'Offering weekly midterm preparation groups for Multivariable Calculus, Laplace Transforms, and vector fields.',
        type: 'Offering',
        category: 'Tutoring',
        payment_type: 'Free',
        budget: null,
        deadline: '2026-11-30T20:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-17T08:30:00Z'
      },
      {
        id: 5,
        user_id: 5, // Daniyal
        title: 'Need Help Debugging ESP32 FreeRTOS Semaphore Issue',
        description: 'Working on a smart agriculture sensor node. Need someone familiar with FreeRTOS queues and task synchronization in C++.',
        type: 'Requesting',
        category: 'Programming',
        payment_type: 'Skill Swap',
        budget: null,
        deadline: '2026-11-12T17:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-17T11:00:00Z'
      },
      {
        id: 6,
        user_id: 8, // Mahnoor
        title: 'Society Event Poster & Instagram Carousel Pack',
        description: 'Offering modern event branding, social media banners, and speaker announcement graphics for student societies.',
        type: 'Offering',
        category: 'Design',
        payment_type: 'Paid',
        budget: 2500,
        deadline: '2026-11-18T19:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-17T15:20:00Z'
      },
      {
        id: 7,
        user_id: 6, // Hira
        title: 'Looking for Python Web Scraping Script for News Sentiment',
        description: 'Need a BeautifulSoup/Selenium script to collect headlines from 3 local news portals daily for an NLP research dataset.',
        type: 'Requesting',
        category: 'Programming',
        payment_type: 'Paid',
        budget: 4000,
        deadline: '2026-11-14T22:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-18T09:15:00Z'
      },
      {
        id: 8,
        user_id: 11, // Omer
        title: 'Mobile App Architecture Consultation & Code Review',
        description: 'Offering 45-minute code reviews for Flutter/React Native state management (Bloc, Riverpod, Redux) and clean structure.',
        type: 'Offering',
        category: 'Programming',
        payment_type: 'Free',
        budget: null,
        deadline: '2026-11-28T16:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-18T12:00:00Z'
      },
      {
        id: 9,
        user_id: 12, // Sana
        title: 'Startup Pitch Deck Copywriting & Slide Polish',
        description: 'Offering review and rewriting of investor pitch decks for Hult Prize / NIC Incubation campus teams.',
        type: 'Offering',
        category: 'Writing',
        payment_type: 'Paid',
        budget: 5000,
        deadline: '2026-11-22T21:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-18T14:30:00Z'
      },
      {
        id: 10,
        user_id: 13, // Mustafa
        title: 'Need Math Tutor for Discrete Structures & Set Theory',
        description: 'Struggling with recurrence relations, graph theory proofs, and logic propositions. Looking for a patient senior tutor.',
        type: 'Requesting',
        category: 'Tutoring',
        payment_type: 'Paid',
        budget: 3000,
        deadline: '2026-11-19T18:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-19T10:00:00Z'
      },
      {
        id: 11,
        user_id: 2, // Ayesha
        title: 'Design System & Component Library in Figma',
        description: 'Offering to build responsive, tokenized design systems with auto-layout and dark mode variants for web and mobile.',
        type: 'Offering',
        category: 'Design',
        payment_type: 'Skill Swap',
        budget: null,
        deadline: '2026-11-24T20:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-19T13:00:00Z'
      },
      {
        id: 12,
        user_id: 7, // Usman
        title: 'Need Dockerfile & GitHub Actions Workflow Setup',
        description: 'Requesting assistance to containerize a FastAPI backend and set up automated unit testing on push.',
        type: 'Requesting',
        category: 'Programming',
        payment_type: 'Paid',
        budget: 2000,
        deadline: '2026-11-16T19:30:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-19T16:00:00Z'
      },
      {
        id: 13,
        user_id: 10, // Fatima
        title: 'Web Application Vulnerability Assessment (OWASP Top 10)',
        description: 'Offering baseline black-box security scanning and vulnerability reports for student-built web projects.',
        type: 'Offering',
        category: 'Programming',
        payment_type: 'Paid',
        budget: 4500,
        deadline: '2026-11-26T23:59:59Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-20T08:45:00Z'
      },
      {
        id: 14,
        user_id: 14, // Khadija
        title: 'Need Technical Writer to Document REST API in Postman/Markdown',
        description: 'Looking for clear, well-structured documentation for our university timetable API including response schemas.',
        type: 'Requesting',
        category: 'Writing',
        payment_type: 'Paid',
        budget: 2500,
        deadline: '2026-11-17T17:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-20T11:20:00Z'
      },
      {
        id: 15,
        user_id: 3, // Hamza (has multiple pending applications)
        title: 'Data Structures & Algorithms (LeetCode/Midterm Prep)',
        description: 'Offering intense problem-solving sessions on Dynamic Programming, Trees, and Graph traversals in C++ or Python.',
        type: 'Offering',
        category: 'Tutoring',
        payment_type: 'Paid',
        budget: 3500,
        deadline: '2026-11-21T18:00:00Z',
        status: 'Open',
        accepted_applicant_id: null,
        created_at: '2026-10-20T14:00:00Z'
      },

      // In Progress Gigs (Accepted Applicant Assigned)
      {
        id: 16,
        user_id: 2, // Ayesha
        title: 'Need Modern Minimalist Logo for ACM Student Chapter',
        description: 'Seeking a vector-based modern logo with tech aesthetic and monochrome versions for ACM chapter merchandise.',
        type: 'Requesting',
        category: 'Design',
        payment_type: 'Paid',
        budget: 3000,
        deadline: '2026-11-10T18:00:00Z',
        status: 'In Progress',
        accepted_applicant_id: 8, // Mahnoor accepted
        created_at: '2026-10-10T10:00:00Z'
      },
      {
        id: 17,
        user_id: 5, // Daniyal
        title: 'KiCad 2-Layer PCB Layout Routing for IoT Node',
        description: 'Offering PCB schematic review and manual copper trace routing with DRC check for compact IoT sensor prototypes.',
        type: 'Offering',
        category: 'Programming',
        payment_type: 'Paid',
        budget: 4500,
        deadline: '2026-11-08T20:00:00Z',
        status: 'In Progress',
        accepted_applicant_id: 1, // Bilal accepted
        created_at: '2026-10-11T12:00:00Z'
      },
      {
        id: 18,
        user_id: 4, // Zainab
        title: 'Need Cover Letter & Resume Review for Software Internships',
        description: 'Looking for a senior developer or tech writer to provide actionable feedback on ATS compatibility and phrasing.',
        type: 'Requesting',
        category: 'Writing',
        payment_type: 'Free',
        budget: null,
        deadline: '2026-11-07T15:00:00Z',
        status: 'In Progress',
        accepted_applicant_id: 12, // Sana accepted
        created_at: '2026-10-12T14:30:00Z'
      },
      {
        id: 19,
        user_id: 9, // Saad
        title: 'Linear Algebra Eigenvalues & Matrix Factorization Coaching',
        description: 'Offering private coaching for SVD, diagonalization, and vector spaces before next week quiz.',
        type: 'Offering',
        category: 'Tutoring',
        payment_type: 'Skill Swap',
        budget: null,
        deadline: '2026-11-06T19:00:00Z',
        status: 'In Progress',
        accepted_applicant_id: 6, // Hira accepted
        created_at: '2026-10-13T09:00:00Z'
      },

      // Completed Gigs (With Mutual Reviews)
      {
        id: 20,
        user_id: 1, // Bilal
        title: 'Backend Node.js API with SQLite for Library Portal',
        description: 'Built a clean REST API with JWT authentication, book reservation endpoints, and transaction support.',
        type: 'Offering',
        category: 'Programming',
        payment_type: 'Paid',
        budget: 5000,
        deadline: '2026-10-05T20:00:00Z',
        status: 'Completed',
        accepted_applicant_id: 3, // Hamza was client/applicant
        created_at: '2026-09-20T10:00:00Z'
      },
      {
        id: 21,
        user_id: 2, // Ayesha
        title: 'Redesign UI/UX for Department Noticeboard Portal',
        description: 'Delivered interactive Figma prototype with clean information architecture and mobile-first navigation.',
        type: 'Offering',
        category: 'Design',
        payment_type: 'Paid',
        budget: 4500,
        deadline: '2026-10-06T18:00:00Z',
        status: 'Completed',
        accepted_applicant_id: 7, // Usman
        created_at: '2026-09-22T11:00:00Z'
      },
      {
        id: 22,
        user_id: 4, // Zainab
        title: 'Final Year Project Thesis Chapter 1 & 2 Editing',
        description: 'Provided in-depth structural review, vocabulary refinement, and academic tone adjustment for thesis.',
        type: 'Offering',
        category: 'Writing',
        payment_type: 'Skill Swap',
        budget: null,
        deadline: '2026-10-08T12:00:00Z',
        status: 'Completed',
        accepted_applicant_id: 5, // Daniyal
        created_at: '2026-09-25T14:00:00Z'
      },
      {
        id: 23,
        user_id: 7, // Usman
        title: 'Need AWS EC2 & Nginx Reverse Proxy Deployment Assistance',
        description: 'Successfully deployed Dockerized student portal with SSL certbot configuration and auto-restart policy.',
        type: 'Requesting',
        category: 'Programming',
        payment_type: 'Paid',
        budget: 3000,
        deadline: '2026-10-09T22:00:00Z',
        status: 'Completed',
        accepted_applicant_id: 1, // Bilal
        created_at: '2026-09-28T16:00:00Z'
      },

      // Expired Gigs (Deadline passed in the past)
      {
        id: 24,
        user_id: 6, // Hira
        title: 'Kaggle Competition Feature Engineering Strategy Session',
        description: 'Looking for a senior teammate to brainstorm tabular feature transformations for ongoing competition.',
        type: 'Requesting',
        category: 'Programming',
        payment_type: 'Free',
        budget: null,
        deadline: '2026-10-01T23:59:59Z',
        status: 'Expired',
        accepted_applicant_id: null,
        created_at: '2026-09-15T09:00:00Z'
      },
      {
        id: 25,
        user_id: 10, // Fatima
        title: 'Help Writing Security Report for Campus Portal CTF',
        description: 'Requesting assistance with formatting report findings and remediation recommendations.',
        type: 'Requesting',
        category: 'Writing',
        payment_type: 'Skill Swap',
        budget: null,
        deadline: '2026-10-03T18:00:00Z',
        status: 'Expired',
        accepted_applicant_id: null,
        created_at: '2026-09-18T13:00:00Z'
      },

      // Cancelled Gigs
      {
        id: 26,
        user_id: 11, // Omer
        title: 'Flutter iOS Build on Mac Assistance',
        description: 'Cancelled due to university lab computers being upgraded with Xcode.',
        type: 'Requesting',
        category: 'Programming',
        payment_type: 'Paid',
        budget: 1500,
        deadline: '2026-11-01T12:00:00Z',
        status: 'Cancelled',
        accepted_applicant_id: null,
        created_at: '2026-10-05T10:00:00Z'
      },
      {
        id: 27,
        user_id: 13, // Mustafa
        title: 'Python Pandas Data Cleaning Help',
        description: 'Cancelled because instructor gave extension on assignment deadline.',
        type: 'Requesting',
        category: 'Tutoring',
        payment_type: 'Free',
        budget: null,
        deadline: '2026-11-02T15:00:00Z',
        status: 'Cancelled',
        accepted_applicant_id: null,
        created_at: '2026-10-06T15:00:00Z'
      }
    ];

    gigs.forEach(g => {
      insertGig.run(g.id, g.user_id, g.title, g.description, g.type, g.category, g.payment_type, g.budget, g.deadline, g.status, g.accepted_applicant_id, g.created_at);
    });

    // 22 Applications (Exceeds 20 minimum)
    // Especially multiple pending applications on gig 2 and gig 15 for demo applicant selection
    const applications = [
      // Gig 2 (Hamza requested Figma UI) - 3 Pending applications
      { id: 1, gig_id: 2, applicant_id: 2, message: 'I have designed 3 mobile apps in Figma for campus projects. Check my portfolio! Can deliver by this weekend.', status: 'Pending', created_at: '2026-10-16T11:00:00Z' },
      { id: 2, gig_id: 2, applicant_id: 8, message: 'I have experience in vector UI and mobile layout design. Very keen on working on this bus app.', status: 'Pending', created_at: '2026-10-16T12:30:00Z' },
      { id: 3, gig_id: 2, applicant_id: 14, message: 'I know Figma prototyping and Tailwind CSS, so I can provide dev-ready components.', status: 'Pending', created_at: '2026-10-17T09:00:00Z' },

      // Gig 15 (Hamza offering DSA tutoring) - 3 Pending applications
      { id: 4, gig_id: 15, applicant_id: 13, message: 'Really struggling with DP memoization for our upcoming midterms. Would love your guidance.', status: 'Pending', created_at: '2026-10-20T14:30:00Z' },
      { id: 5, gig_id: 15, applicant_id: 5, message: 'Looking to brush up on graph traversals before tech interview season. Let me know available slots.', status: 'Pending', created_at: '2026-10-20T15:10:00Z' },
      { id: 6, gig_id: 15, applicant_id: 10, message: 'Want to practice algorithms for competitive programming contests. Count me in!', status: 'Pending', created_at: '2026-10-20T16:00:00Z' },

      // Gig 1 (Bilal offering MERN mentorship) - 2 Pending
      { id: 7, gig_id: 1, applicant_id: 14, message: 'Hi Bilal, I need help connecting my React frontend with an Express API and understanding async states.', status: 'Pending', created_at: '2026-10-16T16:00:00Z' },
      { id: 8, gig_id: 1, applicant_id: 13, message: 'Interested in learning backend fundamentals. Can we schedule 2 weekend sessions?', status: 'Pending', created_at: '2026-10-17T10:15:00Z' },

      // Gig 3 (Zainab IEEE paper) - 1 Pending
      { id: 9, gig_id: 3, applicant_id: 6, message: 'I have an AI paper ready for conference review. In exchange, I can help you with Python data scripts.', status: 'Pending', created_at: '2026-10-17T11:45:00Z' },

      // Gig 7 (Hira python scraper) - 2 Pending
      { id: 10, gig_id: 7, applicant_id: 1, message: 'I have prebuilt scrapers using Cheerio & Puppeteer with rate-limiting. Can deliver within 24 hours.', status: 'Pending', created_at: '2026-10-18T10:30:00Z' },
      { id: 11, gig_id: 7, applicant_id: 3, message: 'Expert in Python requests and BeautifulSoup. Can structure data into clean JSON and CSV.', status: 'Pending', created_at: '2026-10-18T13:00:00Z' },

      // Gig 10 (Mustafa needs Math tutor) - 1 Pending
      { id: 12, gig_id: 10, applicant_id: 9, message: 'Hi Mustafa! I have extensive notes on Discrete Structures and helped multiple batches. Available weekday evenings.', status: 'Pending', created_at: '2026-10-19T11:00:00Z' },

      // Gig 12 (Usman Docker setup) - 1 Pending
      { id: 13, gig_id: 12, applicant_id: 1, message: 'Can configure multi-stage Docker build and GitHub Actions CI workflow in an hour.', status: 'Pending', created_at: '2026-10-19T17:00:00Z' },

      // In Progress Gigs (Accepted + Rejected applicants)
      // Gig 16 (Ayesha - Logo)
      { id: 14, gig_id: 16, applicant_id: 8, message: 'Will design 3 distinct modern concepts with vector SVG source files.', status: 'Accepted', created_at: '2026-10-10T11:00:00Z' },
      { id: 15, gig_id: 16, applicant_id: 12, message: 'Can provide Canva templates.', status: 'Rejected', created_at: '2026-10-10T12:00:00Z' },

      // Gig 17 (Daniyal - PCB)
      { id: 16, gig_id: 17, applicant_id: 1, message: 'Need this PCB routed for our smart locker project. Ready to collaborate.', status: 'Accepted', created_at: '2026-10-11T13:00:00Z' },

      // Gig 18 (Zainab - Resume)
      { id: 17, gig_id: 18, applicant_id: 12, message: 'Happy to do an in-depth resume polish and phrasing check for your tech roles.', status: 'Accepted', created_at: '2026-10-12T15:00:00Z' },

      // Gig 19 (Saad - Linear Algebra)
      { id: 18, gig_id: 19, applicant_id: 6, message: 'In exchange for Eigenvalue tutoring, I will train an image classifier for your ML demo.', status: 'Accepted', created_at: '2026-10-13T10:00:00Z' },

      // Completed Gigs (Accepted applicants)
      // Gig 20 (Bilal & Hamza)
      { id: 19, gig_id: 20, applicant_id: 3, message: 'Need this library portal backend setup with proper SQLite schema and validations.', status: 'Accepted', created_at: '2026-09-20T11:00:00Z' },

      // Gig 21 (Ayesha & Usman)
      { id: 20, gig_id: 21, applicant_id: 7, message: 'Need Figma prototype for our department portal. Ready to pay upfront.', status: 'Accepted', created_at: '2026-09-22T12:00:00Z' },

      // Gig 22 (Zainab & Daniyal)
      { id: 21, gig_id: 22, applicant_id: 5, message: 'Need thesis chapters proofread before supervisor review. Exchanging for circuit design help.', status: 'Accepted', created_at: '2026-09-25T15:00:00Z' },

      // Gig 23 (Usman & Bilal)
      { id: 22, gig_id: 23, applicant_id: 1, message: 'I can configure Nginx reverse proxy and SSL certificates seamlessly.', status: 'Accepted', created_at: '2026-09-28T17:00:00Z' }
    ];

    applications.forEach(a => {
      insertApp.run(a.id, a.gig_id, a.applicant_id, a.message, a.status, a.created_at);
    });

    // 8 Mutual Reviews (Exactly on Completed Gigs 20, 21, 22, 23)
    // Ratings 1 to 5, between owner and accepted applicant!
    const reviews = [
      // Gig 20: Bilal (owner, id 1) and Hamza (applicant, id 3)
      {
        id: 1,
        gig_id: 20,
        reviewer_id: 3, // Hamza reviewed Bilal
        reviewee_id: 1, // Bilal
        rating: 5,
        comment: 'Bilal is an outstanding developer! Delivered a robust, clean REST API with SQLite exactly on schedule.',
        created_at: '2026-10-06T10:00:00Z'
      },
      {
        id: 2,
        gig_id: 20,
        reviewer_id: 1, // Bilal reviewed Hamza
        reviewee_id: 3, // Hamza
        rating: 5,
        comment: 'Hamza provided super clear specifications and tested endpoints promptly. Pleasure to collaborate with!',
        created_at: '2026-10-06T11:30:00Z'
      },

      // Gig 21: Ayesha (owner, id 2) and Usman (applicant, id 7)
      {
        id: 3,
        gig_id: 21,
        reviewer_id: 7, // Usman reviewed Ayesha
        reviewee_id: 2, // Ayesha
        rating: 5,
        comment: 'Ayesha design skills are world-class. The Figma design system was intuitive and saved us weeks of work.',
        created_at: '2026-10-07T09:00:00Z'
      },
      {
        id: 4,
        gig_id: 21,
        reviewer_id: 2, // Ayesha reviewed Usman
        reviewee_id: 7, // Usman
        rating: 4,
        comment: 'Usman was communicative and quick with design feedback. Great campus collaborator.',
        created_at: '2026-10-07T12:00:00Z'
      },

      // Gig 22: Zainab (owner, id 4) and Daniyal (applicant, id 5)
      {
        id: 5,
        gig_id: 22,
        reviewer_id: 5, // Daniyal reviewed Zainab
        reviewee_id: 4, // Zainab
        rating: 5,
        comment: 'Zainab proofreading elevated my thesis chapters. Caught critical formatting flaws and refined my technical writing.',
        created_at: '2026-10-08T15:00:00Z'
      },
      {
        id: 6,
        gig_id: 22,
        reviewer_id: 4, // Zainab reviewed Daniyal
        reviewee_id: 5, // Daniyal
        rating: 5,
        comment: 'Daniyal honored our skill swap punctually and delivered top-notch hardware circuit advice.',
        created_at: '2026-10-08T16:30:00Z'
      },

      // Gig 23: Usman (owner, id 7) and Bilal (applicant, id 1)
      {
        id: 7,
        gig_id: 23,
        reviewer_id: 7, // Usman reviewed Bilal
        reviewee_id: 1, // Bilal
        rating: 5,
        comment: 'Bilal configured Nginx SSL and Docker containers in no time. Highly recommended!',
        created_at: '2026-10-10T14:00:00Z'
      },
      {
        id: 8,
        gig_id: 23,
        reviewer_id: 1, // Bilal reviewed Usman
        reviewee_id: 7, // Usman
        rating: 4,
        comment: 'Smooth deployment session and prompt payment. Great experience.',
        created_at: '2026-10-10T15:00:00Z'
      }
    ];

    reviews.forEach(r => {
      insertReview.run(r.id, r.gig_id, r.reviewer_id, r.reviewee_id, r.rating, r.comment, r.created_at);
    });
  });

  transaction();
  console.log('Seeding complete! 14 users, 27 gigs, 22 applications, 8 reviews inserted successfully.');
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase(process.argv.includes('--force'));
}
