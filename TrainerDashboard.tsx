/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { TrainerSidebar, TrainerNavTab } from './trainer/TrainerSidebar';
import { TrainerHeader } from './trainer/TrainerHeader';
import { TrainerKpisAndCharts } from './trainer/TrainerKpisAndCharts';
import { TrainerStudentsView } from './trainer/TrainerStudentsView';
import { TrainerProgressView } from './trainer/TrainerProgressView';
import { TrainerRiskView } from './trainer/TrainerRiskView';
import { TrainerRecommendationsView } from './trainer/TrainerRecommendationsView';
import { TrainerProfileView } from './trainer/TrainerProfileView';
import { TrainerSettingsView } from './trainer/TrainerSettingsView';
import { AlertCircle } from 'lucide-react';

// Combined student interface for assigned mentees
export interface AssignedStudent {
  assignmentId: string | number;
  assignedAt?: string | null;
  studentUserId: string;
  fullName: string;
  email: string;
  studentId: string | number | null;
  educationLevel?: string | null;
  learningGoals?: string | null;
  course: string;
  batch: string;
  readinessScore: number | null;
  riskLevel: 'High' | 'Medium' | 'Low';
  placementReady: boolean;
  recommendedTopic?: string | null;
}

export interface TrainerProfileRecord {
  user_id: string;
  specialization?: string | null;
  experience_years?: number | null;
}

export interface AssignedCourseRecord {
  id?: string;
  title?: string;
  description?: string;
  code?: string;
  trainer_id?: string | null;
  created_at?: string;
}

