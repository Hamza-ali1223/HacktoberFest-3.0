import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Discover from './pages/Discover';
import GigDetails from './pages/GigDetails';
import CreateGig from './pages/CreateGig';
import MyGigs from './pages/MyGigs';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';

export default function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-canvas flex flex-col font-sans selection:bg-brand-light selection:text-brand">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Discover />} />
              <Route path="/gigs/:id" element={<GigDetails />} />
              <Route path="/create" element={<CreateGig />} />
              <Route path="/my-gigs" element={<MyGigs />} />
              <Route path="/applications" element={<MyApplications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-ink-200/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-ink-500">
            <p className="font-semibold text-ink-800">CampusConnect — Campus Gig &amp; SkillSwap Portal</p>
            <p className="mt-1 text-ink-400">
              Built for HacktoberFest 3.0 • Empowering university students to collaborate, exchange skills, and build reputations.
            </p>
          </footer>
        </div>
      </Router>
      </ToastProvider>
    </UserProvider>
  );
}
