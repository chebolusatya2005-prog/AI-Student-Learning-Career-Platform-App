/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Briefcase,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Search,
  Award,
  Layers,
  Send,
  Check,
  LogOut,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { ThemeToggle } from './context/ThemeContext';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { TrainerDashboard } from './components/dashboards/TrainerDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { StudentAnalyticsChatbot } from './components/ai/StudentAnalyticsChatbot';

type Page = 'home' | 'about' | 'contact' | 'login' | 'signup' | 'dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  // Route protection: redirect unauthenticated users away from dashboard
  useEffect(() => {
    if (!isLoading && !isAuthenticated && currentPage === 'dashboard') {
      setCurrentPage('login');
    }
  }, [isLoading, isAuthenticated, currentPage]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] dark:bg-[#0B1120] text-[#172033] dark:text-[#F8FAFC] font-sans antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* Top Banner / Announcement */}
      {currentPage !== 'dashboard' && (
        <div className="bg-slate-900 dark:bg-[#111827] text-slate-300 dark:text-slate-400 px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2 border-b border-slate-800 dark:border-[#273449]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          <span>Empowering next-generation learners & early-career talent</span>
          <span className="hidden sm:inline text-slate-500 dark:text-slate-600">·</span>
          <button
            onClick={() => navigateTo('about')}
            className="underline hover:text-white dark:hover:text-teal-300 transition-colors cursor-pointer"
          >
            Explore Platform Mission
          </button>
        </div>
      )}

      {/* Navigation */}
      {currentPage !== 'dashboard' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={navigateTo}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}

      {/* Main Content View */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
        {currentPage === 'about' && <AboutPage onNavigate={navigateTo} />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'login' && <LoginPage onNavigate={navigateTo} />}
        {currentPage === 'signup' && <SignupPage onNavigate={navigateTo} />}
        {currentPage === 'dashboard' && <RoleDashboardRouter onNavigate={navigateTo} />}
      </main>

      {/* Footer */}
      {currentPage !== 'dashboard' && <Footer onNavigate={navigateTo} />}

      {/* Dataset-Grounded AI Analytics Chatbot */}
      <StudentAnalyticsChatbot />
    </div>
  );
}

