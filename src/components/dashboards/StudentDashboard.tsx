/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Loader2,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  Target,
  FileQuestion,
  RefreshCw,
  Lock,
  Info,
  Calendar,
  User,
  Settings,
  CheckSquare,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../context/ThemeContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { StudentScoreGauge } from './student/StudentScoreGauge';
import { StudentTopicFocusChart } from './student/StudentTopicFocusChart';
import { StudentSidebar, StudentNavTab } from './student/StudentSidebar';
import { StudentHeader } from './student/StudentHeader';
import { StudentAnalyticsChatbot } from '../ai/StudentAnalyticsChatbot';

interface StudentLearningRecord {
  id?: string | number;
  user_id?: string | null;
  student_id?: string | number | null;
  batch_id?: string | null;
  batch?: string | null;
  course_name?: string | null;
  course?: string | null;
  attendance_percentage?: number | string | null;
  attendance?: number | string | null;
  overall_readiness_score?: number | string | null;
  readiness_score?: number | null;
  score?: number | null;
  risk_level?: string | null;
  risk?: string | null;
  placement_ready?: boolean | string | null;
  placement_readiness?: boolean | string | null;
  assignment_completion_percentage?: number | string | null;
  assignment_completion?: number | string | null;
  average_assignment_score?: number | string | null;
  average_assessment_score?: number | string | null;
  average_assessment?: number | string | null;
  practice_accuracy_percentage?: number | string | null;
  practice_accuracy?: number | string | null;
  recommended_topic?: string | null;
  recommended_topics?: string | string[] | null;
  recommended_skill?: string | null;
  recommended_skills?: string | string[] | null;
  recommended_practice_hours?: number | string | null;
  practice_hours?: number | string | null;
  recommended_learning_action?: string | null;
  learning_action?: string | null;
  [key: string]: unknown;
}

interface StudentProgressRecord {
  id?: string;
  student_id?: string | number;
  course_id?: string;
  title?: string;
  score?: number;
  status?: string;
  completion_percentage?: number;
  completed_at?: string;
  created_at?: string;
  [key: string]: unknown;
}

interface StudentAcademicProfile {
  user_id: string;
  student_id?: string | number | null;
  education_level?: string | null;
  learning_goals?: string | null;
}

// Robust placement readiness helper supporting boolean and case-insensitive string checks ('Yes', 'Ready', '1', true)
function isPlacementReady(record: StudentLearningRecord | null): boolean {
  if (!record) return false;
  if (record.placement_ready === true || record.placement_readiness === true) return true;
  const val = String(record.placement_ready ?? record.placement_readiness ?? '').trim().toLowerCase();
  return val === 'yes' || val === 'ready' || val === 'true' || val === '1';
}

function parseScore(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  return isNaN(num) ? null : num;
}

function formatPercentage(val: unknown): string | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return `${val}%`;
  const str = String(val).trim();
  if (str.endsWith('%')) return str;
  const num = parseFloat(str);
  return isNaN(num) ? str : `${num}%`;
}