// Extraction helpers for learning metrics
function extractReadinessScore(record?: Record<string, unknown> | null): number | null {
  if (!record) return null;
  const raw =
    record.overall_readiness_score !== undefined && record.overall_readiness_score !== null
      ? record.overall_readiness_score
      : record.readiness_score !== undefined && record.readiness_score !== null
      ? record.readiness_score
      : record.score;

  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return isNaN(raw) ? null : raw;
  if (typeof raw === 'string') {
    const cleaned = raw.trim().replace(/%$/, '');
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

function extractRiskLevel(record?: Record<string, unknown> | null): 'High' | 'Medium' | 'Low' {
  if (!record) return 'Low';
  const val = String(record.risk_level ?? record.risk ?? '').toLowerCase().trim();
  if (val.includes('high')) return 'High';
  if (val.includes('med')) return 'Medium';
  if (val.includes('low')) return 'Low';
  return 'Low';
}

function extractPlacementReady(record?: Record<string, unknown> | null): boolean {
  if (!record) return false;
  if (record.placement_ready === true || record.placement_readiness === true) return true;
  const val = String(record.placement_ready ?? record.placement_readiness ?? '').toLowerCase().trim();
  return val === 'yes' || val === 'ready' || val === 'true' || val === '1';
}

export function TrainerDashboard({
  onNavigate,
  onSignOut,
}: {
  onNavigate: (page: 'home' | 'about' | 'contact' | 'login' | 'signup' | 'dashboard') => void;
  onSignOut: () => Promise<void>;
}) {
  const { user, profile, role } = useAuth();

  // Navigation State
  const [activeNav, setActiveNav] = useState<TrainerNavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Data State
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [trainerDetails, setTrainerDetails] = useState<TrainerProfileRecord | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourseRecord[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rlsNotice, setRlsNotice] = useState<boolean>(false);

  /**
   * Supabase Data Fetching Routine:
   * 1. Query trainer_student_assignments matching trainer_user_id = user.id
   * 2. Query users for student names & emails
   * 3. Query students for institutional student_id & background
   * 4. Query student_learning_data for readiness score, risk level, placement readiness, recommended topics
   */
  const fetchTrainerData = useCallback(
    async (isManualRefresh = false) => {
      if (!user?.id || !supabase || !isSupabaseConfigured) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);
      setRlsNotice(false);

      try {
        // Step 1: Query trainer details
        const { data: trainerRecord } = await supabase
          .from('trainers')
          .select('user_id, specialization, experience_years')
          .eq('user_id', user.id)
          .maybeSingle();

        if (trainerRecord) {
          setTrainerDetails(trainerRecord as TrainerProfileRecord);
        }

        // Step 2: Query assigned courses if available
        try {
          const { data: coursesData } = await supabase
            .from('courses')
            .select('id, title, description, trainer_id, created_at')
            .eq('trainer_id', user.id);
          if (coursesData) {
            setAssignedCourses(coursesData);
          }
        } catch {
          // Optional table
        }

        // Step 3: Query trainer_student_assignments for auth.uid()
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('trainer_student_assignments')
          .select('id, trainer_user_id, student_user_id, assigned_at')
          .eq('trainer_user_id', user.id);

        if (assignmentsError) {
          console.warn('[TrainerDashboard] assignments query error:', assignmentsError);
          if (assignmentsError.code === '42501') {
            setRlsNotice(true);
            setErrorMessage(
              'Access to student assignments restricted by Supabase Row-Level Security (RLS error 42501).'
            );
          } else {
            setErrorMessage(assignmentsError.message || 'Unable to retrieve assigned students.');
          }
          setAssignedStudents([]);
          return;
        }

        if (!assignmentsData || assignmentsData.length === 0) {
          setAssignedStudents([]);
          return;
        }

        const studentUserIds = assignmentsData
          .map((a) => a.student_user_id)
          .filter((id): id is string => Boolean(id));

        if (studentUserIds.length === 0) {
          setAssignedStudents([]);
          return;
        }

        // Step 4: Query student names and emails
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name, email, role')
          .in('id', studentUserIds);

        const userMap = new Map<string, { full_name?: string | null; email?: string | null }>();
        if (usersData) {
          for (const u of usersData) {
            userMap.set(u.id, { full_name: u.full_name, email: u.email });
          }
        }

        // Step 5: Query academic profile & institutional student_id
        const { data: studentsData } = await supabase
          .from('students')
          .select('user_id, student_id, education_level, learning_goals')
          .in('user_id', studentUserIds);

        const studentProfileMap = new Map<
          string,
          { student_id?: string | number | null; education_level?: string | null; learning_goals?: string | null }
        >();
        const institutionalStudentIds: Array<string | number> = [];

        if (studentsData) {
          for (const s of studentsData) {
            studentProfileMap.set(s.user_id, {
              student_id: s.student_id,
              education_level: s.education_level,
              learning_goals: s.learning_goals,
            });
            if (s.student_id !== null && s.student_id !== undefined) {
              institutionalStudentIds.push(s.student_id);
            }
          }
        }

        // Step 6: Query learning metrics matching institutional student_id
        const learningDataMap = new Map<string, Record<string, unknown>>();
        if (institutionalStudentIds.length > 0) {
          const { data: learningData } = await supabase
            .from('student_learning_data')
            .select('*')
            .in('student_id', institutionalStudentIds);

          if (learningData) {
            for (const item of learningData) {
              if (item.student_id !== null && item.student_id !== undefined) {
                learningDataMap.set(String(item.student_id), item);
              }
            }
          }
        }

        // Step 7: Combine records
        const combined: AssignedStudent[] = assignmentsData.map((assignment) => {
          const sUserId = assignment.student_user_id;
          const uInfo = userMap.get(sUserId);
          const sProfile = studentProfileMap.get(sUserId);
          const rawStudentId = sProfile?.student_id ?? null;
          const learningRecord = rawStudentId !== null ? learningDataMap.get(String(rawStudentId)) : null;

          const fullName =
            uInfo?.full_name?.trim() ||
            (uInfo?.email ? uInfo.email.split('@')[0] : `Student (${sUserId.slice(0, 6)})`);
          const email = uInfo?.email || 'No email recorded';
          const course = String(learningRecord?.course || 'Core Track');
          const batch = String(learningRecord?.batch || '2013J');
          const readinessScore = extractReadinessScore(learningRecord);
          const riskLevel = extractRiskLevel(learningRecord);
          const placementReady = extractPlacementReady(learningRecord);
          const recommendedTopic =
            (learningRecord?.recommended_topic as string) ||
            (learningRecord?.recommended_topics as string) ||
            null;

          return {
            assignmentId: assignment.id,
            assignedAt: assignment.assigned_at,
            studentUserId: sUserId,
            fullName,
            email,
            studentId: rawStudentId,
            educationLevel: sProfile?.education_level || null,
            learningGoals: sProfile?.learning_goals || null,
            course,
            batch,
            readinessScore,
            riskLevel,
            placementReady,
            recommendedTopic,
          };
        });

        setAssignedStudents(combined);
      } catch (err: unknown) {
        console.warn('[TrainerDashboard] Fetch error:', err);
        setErrorMessage('An error occurred while retrieving assigned mentees.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchTrainerData(false);
  }, [fetchTrainerData]);

  const highRiskCount = assignedStudents.filter((s) => s.riskLevel === 'High').length;

  return (
    <div className="min-h-screen flex bg-[#F4F7FB] dark:bg-[#0B1120] text-[#172033] dark:text-[#F8FAFC] font-sans antialiased transition-colors duration-200">
      {/* 1. Left Sidebar Navigation */}
      <TrainerSidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileNavOpen={isMobileNavOpen}
        onCloseMobileNav={() => setIsMobileNavOpen(false)}
        trainerName={profile?.full_name || user?.email?.split('@')[0] || 'Trainer'}
        trainerEmail={user?.email}
        trainerSpecialization={trainerDetails?.specialization || 'Software & AI Systems'}
        assignedCount={assignedStudents.length}
        highRiskCount={highRiskCount}
        onSignOut={onSignOut}
      />

      {/* 2. Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <TrainerHeader
          activeNav={activeNav}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onRefresh={() => fetchTrainerData(true)}
          isRefreshing={isRefreshing}
          trainerName={profile?.full_name || user?.email?.split('@')[0] || 'Trainer'}
          trainerEmail={user?.email}
          onNavigateHome={() => onNavigate('home')}
          onSignOut={onSignOut}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Notice</p>
                <p className="text-rose-700 dark:text-rose-300">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* VIEW SWITCHER */}
          {activeNav === 'dashboard' && (
            <TrainerKpisAndCharts
              assignedStudents={assignedStudents}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onNavigateTab={setActiveNav}
            />
          )}

          {activeNav === 'students' && (
            <TrainerStudentsView
              assignedStudents={assignedStudents}
              isLoading={isLoading}
              onRefresh={() => fetchTrainerData(true)}
              isRefreshing={isRefreshing}
              trainerUserId={user?.id}
            />
          )}

          {activeNav === 'progress' && (
            <TrainerProgressView assignedStudents={assignedStudents} />
          )}

          {activeNav === 'risk' && (
            <TrainerRiskView assignedStudents={assignedStudents} />
          )}

          {activeNav === 'recommendations' && (
            <TrainerRecommendationsView assignedStudents={assignedStudents} />
          )}

          {activeNav === 'profile' && (
            <TrainerProfileView
              trainerName={profile?.full_name || user?.email?.split('@')[0] || 'Trainer'}
              trainerEmail={user?.email}
              trainerUserId={user?.id}
              trainerDetails={trainerDetails}
              assignedCourses={assignedCourses}
              assignedCount={assignedStudents.length}
            />
          )}

          {activeNav === 'settings' && (
            <TrainerSettingsView
              trainerEmail={user?.email}
            />
          )}
        </main>
      </div>
    </div>
  );
}
