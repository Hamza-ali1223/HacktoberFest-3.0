import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  PlusCircle, Sparkles, ChevronDown, UserCheck, Layers, 
  Briefcase, FileText, User, Menu, X, ArrowUpRight 
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import StudentAvatar from './StudentAvatar';

export default function Navbar() {
  const location = useLocation();
  const { users, currentUser, switchUser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Discover', path: '/', icon: Layers },
    { label: 'My Gigs', path: '/my-gigs', icon: Briefcase },
    { label: 'Applications', path: '/applications', icon: FileText },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F8F8F5]/85 backdrop-blur-md border-b border-ink-200/70">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm shadow-brand/25 group-hover:bg-brand-hover transition-all group-hover:scale-105">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-lg font-bold tracking-tight text-ink-900 leading-tight">
                    Campus<span className="text-brand">Connect</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-brand-light text-brand px-1.5 py-0.5 rounded border border-brand-border/50">
                    Portal
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] text-ink-400 font-medium leading-none mt-0.5">
                  SkillSwap &amp; Student Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-ink-200/50">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-brand bg-white shadow-subtle border border-ink-200/60'
                        : 'text-ink-600 hover:text-ink-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand' : 'text-ink-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Post Gig + Demo Identity Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand hover:bg-brand-hover shadow-sm shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Post a Gig</span>
              <span className="sm:hidden text-xs">Post</span>
            </Link>

            {/* Demo User Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-full bg-white hover:bg-ink-50 border border-ink-200/80 shadow-subtle transition-all"
                title="Switch Active Student Identity"
                aria-label="Switch Student Profile"
              >
                {currentUser ? (
                  <>
                    <StudentAvatar
                      name={currentUser.name}
                      avatarUrl={currentUser.avatar_url}
                      size="sm"
                    />
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-ink-900 leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-ink-500 leading-tight">
                        {currentUser.semester} • {currentUser.major.split(' ')[0]}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-ink-200 animate-pulse" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-hover border border-ink-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2.5 bg-canvas/60 rounded-xl border border-ink-100 mb-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                        Demo Student Switcher
                      </p>
                      <span className="text-[10px] bg-brand-light text-brand px-1.5 py-0.5 rounded font-semibold">
                        Role Flexible
                      </span>
                    </div>
                    <p className="text-xs text-ink-600 mt-1 leading-snug">
                      Toggle identities to test posting gigs, submitting pitches, accepting applicants, and leaving mutual ratings.
                    </p>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1 py-1 scrollbar-none">
                    {users.map((u) => {
                      const isSelected = currentUser?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                            isSelected
                              ? 'bg-brand-light text-brand ring-1 ring-brand-border'
                              : 'hover:bg-ink-50 text-ink-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <StudentAvatar
                              name={u.name}
                              avatarUrl={u.avatar_url}
                              size="sm"
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-ink-900 truncate">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-ink-500 truncate">
                                {u.major} • {u.semester}
                              </p>
                            </div>
                          </div>
                          {isSelected && <UserCheck className="w-4 h-4 text-brand shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-white border border-ink-200/70 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-ink-200/80 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-brand bg-brand-light border border-brand-border/50'
                    : 'text-ink-700 hover:bg-ink-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-ink-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