export function StudentDashboard({
  onNavigate,
  onSignOut,
}: {
  onNavigate: (page: 'home' | 'about' | 'contact' | 'login' | 'signup' | 'dashboard') => void;
  onSignOut: () => Promise<void>;
}) {
  const { user, profile, role } = useAuth();

  // Navigation State
  const [activeNav, setActiveNav] = useState<StudentNavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Data State
  const [studentProfile, setStudentProfile] = useState<StudentAcademicProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [personalLearningData, setPersonalLearningData] = useState<StudentLearningRecord[]>([]);
  const [progressRecords, setProgressRecords] = useState<StudentProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [rlsNotice, setRlsNotice] = useState<boolean>(false);
  const [activeActionModal, setActiveActionModal] = useState<string | null>(null);

  // Notification Preferences State
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [progressAlerts, setProgressAlerts] = useState<boolean>(true);

  const loadStudentAnalytics = useCallback(async (isManualRefresh = false) => {
    if (!user?.id || !supabase || !isSupabaseConfigured) {
      setIsLoading(false);
      setIsProfileLoading(false);
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setIsProfileLoading(true);
    }

    setQueryError(null);
    setProfileError(null);
    setRlsNotice(false);

    try {
      // Step 1: Query student profile from public.students using authenticated user's UUID
      const { data: studentRecord, error: studentErr } = await supabase
        .from('students')
        .select('user_id, student_id, education_level, learning_goals')
        .eq('user_id', user.id)
        .maybeSingle();

      let resolvedStudentId: string | number | null = null;

      if (studentErr) {
        console.info('[StudentDashboard] student profile notice:', studentErr.message);
        setProfileError('Unable to load student profile details at this time.');
      } else if (studentRecord) {
        setStudentProfile(studentRecord as StudentAcademicProfile);
        resolvedStudentId = studentRecord.student_id ?? null;
      }
      setIsProfileLoading(false);

      // Step 2: Fetch dataset record from student_learning_data using authenticated user's UUID (user_id = user.id)
      let fetchedLearningRecords: StudentLearningRecord[] = [];

      const { data: learningByUserId, error: learningErrByUserId } = await supabase
        .from('student_learning_data')
        .select('*')
        .eq('user_id', user.id);

      if (learningErrByUserId) {
        console.info('[StudentDashboard] student_learning_data query by user_id status:', learningErrByUserId.message);
        if (learningErrByUserId.code === '42501') {
          setRlsNotice(true);
          setQueryError(
            'Access restricted by database Row Level Security (RLS error 42501).'
          );
        }
      } else if (learningByUserId && learningByUserId.length > 0) {
        fetchedLearningRecords = learningByUserId;
      }

      // Fallback: If no record returned by user_id, query using mapped student_id from public.students
      if (fetchedLearningRecords.length === 0 && resolvedStudentId !== null && resolvedStudentId !== undefined) {
        const { data: learningByStudentId, error: learningErrByStudentId } = await supabase
          .from('student_learning_data')
          .select('*')
          .eq('student_id', resolvedStudentId);

        if (learningErrByStudentId) {
          console.info('[StudentDashboard] student_learning_data query by student_id status:', learningErrByStudentId.message);
        } else if (learningByStudentId && learningByStudentId.length > 0) {
          fetchedLearningRecords = learningByStudentId;
        }
      }

      setPersonalLearningData(fetchedLearningRecords);

      // Step 3: Query student progress records
      let loadedProgress: StudentProgressRecord[] = [];

      const { data: progressByUserId } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (progressByUserId && progressByUserId.length > 0) {
        loadedProgress = progressByUserId;
      } else if (resolvedStudentId !== null && resolvedStudentId !== undefined) {
        const { data: progressByStudentId } = await supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', resolvedStudentId)
          .limit(10);
        if (progressByStudentId && progressByStudentId.length > 0) {
          loadedProgress = progressByStudentId;
        }
      }

      if (loadedProgress.length === 0) {
        const { data: fallbackProgress } = await supabase
          .from('student_progress')
          .select('*')
          .eq('user_id', user.id)
          .limit(10);
        if (fallbackProgress && fallbackProgress.length > 0) {
          loadedProgress = fallbackProgress;
        }
      }

      setProgressRecords(loadedProgress);
    } catch (err: unknown) {
      console.warn('[StudentDashboard] Unexpected query error:', err);
    } finally {
      setIsLoading(false);
      setIsProfileLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStudentAnalytics();
  }, [loadStudentAnalytics]);

  const primaryRecord = personalLearningData.length > 0 ? personalLearningData[0] : null;

  // Extracted values strictly from verified database records with exact field mappings
  const activeStudentId = primaryRecord?.student_id ?? studentProfile?.student_id ?? null;
  const courseTrackText = primaryRecord?.course_name ?? primaryRecord?.course ?? null;
  const batchCodeText = primaryRecord?.batch_id ?? primaryRecord?.batch ?? null;

  const attendanceRaw = primaryRecord?.attendance_percentage ?? primaryRecord?.attendance ?? null;
  const attendanceFormatted = formatPercentage(attendanceRaw);

  const studentRiskRaw = primaryRecord ? String(primaryRecord.risk_level ?? primaryRecord.risk ?? '').trim() : '';
  const studentRiskNormalized: 'High' | 'Medium' | 'Low' | null = studentRiskRaw
    ? studentRiskRaw.toLowerCase().includes('high')
      ? 'High'
      : studentRiskRaw.toLowerCase().includes('med')
      ? 'Medium'
      : 'Low'
    : null;

  const placementReady = primaryRecord ? isPlacementReady(primaryRecord) : null;
  const rawScore = primaryRecord
    ? (primaryRecord.overall_readiness_score ?? primaryRecord.readiness_score ?? primaryRecord.score ?? null)
    : null;
  const numericScore = parseScore(rawScore);

  const assignmentCompletionRaw = primaryRecord?.assignment_completion_percentage ?? primaryRecord?.assignment_completion ?? null;
  const assignmentCompletionFormatted = formatPercentage(assignmentCompletionRaw);

  const avgAssessmentScoreRaw = primaryRecord?.average_assessment_score ?? primaryRecord?.average_assessment ?? null;
  const avgAssessmentScoreText = avgAssessmentScoreRaw !== null && avgAssessmentScoreRaw !== undefined ? String(avgAssessmentScoreRaw) : null;

  const practiceAccuracyRaw = primaryRecord?.practice_accuracy_percentage ?? primaryRecord?.practice_accuracy ?? null;
  const practiceAccuracyFormatted = formatPercentage(practiceAccuracyRaw);

  const recommendedTopicText = primaryRecord?.recommended_topic
    ? String(primaryRecord.recommended_topic).trim()
    : Array.isArray(primaryRecord?.recommended_topics) && primaryRecord.recommended_topics.length > 0
    ? String(primaryRecord.recommended_topics[0]).trim()
    : null;

  const recommendedSkillText = primaryRecord?.recommended_skill
    ? String(primaryRecord.recommended_skill).trim()
    : Array.isArray(primaryRecord?.recommended_skills) && primaryRecord.recommended_skills.length > 0
    ? String(primaryRecord.recommended_skills[0]).trim()
    : null;

  const recommendedPracticeHoursRaw = primaryRecord?.recommended_practice_hours ?? primaryRecord?.practice_hours ?? null;
  const suggestedPracticeHours = recommendedPracticeHoursRaw !== null && recommendedPracticeHoursRaw !== undefined
    ? `${recommendedPracticeHoursRaw} hrs / week`
    : '5 hrs / week';

  const recommendedLearningActionText = primaryRecord?.recommended_learning_action ?? primaryRecord?.learning_action ?? null;

  const educationLevelText = studentProfile?.education_level?.trim()
    ? studentProfile.education_level
    : 'Not specified';

  const studentName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="min-h-screen flex bg-[#F4F7FB] dark:bg-[#0B1120] text-[#172033] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* 1. Persistent Left Sidebar Navigation */}
      <StudentSidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        isMobileNavOpen={isMobileNavOpen}
        onCloseMobileNav={() => setIsMobileNavOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        studentName={studentName}
        studentEmail={user?.email || undefined}
        studentId={activeStudentId}
        courseName={courseTrackText}
        submissionCount={progressRecords.length}
        readinessScore={numericScore}
      />

      {/* 2. Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Sticky Header */}
        <StudentHeader
          activeNav={activeNav}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onRefresh={() => loadStudentAnalytics(true)}
          isRefreshing={isRefreshing || isLoading}
          studentName={studentName}
          studentRole={role || 'Student'}
          onNavigateHome={() => onNavigate('home')}
          onSignOut={onSignOut}
        />

        {/* 3. Main Content Container */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449]">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-[#2DD4BF]" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Querying verified learning records from Supabase...
              </p>
            </div>
          ) : rlsNotice ? (
            /* RLS Notice State */
            <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-300 dark:border-amber-800/60 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-800">
                  <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                      Database Row Level Security Policy Notice
                    </h3>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-200 dark:bg-amber-900/70 px-2 py-0.5 rounded">
                      Code 42501 (Permission Denied)
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-[#94A3B8] leading-relaxed">
                    Your authenticated account is mapped to Student ID{' '}
                    <code className="font-mono text-slate-900 dark:text-amber-200 bg-white dark:bg-[#111827] px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900 font-bold">
                      {activeStudentId ?? 'Pending'}
                    </code>
                    . However, Supabase Row Level Security (RLS) requires a SELECT policy linking{' '}
                    <code className="font-mono text-slate-900 dark:text-slate-200">user_id = auth.uid()</code> to read from{' '}
                    <code className="font-mono text-slate-900 dark:text-slate-200">student_learning_data</code>.
                  </p>
                  <div className="p-3 bg-slate-900 dark:bg-[#0B1120] rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 dark:border-[#273449]">
                    <p className="text-slate-400 mb-1">-- Required secure RLS policy for Supabase:</p>
                    <code>
                      CREATE POLICY "Students can read their own mapped learning data"<br />
                      ON public.student_learning_data FOR SELECT TO authenticated<br />
                      USING (user_id = auth.uid());
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ) : !primaryRecord && !activeStudentId ? (
            /* Setup Required State */
            <div className="p-8 bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-300 dark:border-[#273449] text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-[#2DD4BF] flex items-center justify-center mx-auto border border-teal-200/50 dark:border-teal-800/40">
                <FileQuestion className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Student Record Setup Required
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                  Your account is authenticated (<code className="font-mono text-slate-700 dark:text-slate-300">{user?.email}</code>), but does not have a linked record in <code className="font-mono text-slate-700 dark:text-slate-300">student_learning_data</code> or <code className="font-mono text-slate-700 dark:text-slate-300">public.students</code> yet.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contact your platform administrator or instructor to assign your institutional Student ID.
                </p>
              </div>
            </div>
          ) : (
            /* ACTIVE VIEW ROUTER (7 PAGES) */
            <>
              {/* VIEW 1: DASHBOARD (Overview with KPIs & Visualizations) */}
              {activeNav === 'dashboard' && (
                <div className="space-y-8">
                  {/* Session Identity & Security Bar */}
                  <section className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-[#2DD4BF] flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/40">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                              Active Student ID:
                            </span>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-300 dark:border-[#273449] text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC]">
                              <span>{activeStudentId ? String(activeStudentId) : 'Record Pending'}</span>
                              <span className="text-[10px] text-teal-700 dark:text-[#2DD4BF] bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.2 rounded font-sans uppercase font-bold">
                                Session Locked
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                            Data Isolation: Scoped to authenticated user <code className="font-mono text-slate-700 dark:text-slate-300">{user?.email}</code>.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
                          <span className="text-slate-400 text-[11px] block">Course Track</span>
                          <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">
                            {courseTrackText || 'Pending Course Mapping'}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
                          <span className="text-slate-400 text-[11px] block">Batch Code</span>
                          <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">
                            {batchCodeText || 'Pending Batch Mapping'}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
                          <span className="text-slate-400 text-[11px] block">Education Level</span>
                          <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">
                            {educationLevelText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Primary KPIs Row (4 Primary Cards) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI 1: Risk Level */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          Student Risk Level
                        </span>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            studentRiskNormalized === 'High'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                              : studentRiskNormalized === 'Medium'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              : studentRiskNormalized === 'Low'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-[#172033] text-slate-400'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <span
                          className={`text-2xl font-black font-mono tracking-tight ${
                            studentRiskNormalized === 'High'
                              ? 'text-rose-600 dark:text-rose-400'
                              : studentRiskNormalized === 'Medium'
                              ? 'text-amber-600 dark:text-amber-400'
                              : studentRiskNormalized === 'Low'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {studentRiskNormalized ? `${studentRiskNormalized} Risk` : 'Not Recorded'}
                        </span>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Database Record</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] border-t border-slate-100 dark:border-[#273449] pt-2.5">
                        Source: Column <code className="font-mono text-slate-700 dark:text-slate-300">risk_level</code>
                      </p>
                    </div>

                    {/* KPI 2: Placement Readiness */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          Placement Readiness
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Briefcase className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <span
                          className={`text-2xl font-black tracking-tight ${
                            placementReady === true
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : placementReady === false
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {placementReady === true
                            ? 'Placement Ready'
                            : placementReady === false
                            ? 'Developing'
                            : 'Status Pending'}
                        </span>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-[#2DD4BF] border border-teal-200 dark:border-teal-800/60">
                            <Award className="w-3 h-3" />
                            <span>Database Flag</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] border-t border-slate-100 dark:border-[#273449] pt-2.5">
                        Source: Column <code className="font-mono text-slate-700 dark:text-slate-300">placement_ready</code>
                      </p>
                    </div>

                    {/* KPI 3: Attendance Percentage */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          Attendance Percentage
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                          {attendanceFormatted !== null ? attendanceFormatted : 'Unrecorded'}
                        </span>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-[#2DD4BF] border border-teal-200 dark:border-teal-800/60 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Attendance</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] border-t border-slate-100 dark:border-[#273449] pt-2.5">
                        Source: Column <code className="font-mono text-slate-700 dark:text-slate-300">attendance_percentage</code>
                      </p>
                    </div>

                    {/* KPI 4: Readiness Score */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          Overall Readiness Score
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                            {numericScore !== null ? numericScore.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            / 100
                          </span>
                        </div>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-mono">
                            <span>Target: 70.0</span>
                            {numericScore !== null && (
                              <span className={`font-bold ml-1 ${numericScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                                ({numericScore >= 70 ? `+${(numericScore - 70).toFixed(1)}` : (numericScore - 70).toFixed(1)})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] border-t border-slate-100 dark:border-[#273449] pt-2.5">
                        Source: Column <code className="font-mono text-slate-700 dark:text-slate-300">overall_readiness_score</code>
                      </p>
                    </div>
                  </div>

                  {/* Secondary Learning Metrics Row (Assignment Completion, Avg Assessment, Practice Accuracy, Recommended Skill/Topic) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Secondary Metric 1: Assignment Completion */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          Assignment Completion
                        </span>
                        <CheckSquare className="w-4 h-4 text-teal-600 dark:text-[#2DD4BF]" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] font-mono tabular-nums">
                        {assignmentCompletionFormatted !== null ? assignmentCompletionFormatted : 'N/A'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        Source: <code className="font-mono text-slate-700 dark:text-slate-300">assignment_completion_percentage</code>
                      </p>
                    </div>

                    {/* Secondary Metric 2: Average Assessment Score */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          Average Assessment Score
                        </span>
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] font-mono tabular-nums">
                        {avgAssessmentScoreText !== null ? avgAssessmentScoreText : 'N/A'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        Source: <code className="font-mono text-slate-700 dark:text-slate-300">average_assessment_score</code>
                      </p>
                    </div>

                    {/* Secondary Metric 3: Practice Accuracy */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          Practice Accuracy
                        </span>
                        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] font-mono tabular-nums">
                        {practiceAccuracyFormatted !== null ? practiceAccuracyFormatted : 'N/A'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        Source: <code className="font-mono text-slate-700 dark:text-slate-300">practice_accuracy_percentage</code>
                      </p>
                    </div>

                    {/* Secondary Metric 4: Recommended Skill */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-5 shadow-xs transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          Recommended Skill
                        </span>
                        <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300 truncate">
                        {recommendedSkillText || 'Logical Reasoning'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        Source: <code className="font-mono text-slate-700 dark:text-slate-300">recommended_skill</code>
                      </p>
                    </div>
                  </div>

                  {/* Visualizations Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Suggested Practice Donut */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 shadow-xs transition-colors flex flex-col justify-between space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                          <span>Suggested Practice Allocation</span>
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                            Guideline Model
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                          Suggested study plan allocation based on assigned recommended topic
                        </p>
                      </div>

                      <StudentTopicFocusChart
                        recommendedTopic={recommendedTopicText}
                        courseName={courseTrackText}
                        batchCode={batchCodeText}
                      />
                    </div>

                    {/* Readiness Score Gauge */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 shadow-xs transition-colors flex flex-col justify-between space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                          <span>Readiness Score vs Threshold</span>
                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/60">
                            Scale 0 – 100
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                          Database score compared against 70.0 application placement target threshold
                        </p>
                      </div>

                      <StudentScoreGauge
                        score={numericScore}
                        benchmarkScore={70}
                        riskLevel={studentRiskNormalized || 'Low'}
                        isReady={placementReady ?? false}
                      />
                    </div>
                  </div>

                  {/* Suggested Learning Action Plan */}
                  <section className="bg-gradient-to-br from-teal-500/10 via-slate-50 to-blue-500/10 dark:from-teal-950/20 dark:via-[#111827] dark:to-blue-950/20 rounded-2xl border border-teal-200/80 dark:border-teal-800/60 p-6 sm:p-8 space-y-6 transition-colors shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-100 dark:border-[#273449] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                            Suggested Learning Action Plan
                          </h2>
                          <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                            Grounded study suggestions centered on your database-recommended topic
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-teal-800 dark:text-[#2DD4BF] bg-teal-100/80 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-300 dark:border-teal-800">
                        Study Guideline
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/80 dark:bg-[#172033]/80 border border-slate-200 dark:border-[#273449]">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                          Target Topic Focus: {recommendedTopicText || 'Assigned Coursework'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                          {recommendedLearningActionText || `Work through recommended practice drills in ${recommendedTopicText || 'your course modules'} to maintain readiness velocity.`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => setActiveNav('practice')}
                          className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>Go to Practice & Skills</span>
                        </button>
                        <button
                          onClick={() => setActiveNav('learning')}
                          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-[#273449] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>View Course Focus</span>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* VIEW 2: MY LEARNING (Course focus, roadmap & allocation) */}
              {activeNav === 'learning' && (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-6 shadow-xs transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-[#2DD4BF] flex items-center justify-center border border-teal-200/50 dark:border-teal-800/40">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                            My Learning & Course Roadmap
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                            Curriculum details from <code className="font-mono text-slate-700 dark:text-slate-300">student_learning_data</code>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-teal-700 dark:text-[#2DD4BF] bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800/60">
                        {courseTrackText || 'Active Curriculum'}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Enrolled Course</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                          {courseTrackText || 'Course Mapping Pending'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Batch: {batchCodeText || 'N/A'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Recommended Focus Topic</span>
                        <p className="text-sm font-bold text-teal-600 dark:text-[#2DD4BF]">
                          {recommendedTopicText || 'No Topic Assigned'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Source: <code className="font-mono">recommended_topic</code>
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">Education Level</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                          {educationLevelText}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Source: <code className="font-mono">public.students</code>
                        </p>
                      </div>
                    </div>

                    {/* Allocation Chart */}
                    <div className="pt-4 border-t border-slate-100 dark:border-[#273449] space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                        Suggested Practice Allocation Model
                      </h3>
                      <StudentTopicFocusChart
                        recommendedTopic={recommendedTopicText}
                        courseName={courseTrackText}
                        batchCode={batchCodeText}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: MY PROGRESS (Submissions & Competency Milestones) */}
              {activeNav === 'progress' && (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-5 shadow-xs transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-[#2DD4BF] flex items-center justify-center border border-teal-200/50 dark:border-teal-800/40">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                            Curriculum Practice Submissions
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                            Querying records in <code className="font-mono text-slate-700 dark:text-slate-300">public.student_progress</code>
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#172033] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-[#273449]">
                        Table Status
                      </span>
                    </div>

                    {progressRecords.length > 0 ? (
                      <div className="space-y-3">
                        {progressRecords.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] hover:border-teal-300 dark:hover:border-teal-600 bg-slate-50/50 dark:bg-[#172033]/60 transition-colors flex items-center justify-between"
                          >
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                                {item.title || `Curriculum Module #${idx + 1}`}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Course Ref: {item.course_id || 'Core Curriculum'}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                                {item.score ? `${item.score}% Score` : item.status || 'Recorded'}
                              </span>
                              {item.completed_at && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {new Date(item.completed_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 dark:bg-[#172033]/50 rounded-xl border border-dashed border-slate-300 dark:border-[#273449] space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                          No Practice Submissions Recorded
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-sm mx-auto">
                          There are currently zero completed records found in <code className="font-mono text-slate-700 dark:text-slate-300">public.student_progress</code> for your account. Scores will appear here when module exercises are submitted.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Readiness Meter */}
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-4 shadow-xs transition-colors">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                      Readiness Score Gauge & Threshold
                    </h3>
                    <StudentScoreGauge
                      score={numericScore}
                      benchmarkScore={70}
                      riskLevel={studentRiskNormalized || 'Low'}
                      isReady={placementReady ?? false}
                    />
                  </div>
                </div>
              )}

              {/* VIEW 4: PRACTICE & SKILLS (Drills & Suggested Workload) */}
              {activeNav === 'practice' && (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-6 shadow-xs transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/40">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                            Practice & Skill Drills
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                            Targeted problem sets for <strong className="text-slate-800 dark:text-slate-200">{recommendedTopicText || 'your assigned course'}</strong>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/60 font-mono">
                        Target: {suggestedPracticeHours}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Drill Session</span>
                          <span className="text-[10px] font-bold text-teal-700 dark:text-[#2DD4BF] bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                            10 Adaptive Questions
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                          Test your analytical deduction and problem-solving velocity in <strong>{recommendedTopicText || 'General Coursework'}</strong>.
                        </p>
                        <button
                          onClick={() => setActiveActionModal('practice')}
                          className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Target className="w-4 h-4" />
                          <span>Launch Practice Drill</span>
                        </button>
                      </div>

                      <div className="p-5 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Recommended Pacing</span>
                          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                            Study Target
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                          Maintaining a target workload of <strong>{suggestedPracticeHours}</strong> strengthens placement readiness scores ahead of midterms.
                        </p>
                        <button
                          onClick={() => setActiveActionModal('syllabus')}
                          className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-[#273449] border border-slate-200 dark:border-[#273449] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>View Course Syllabus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 5: AI LEARNING ASSISTANT */}
              {activeNav === 'assistant' && (
                <div className="w-full">
                  <StudentAnalyticsChatbot embedded={true} />
                </div>
              )}

              {/* VIEW 6: MY PROFILE (Academic Identity & Goals) */}
              {activeNav === 'profile' && (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-6 shadow-xs transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-[#2DD4BF] flex items-center justify-center border border-teal-200/50 dark:border-teal-800/40">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                            Academic Identity & Profile
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                            Verified student mapping in <code className="font-mono text-slate-700 dark:text-slate-300">public.students</code> &amp; <code className="font-mono text-slate-700 dark:text-slate-300">student_learning_data</code>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-teal-700 dark:text-[#2DD4BF] bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800/60 font-mono">
                        ID: {activeStudentId ? String(activeStudentId) : 'Record Pending'}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-1">
                        <span className="text-slate-400 font-semibold block">Full Name</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                          {studentName}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-1">
                        <span className="text-slate-400 font-semibold block">Authenticated Email</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
                          {user?.email || 'N/A'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-1">
                        <span className="text-slate-400 font-semibold block">Institutional Student ID</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
                          {activeStudentId ? String(activeStudentId) : 'Record Pending'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-1 sm:col-span-2 lg:col-span-3">
                        <span className="text-slate-400 font-semibold block">Declared Learning Goals</span>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                          {studentProfile?.learning_goals?.trim()
                            ? studentProfile.learning_goals
                            : 'No specific learning goals recorded in public.students.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 7: SETTINGS (Preferences & Security) */}
              {activeNav === 'settings' && (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-6 shadow-xs transition-colors">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#111827] text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-[#273449]">
                          <Settings className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                            Platform Preferences & Settings
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                            Manage theme customization, notifications, and security controls
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 text-xs">
                      {/* Theme Toggle Section */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 dark:text-[#F8FAFC] block">
                            Appearance Theme
                          </span>
                          <p className="text-slate-500 dark:text-[#94A3B8]">
                            Switch between Light and Dark mode interfaces
                          </p>
                        </div>
                        <ThemeToggle />
                      </div>

                      {/* Notification Preferences */}
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/70 space-y-3">
                        <span className="font-bold text-slate-900 dark:text-[#F8FAFC] block">
                          Notification Preferences
                        </span>

                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-slate-700 dark:text-slate-300">Email Progress Digest</span>
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer border-t border-slate-200/60 dark:border-[#273449] pt-2">
                          <span className="text-slate-700 dark:text-slate-300">Practice Sprint Reminders</span>
                          <input
                            type="checkbox"
                            checked={progressAlerts}
                            onChange={(e) => setProgressAlerts(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