// -------------------------------------------------------------
// REUSABLE NAVBAR COMPONENT (TOP BAR CONTRACT COMPLIANT)
// -------------------------------------------------------------
function Navbar({
  currentPage,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const { isAuthenticated, user, profile, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#273449] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single Wordmark Element */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-[#F8FAFC] text-base tracking-tight">
            EduCareer AI
          </span>
        </button>

        {/* Zone 2: Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors duration-200 cursor-pointer py-1 border-b-2 whitespace-nowrap shrink-0 ${
              currentPage === 'home'
                ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`transition-colors duration-200 cursor-pointer py-1 border-b-2 whitespace-nowrap shrink-0 ${
              currentPage === 'about'
                ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            About
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`transition-colors duration-200 cursor-pointer py-1 border-b-2 whitespace-nowrap shrink-0 ${
              currentPage === 'contact'
                ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Contact
          </button>
          {isAuthenticated && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors duration-200 cursor-pointer py-1 border-b-2 whitespace-nowrap shrink-0 ${
                currentPage === 'dashboard'
                  ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#273449] bg-slate-50 dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {(profile?.full_name || user?.email || 'U')[0]}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] max-w-[120px] truncate">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </span>
              </button>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-[#273449] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-[#273449] bg-white dark:bg-[#111827] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 'home'
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 'about'
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 'contact'
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033]'
              }`}
            >
              Contact
            </button>
            {isAuthenticated && (
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'dashboard'
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#172033]'
                }`}
              >
                Dashboard Workspace ({role || 'User'})
              </button>
            )}
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-[#273449] flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="w-full text-center px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#273449] rounded-lg hover:bg-slate-50 dark:hover:bg-[#172033]"
                >
                  Log In
                </button>
                <button
                  onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                  className="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 dark:bg-teal-500 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 shadow-xs"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// -------------------------------------------------------------
// HOME PAGE COMPONENT (REDESIGNED FOR EDUCAREER AI)
// -------------------------------------------------------------
function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { isAuthenticated } = useAuth();

  const handlePrimaryCta = () => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    } else {
      onNavigate('signup');
    }
  };

  const handleLearnMore = () => {
    const el = document.getElementById('overview-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('about');
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-200">
      {/* 1. Hero Section - Professional 2-Column SaaS Layout */}
      <section className="w-full bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-[#273449] py-16 sm:py-20 lg:py-24 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Headline, Description, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#273449] text-slate-800 dark:text-slate-200 rounded-md text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>EduCareer AI · Student Analytics & Learning Success</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC] leading-[1.15] text-balance">
                Understand Your Learning. Discover Your Strengths. Prepare for Your Career.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-2xl">
                EduCareer AI brings student performance analytics, learning insights, and AI-powered assistance together in one platform. It helps students, trainers, and administrators understand learning progress and identify areas for improvement.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={handlePrimaryCta}
                  className="px-6 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-xs hover:shadow transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLearnMore}
                  className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#1E293B] border border-slate-300 dark:border-[#273449] rounded-lg transition-colors duration-150 cursor-pointer text-center"
                >
                  Learn More
                </button>
              </div>

              {/* Verified Key Pillars */}
              <div className="pt-8 border-t border-slate-200/80 dark:border-[#273449] grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Performance</p>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Readiness & Risk Scores</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">3 Roles</p>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Student, Trainer, Admin</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Grounded AI</p>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Dataset-backed Assistance</p>
                </div>
              </div>
            </div>

            {/* Right Column: Platform Interface Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] shadow-sm overflow-hidden space-y-0">
                {/* Browser-style Chrome Header */}
                <div className="bg-slate-100 dark:bg-[#111827] px-4 py-3 border-b border-slate-200 dark:border-[#273449] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <span className="ml-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      educareer.ai/preview
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    Platform Interface Preview
                  </span>
                </div>

                {/* Preview Image with CSS Fallback Container */}
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  <img
                    src="/src/assets/images/educareer_dashboard_preview_1793325523910.jpg"
                    alt="EduCareer AI Student Analytics Dashboard Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-left-top"
                  />
                </div>

                {/* Preview Summary Note */}
                <div className="p-4 bg-slate-50/80 dark:bg-[#111827]/80 border-t border-slate-100 dark:border-[#273449] text-xs text-slate-600 dark:text-[#94A3B8] flex items-center justify-between">
                  <span>Student Readiness Scorecard & Topic Insights</span>
                  <button
                    onClick={handlePrimaryCta}
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    View Role Dashboards &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Overview Section */}
      <section id="overview-section" className="w-full bg-white dark:bg-[#0B1120] py-16 sm:py-20 border-b border-slate-200/80 dark:border-[#273449] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-3 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Platform Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              One Platform for Smarter Student Development
            </h2>
            <p className="text-slate-600 dark:text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              EduCareer AI brings student learning data, performance analytics, and AI assistance together into one structured application. By converting scattered learning metrics into clear readiness indicators, students and faculty can focus on identifying learning gaps and taking effective action.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#273449] space-y-2">
              <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h3 className="font-bold text-slate-900 dark:text-[#F8FAFC] text-base">Integrated Student Data</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Connect assessment scores, assignment completion, practice accuracy, and readiness indicators into a single student record.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#273449] space-y-2">
              <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h3 className="font-bold text-slate-900 dark:text-[#F8FAFC] text-base">Multi-Role Support</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Provide tailored views for administrators monitoring cohorts, trainers overseeing assigned mentees, and students reviewing personal goals.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#172033] border border-slate-200 dark:border-[#273449] space-y-2">
              <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h3 className="font-bold text-slate-900 dark:text-[#F8FAFC] text-base">Dataset-Grounded AI</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Explore student learning data using an AI chatbot that answers questions based strictly on connected project data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section (4 Clean Cards) */}
      <section className="w-full bg-slate-50/50 dark:bg-[#111827] py-16 sm:py-20 border-b border-slate-200/80 dark:border-[#273449] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Core Features</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Designed for Student & Academic Success
            </h2>
            <p className="text-slate-600 dark:text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              Implemented tools for monitoring performance, managing mentorship, and asking dataset questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-[#172033] p-6 rounded-xl border border-slate-200 dark:border-[#273449] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">1. Student Performance Analytics</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Evaluate overall readiness scores, risk levels (High, Medium, Low), assessment averages, assignment completion, and practice accuracy.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[#273449] text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Grounded in student dataset rows
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#172033] p-6 rounded-xl border border-slate-200 dark:border-[#273449] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">2. Role-Based Dashboards</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Tailored dashboard experiences for Administrators (cohort trends), Trainers (assigned mentees), and Students (personal progress).
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[#273449] text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Role-based routing & security
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#172033] p-6 rounded-xl border border-slate-200 dark:border-[#273449] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">3. EduCareer AI Assistant</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Ask questions related to supported student learning data. Provides grounded answers without fabricating unrecorded metrics.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[#273449] text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Powered by Google Gemini API
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-[#172033] p-6 rounded-xl border border-slate-200 dark:border-[#273449] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">4. Learning Insights</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  Identify recommended learning topics, skill focus areas, and suggested weekly practice allocation based on available dataset records.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[#273449] text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Topic & skill guidance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (3 Steps) */}
      <section className="w-full bg-white dark:bg-[#0B1120] py-16 sm:py-20 border-b border-slate-200/80 dark:border-[#273449] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">How It Works</h2>
            <p className="text-slate-600 dark:text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              A straightforward 3-step process for turning raw student data into actionable learning outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 dark:bg-[#172033] p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-[#273449] space-y-3">
              <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/80 px-2.5 py-1 rounded">
                01 – Analyse
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">Understand Student Data</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Consolidate student learning metrics, assessment scores, and assignment completion into clear performance benchmarks.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#172033] p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-[#273449] space-y-3">
              <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/80 px-2.5 py-1 rounded">
                02 – Identify
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">Identify Skill Gaps</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Highlight risk levels, weak topics, and areas that require instructor intervention or student practice focus.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#172033] p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-[#273449] space-y-3">
              <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/80 px-2.5 py-1 rounded">
                03 – Improve
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">Support Learning Decisions</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Use dataset recommendations and AI-powered Q&A assistance to guide study habits and improve career readiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. User Roles Section (3 Cards) */}
      <section className="w-full bg-slate-50/50 dark:bg-[#111827] py-16 sm:py-20 border-b border-slate-200/80 dark:border-[#273449] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">User Workspaces</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Designed for Students, Trainers & Admins
            </h2>
            <p className="text-slate-600 dark:text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              Dedicated interfaces structured around specific user roles and permissions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Admin Card */}
            <div className="bg-white dark:bg-[#172033] p-7 rounded-xl border border-slate-200 dark:border-[#273449] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">Admin Workspace</h3>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  Cohort Control
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Monitor overall cohort performance, risk distribution, placement readiness rates, and manage student-trainer mentorship pairings.
              </p>
            </div>

            {/* Trainer Card */}
            <div className="bg-white dark:bg-[#172033] p-7 rounded-xl border border-slate-200 dark:border-[#273449] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">Trainer Workspace</h3>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  Mentorship View
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Review assigned mentees, monitor individual readiness scores and risk levels, and track learning progress across assigned courses.
              </p>
            </div>

            {/* Student Card */}
            <div className="bg-white dark:bg-[#172033] p-7 rounded-xl border border-slate-200 dark:border-[#273449] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">Student Workspace</h3>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  Personal Analytics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Understand personal performance scores, risk status, course progress, recommended study topics, and ask questions using the AI assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI Assistant Section */}
      <section className="w-full bg-white dark:bg-[#0B1120] py-16 sm:py-20 border-b border-slate-200/80 dark:border-[#273449] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 dark:bg-[#172033] text-white rounded-2xl p-8 sm:p-12 lg:p-14 space-y-6 border border-slate-800 dark:border-[#273449]">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-teal-300 rounded-md text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>EduCareer AI Assistant</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Your Learning Data, Explained with AI
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                EduCareer AI helps users explore supported student learning information through an AI-powered assistant. Users can ask about readiness scores, risk distributions, and recommended study topics grounded directly in the connected project dataset.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handlePrimaryCta}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <span>Launch Assistant Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="w-full bg-slate-50/50 dark:bg-[#0B1120] py-16 sm:py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Take the Next Step in Your Learning Journey
            </h2>
            <p className="text-slate-600 dark:text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              Explore learning performance, understand your strengths, and work towards your career goals.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handlePrimaryCta}
              className="px-8 py-3.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm hover:shadow transition-colors duration-150 cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// ABOUT PAGE COMPONENT (GENUINE INTERNSHIP PROJECT SCOPE)
// -------------------------------------------------------------
function AboutPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
      {/* Intro */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">About the Project</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Building Better Learning Insights for Student Success
        </h1>
        <p className="text-slate-600 dark:text-[#94A3B8] text-base leading-relaxed">
          The AI Student Learning & Career Success Platform is an internship project developed to make student learning information easier to understand and use. The platform brings student performance data, learning analytics, and AI-powered assistance together in one application.
        </p>
      </div>

      {/* Our Objective */}
      <div className="bg-white dark:bg-[#172033] p-8 rounded-2xl border border-slate-200 dark:border-[#273449] space-y-3 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">Our Objective</h2>
        <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
          Our objective is to help students understand their learning performance and areas for improvement while providing trainers and administrators with useful information to monitor student progress.
        </p>
      </div>

      {/* Problem & Solution Breakdown */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#172033] p-7 rounded-2xl border border-slate-200 dark:border-[#273449] space-y-3 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">The Problem We Address</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            Students may find it difficult to identify their learning gaps and understand which skills require more attention. Trainers and administrators also need a convenient way to review student performance and identify students who may need additional support.
          </p>
        </div>

        <div className="bg-white dark:bg-[#172033] p-7 rounded-2xl border border-slate-200 dark:border-[#273449] space-y-3 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">Our Solution</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            We developed a web application with role-based dashboards, student performance analytics, and an AI chatbot that answers questions related to supported project data.
          </p>
        </div>
      </div>

      {/* Main Components */}
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-8 space-y-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">Main Platform Components</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-sm">1. Student Data Analysis</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Evaluates overall readiness scores, risk levels, assessment performance, and practice accuracy.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-sm">2. Role-Based Dashboards</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Purpose-built interfaces for Administrators, Trainers, and Students with role-based security.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-sm">3. AI Learning Assistant</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Dataset-grounded AI assistant powered by Gemini API to answer questions regarding student data.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-sm">4. Learning Performance Insights</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Topic recommendations and study allocation guidelines based on available dataset records.
            </p>
          </div>
        </div>
      </div>

      {/* Technologies Used */}
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">Technologies Used</h2>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
          Technologies integrated in the platform implementation:
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Python', 'Pandas', 'SQL', 'Google Gemini API'].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111827] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#273449] text-xs font-semibold"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Project Scope & Prototype Notice */}
      <div className="bg-slate-900 dark:bg-[#111827] text-white rounded-2xl p-8 space-y-4 border border-slate-800 dark:border-[#273449]">
        <h2 className="text-xl font-bold">Project Scope & Prototype Notice</h2>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          EduCareer AI is developed as an internship project prototype to demonstrate how AI and structured data analytics can support student learning development. Analytics and AI responses are based on the available student dataset and implemented project functionality.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('signup')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Explore Student Platform
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// CONTACT PAGE COMPONENT (IMPROVED FORM VALIDATION & HONEST DETAILS)
// -------------------------------------------------------------
function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject line is required.';
    if (!formData.message.trim()) {
      errs.message = 'Message body cannot be empty.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Please provide at least 10 characters for your message.';
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitted(false);
    } else {
      setErrors({});
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Project Contact</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">Get in Touch</h1>
        <p className="text-slate-600 dark:text-[#94A3B8] text-sm sm:text-base">
          Have questions about the EduCareer AI platform or the project? Contact our team.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Contact Info & Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#172033] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#273449] space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-100 dark:border-[#273449] pb-3">Project Team Details</h2>

            <div className="space-y-4 text-sm text-slate-600 dark:text-[#94A3B8]">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Project Support & Inquiries</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">AI Student Learning Platform Development Team</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Academic Internship Scope</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Built as an AI & Student Success Platform prototype</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#273449] text-xs text-slate-600 dark:text-[#94A3B8] space-y-1">
              <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Note for Reviewers</p>
              <p>
                Inquiries submitted through this form are simulated client-side for platform demonstration purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#172033] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">Inquiry Submitted!</h3>
                <p className="text-sm text-slate-600 dark:text-[#94A3B8] max-w-md mx-auto">
                  Thank you for reaching out, <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{formData.fullName}</span>. Your message has been simulated in the platform preview.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ fullName: '', email: '', subject: '', message: '' });
                  }}
                  className="px-5 py-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-lg transition-colors cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      errors.fullName ? 'border-rose-400 bg-rose-50/20 dark:border-rose-800' : 'border-slate-300 dark:border-[#273449]'
                    }`}
                  />
                  {errors.fullName && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@university.edu"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      errors.email ? 'border-rose-400 bg-rose-50/20 dark:border-rose-800' : 'border-slate-300 dark:border-[#273449]'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Question about EduCareer AI platform"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      errors.subject ? 'border-rose-400 bg-rose-50/20 dark:border-rose-800' : 'border-slate-300 dark:border-[#273449]'
                    }`}
                  />
                  {errors.subject && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your question or feedback..."
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      errors.message ? 'border-rose-400 bg-rose-50/20 dark:border-rose-800' : 'border-slate-300 dark:border-[#273449]'
                    }`}
                  />
                  {errors.message && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.message}</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Submit Inquiry</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// -------------------------------------------------------------
// LOGIN PAGE COMPONENT
// -------------------------------------------------------------
function LoginPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const { signIn, error: authError, dbErrorDetails, clearError, isAuthenticated, role } = useAuth();

  // If already logged in with resolved role, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, role, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        setSuccessNotice(true);
        setTimeout(() => {
          onNavigate('dashboard');
        }, 800);
      } else {
        setFormError(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected authentication error occurred.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = formError || authError;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Sign in to your EduCareer student, trainer, or admin portal</p>
        </div>

        <div className="bg-white dark:bg-[#172033] p-8 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-sm space-y-5">
          {activeError && (
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{activeError}</div>
              </div>

              {dbErrorDetails && (
                <div className="pt-2 mt-2 border-t border-rose-200/80 dark:border-rose-900/60 text-[11px] font-mono bg-rose-100/60 dark:bg-rose-900/30 p-2 rounded text-rose-900 dark:text-rose-200 overflow-x-auto">
                  <p className="font-semibold text-rose-950 dark:text-rose-100 font-sans mb-0.5">Database Diagnostic Details:</p>
                  <code>{dbErrorDetails}</code>
                </div>
              )}
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Authenticated successfully! Resolved role: <strong className="capitalize">{role || 'user'}</strong>. Redirecting...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-[#273449] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-slate-50 dark:disabled:bg-[#111827]/50 disabled:text-slate-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Password reset verification email can be requested from your account administrator.')}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-[#273449] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-slate-50 dark:disabled:bg-[#111827]/50 disabled:text-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-[#94A3B8]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isSubmitting}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 border-slate-300 dark:border-[#273449] dark:bg-[#111827]"
                />
                <span>Remember this session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 disabled:bg-teal-400 dark:disabled:bg-teal-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials & Role...</span>
                </>
              ) : (
                <span>Sign In to Platform</span>
              )}
            </button>
          </form>

          {/* Real Supabase Auth Integration Note */}
          <div className="p-3 bg-slate-50 dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-[#273449] text-[11px] text-slate-500 dark:text-[#94A3B8] text-center leading-relaxed">
            Real Supabase Authentication & Role Verification: Credentials are validated directly against your Supabase Auth project, and your role is resolved from <code className="text-slate-700 dark:text-slate-300 font-mono">public.users</code>.
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 dark:text-[#94A3B8]">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SIGNUP PAGE COMPONENT (REAL SUPABASE AUTH & EMAIL CONFIRMATION)
// -------------------------------------------------------------
function SignupPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dbErrorDetail, setDbErrorDetail] = useState<string | null>(null);

  // Signup flow status states: 'idle' | 'needs_confirmation' | 'pending_profile' | 'complete'
  const [signupStatus, setSignupStatus] = useState<
    'idle' | 'needs_confirmation' | 'pending_profile' | 'complete'
  >('idle');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setDbErrorDetail(null);

    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email is required.';
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!termsAccepted) {
      errs.terms = 'You must accept the terms & conditions.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await signUp(email, password, fullName);

      if (!result.success) {
        setSubmitError(result.error || 'Failed to create account. Please check your information.');
        if (result.dbErrorDetails) {
          setDbErrorDetail(result.dbErrorDetails);
        }
        return;
      }

      setRegisteredEmail(email.trim());

      if (result.needsEmailConfirmation || !result.session) {
        setSignupStatus('needs_confirmation');
        return;
      }

      if (!result.profileCreated) {
        setSignupStatus('pending_profile');
        if (result.dbErrorDetails) {
          setDbErrorDetail(result.dbErrorDetails);
        }
        return;
      }

      setSignupStatus('complete');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSignupStatus('idle');
    setPassword('');
    setConfirmPassword('');
    setSubmitError(null);
    setDbErrorDetail(null);
  };

  // State 1: Email Confirmation Pending Screen (Branch A)
  if (signupStatus === 'needs_confirmation') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white dark:bg-[#172033] p-8 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-sm text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-xs">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                Student Account Registered
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Check Your Email</h1>
              <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
                We have sent a verification link to{' '}
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] break-all">{registeredEmail}</span>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#273449] text-xs text-slate-600 dark:text-[#94A3B8] text-left space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Open your inbox and click the confirmation link to activate your account.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Once verified, return to the login page and sign in to access your student dashboard.</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Entered the wrong email? Register again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Immediate Session but Profile in public.users Pending (Branch B1)
  if (signupStatus === 'pending_profile') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white dark:bg-[#172033] p-8 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-sm text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Account Created
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Profile Provisioning Pending</h1>
              <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
                Your login credentials were created successfully with the Student role for{' '}
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] break-all">{registeredEmail}</span>.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-200 text-left space-y-2 leading-relaxed">
              <p className="font-semibold text-amber-900 dark:text-amber-100">Next Step:</p>
              <p>
                Platform access requires your user profile record to be added to <code className="font-mono text-amber-950 dark:text-amber-300 font-bold">public.users</code>. Please sign in after your platform administrator has completed your profile setup.
              </p>
              {dbErrorDetail && (
                <div className="mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/60 font-mono text-[10px] text-amber-900 dark:text-amber-300">
                  {dbErrorDetail}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Immediate Complete & Redirecting (Branch B2)
  if (signupStatus === 'complete') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white dark:bg-[#172033] p-8 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Account Ready!</h1>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              Welcome to the platform. Redirecting you to your student dashboard...
            </p>
            <div className="flex justify-center pt-2">
              <Loader2 className="w-5 h-5 text-teal-600 dark:text-teal-400 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Registration Form
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Begin your personalized learning & career readiness journey</p>
        </div>

        <div className="bg-white dark:bg-[#172033] p-8 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-sm space-y-5">
          {submitError && (
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Registration Error</span>
                <span className="leading-relaxed block">{submitError}</span>
                {dbErrorDetail && (
                  <span className="text-[10px] font-mono text-rose-600 dark:text-rose-300 block mt-1">
                    {dbErrorDetail}
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  disabled={isSubmitting}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-slate-50 dark:disabled:bg-[#111827]/50 disabled:text-slate-400 ${
                    errors.fullName ? 'border-rose-400 bg-rose-50/20 dark:border-rose-800' : 'border-slate-300 dark:border-[#273449]'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
              {errors.fullName && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-slate-50 dark:disabled:bg-[#111827]/50 disabled:text-slate-400 ${
                    errors.email ? 'border-rose-400 bg-rose-50/20 dark:border-rose-800' : 'border-slate-300 dark:border-[#273449]'
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
              {errors.email && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-slate-50 dark:disabled:bg-[#111827]/50 disabled:text-slate-400 ${
                    errors.password ? 'border-rose-400 bg-rose-50/20 dark:border-rose-800' : 'border-slate-300 dark:border-[#273449]'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  disabled={isSubmitting}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-slate-50 dark:disabled:bg-[#111827]/50 disabled:text-slate-400 ${
                    errors.confirmPassword ? 'border-rose-400 bg-rose-50/20 dark:border-rose-800' : 'border-slate-300 dark:border-[#273449]'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
              {errors.confirmPassword && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-[#94A3B8]">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  disabled={isSubmitting}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 border-slate-300 dark:border-[#273449] dark:bg-[#111827] mt-0.5 disabled:opacity-50"
                />
                <span>
                  I agree to the <span className="text-teal-600 dark:text-teal-400 underline">Terms of Service</span> and acknowledge the <span className="text-teal-600 dark:text-teal-400 underline">Privacy Policy</span>.
                </span>
              </label>
              {errors.terms && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 disabled:bg-teal-400 dark:disabled:bg-teal-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Student Account...</span>
                </>
              ) : (
                <span>Create Student Account</span>
              )}
            </button>
          </form>

          {/* Role Policy Notice */}
          <div className="p-3 bg-slate-50 dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-[#273449] text-[11px] text-slate-500 dark:text-[#94A3B8] text-center leading-relaxed">
            Public registration is assigned the <strong className="text-slate-700 dark:text-slate-300">Student</strong> role. Trainer and administrative credentials are provisioning-restricted.
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 dark:text-[#94A3B8]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Log In here
          </button>
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// ROLE-BASED DASHBOARD ROUTER (STEP 3 IMPLEMENTATION)
// -------------------------------------------------------------
function RoleDashboardRouter({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, role, signOut, isLoading, isProfileLoading, dbErrorDetails, refreshProfile } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleLogout = async () => {
    await signOut();
    onNavigate('home');
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await refreshProfile();
    setIsRetrying(false);
  };

  if (isLoading || isProfileLoading || isRetrying) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">Resolving your authorized dashboard...</p>
      </div>
    );
  }

  const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';

  // Route to the appropriate role-specific workspace
  if (normalizedRole === 'trainer' || normalizedRole === 'faculty' || normalizedRole === 'instructor') {
    return <TrainerDashboard onNavigate={onNavigate} onSignOut={handleLogout} />;
  }

  if (normalizedRole === 'admin' || normalizedRole === 'administrator') {
    return <AdminDashboard onNavigate={onNavigate} onSignOut={handleLogout} />;
  }

  if (normalizedRole === 'student' || normalizedRole === 'learner') {
    return <StudentDashboard onNavigate={onNavigate} onSignOut={handleLogout} />;
  }

  // If a database permission or connection notice was captured
  if (dbErrorDetails) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/60">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">Database Profile Permission Notice</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            Your account (<span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">{user?.email}</span>) is authenticated, but the system encountered a database permission or connection notice while reading your profile from <code className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#111827] px-1 py-0.5 rounded">public.users</code>.
          </p>
          <div className="text-[11px] font-mono bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 max-w-lg mx-auto text-left overflow-x-auto">
            <code>{dbErrorDetails}</code>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Profile Check</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Fallback for unassigned or custom role in public.users
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/60">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">Account Role Pending Assignment</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
          Your account (<span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">{user?.email}</span>) is authenticated, but does not yet have an authorized role assigned in <code className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#111827] px-1 py-0.5 rounded">public.users</code>.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Please contact the platform administrator to provision your student, trainer, or administrative access.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          onClick={handleRetry}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-transparent dark:border-[#273449] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-check Role</span>
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#172033] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-transparent dark:border-[#273449] rounded-lg transition-colors cursor-pointer"
        >
          Return Home
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// REUSABLE FOOTER COMPONENT
// -------------------------------------------------------------
function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { isAuthenticated } = useAuth();

  const handleWorkspaceNavigate = () => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    } else {
      onNavigate('login');
    }
  };

  return (
    <footer className="w-full bg-[#111C35] border-t border-slate-800 text-slate-300 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-sm">
                <GraduationCap className="w-5 h-5 font-bold" />
              </div>
              <span className="font-bold text-white text-base sm:text-lg tracking-tight">
                EduCareer AI Platform
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              An AI-powered student learning and career success platform combining student performance analytics, role-based dashboards, and dataset-grounded AI assistance.
            </p>
          </div>

          {/* Column 1 – Platform */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Platform</p>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-slate-300 hover:text-teal-300 transition-colors duration-200 cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-slate-300 hover:text-teal-300 transition-colors duration-200 cursor-pointer text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-slate-300 hover:text-teal-300 transition-colors duration-200 cursor-pointer text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2 – Workspaces */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-400">Workspaces</p>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={handleWorkspaceNavigate}
                  className="text-slate-300 hover:text-teal-300 transition-colors duration-200 cursor-pointer text-left"
                >
                  Admin Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={handleWorkspaceNavigate}
                  className="text-slate-300 hover:text-teal-300 transition-colors duration-200 cursor-pointer text-left"
                >
                  Trainer Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={handleWorkspaceNavigate}
                  className="text-slate-300 hover:text-teal-300 transition-colors duration-200 cursor-pointer text-left"
                >
                  Student Dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 mt-12 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AI Student Learning & Career Success Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

