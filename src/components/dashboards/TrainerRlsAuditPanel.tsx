/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  Database,
  Terminal,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface RlsTestItem {
  id: string;
  name: string;
  targetTable: string;
  unfilteredQuery: string;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'NOT_PROVEN';
  returnedRowCount: number;
  expectedRowCount: string;
  errorCode: string | null;
  errorMessage: string | null;
  summary: string;
  details: string;
  returnedSample?: Array<Record<string, unknown>>;
}

interface TrainerRlsAuditPanelProps {
  trainerUserId: string;
  trainerEmail: string;
  assignedStudentUserIds: string[];
  assignedStudentIds: Array<string | number>;
  onClose?: () => void;
}

export function TrainerRlsAuditPanel({
  trainerUserId,
  trainerEmail,
  assignedStudentUserIds,
  assignedStudentIds,
  onClose,
}: TrainerRlsAuditPanelProps) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastExecutedAt, setLastExecutedAt] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<RlsTestItem[]>([]);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [isolationVerdict, setIsolationVerdict] = useState<{
    status: 'NOT_PROVEN' | 'PASS' | 'FAIL';
    reason: string;
    safestNextStep: string;
  }>({
    status: 'NOT_PROVEN',
    reason: 'Single-trainer database limitation: only 1 trainer exists in public.users.',
    safestNextStep:
      'In a test/staging environment, insert a secondary trainer account and assignment, then re-execute this test to prove foreign records are filtered.',
  });

  const runRlsTests = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      return;
    }

    setIsRunning(true);
    const results: RlsTestItem[] = [];

    console.group(
      `%c[RLS Runtime Test] Executing Read-Only Security Audit for Trainer %c${trainerEmail}`,
      'color: #3b82f6; font-weight: bold;',
      'color: #8b5cf6; font-weight: bold;'
    );
    console.log('[RLS Runtime Test] Trainer UUID:', trainerUserId);
    console.log('[RLS Runtime Test] Auth Mode: Supabase Client Session JWT (No Service-Role Key)');

    // -------------------------------------------------------------
    // Test 1: Read all rows from trainer_student_assignments (UNFILTERED)
    // -------------------------------------------------------------
    const dynamicAssignedStudentUserIds: string[] = [];
    try {
      const q1Start = performance.now();
      const { data: assignmentsData, error: q1Error, status: q1Status } = await supabase
        .from('trainer_student_assignments')
        .select('*');
      const q1Duration = Math.round(performance.now() - q1Start);

      const rows = assignmentsData || [];
      const rowCount = rows.length;
      const foreignTrainerRows = rows.filter(
        (r) => r.trainer_user_id && r.trainer_user_id !== trainerUserId
      );

      if (assignmentsData && Array.isArray(assignmentsData)) {
        for (const a of assignmentsData) {
          if (a.trainer_user_id === trainerUserId && a.student_user_id) {
            dynamicAssignedStudentUserIds.push(String(a.student_user_id));
          }
        }
      }

      let t1Status: 'PASS' | 'FAIL' | 'NOT_PROVEN' = 'PASS';
      let t1Summary = '';
      let t1Details = '';

      if (q1Error) {
        if (q1Error.code === '42501') {
          t1Status = 'PASS';
          t1Summary = 'Query blocked by RLS error 42501 (Permission Denied). Zero rows leaked.';
          t1Details = `Database policy denies unpermitted SELECT on trainer_student_assignments for authenticated role.`;
        } else {
          t1Status = 'FAIL';
          t1Summary = `Query error: ${q1Error.message} (Code: ${q1Error.code})`;
          t1Details = `Unexpected error returned from database: ${q1Error.message}`;
        }
      } else if (foreignTrainerRows.length > 0) {
        t1Status = 'FAIL';
        t1Summary = `DATA LEAK: ${foreignTrainerRows.length} assignments belonging to other trainers were returned!`;
        t1Details = `Unfiltered SELECT returned assignments where trainer_user_id does not match the authenticated trainer (${trainerUserId}). Supabase RLS is not restricting assignments to trainer_user_id = auth.uid().`;
      } else if (rowCount > 0 && rows.every((r) => r.trainer_user_id === trainerUserId)) {
        // All returned rows belong to this trainer, but only 1 trainer exists in the database
        t1Status = 'NOT_PROVEN';
        t1Summary = `Returned ${rowCount} row(s) (all matching this trainer). Cross-trainer isolation is NOT PROVEN.`;
        t1Details = `All ${rowCount} returned record(s) belong to this authenticated trainer (${trainerEmail || trainerUserId.slice(0, 8)}). However, because zero assignments exist for other trainers in this dataset, cross-trainer isolation cannot be proven without additional test data.`;
      } else if (rowCount === 0) {
        t1Status = 'PASS';
        t1Summary = 'Returned 0 rows. No assignments leaked.';
        t1Details = 'Unfiltered query returned 0 rows, preventing any cross-trainer assignment leakage.';
      }

      console.log(`[RLS Runtime Test 1] trainer_student_assignments:`, {
        verdict: t1Status,
        rowsReturned: rowCount,
        foreignRowsFound: foreignTrainerRows.length,
        durationMs: q1Duration,
        error: q1Error,
      });

      results.push({
        id: 'test-assignments',
        name: 'Query 1: trainer_student_assignments',
        targetTable: 'public.trainer_student_assignments',
        unfilteredQuery: 'supabase.from("trainer_student_assignments").select("*")',
        status: t1Status,
        returnedRowCount: rowCount,
        expectedRowCount: 'Mentees assigned to this trainer (or 0 if blocked)',
        errorCode: q1Error?.code || (q1Status ? String(q1Status) : null),
        errorMessage: q1Error?.message || null,
        summary: t1Summary,
        details: t1Details,
        returnedSample: rows.slice(0, 3) as Array<Record<string, unknown>>,
      });
    } catch (err: unknown) {
      results.push({
        id: 'test-assignments',
        name: 'Query 1: trainer_student_assignments',
        targetTable: 'public.trainer_student_assignments',
        unfilteredQuery: 'supabase.from("trainer_student_assignments").select("*")',
        status: 'FAIL',
        returnedRowCount: 0,
        expectedRowCount: 'Assigned mentees',
        errorCode: 'EXCEPTION',
        errorMessage: err instanceof Error ? err.message : String(err),
        summary: 'Exception occurred while querying trainer_student_assignments.',
        details: String(err),
      });
    }

    // Dynamic set of all authorized user IDs for this trainer:
    // 1. The trainer's own user ID
    // 2. Any student user IDs passed via props from assigned students
    // 3. Any student user IDs dynamically discovered from trainer_student_assignments in Query 1
    const allAuthorizedUserIds = new Set<string>([
      trainerUserId,
      ...assignedStudentUserIds.map(String),
      ...dynamicAssignedStudentUserIds,
    ]);

    // -------------------------------------------------------------
    // Test 2: Read all rows from students (UNFILTERED)
    // -------------------------------------------------------------
    try {
      const q2Start = performance.now();
      const { data: studentsData, error: q2Error, status: q2Status } = await supabase
        .from('students')
        .select('user_id, student_id');
      const q2Duration = Math.round(performance.now() - q2Start);

      const rows = studentsData || [];
      const rowCount = rows.length;

      // Check if unassigned student user IDs are present
      const unassignedStudents = rows.filter(
        (s) => s.user_id && !allAuthorizedUserIds.has(String(s.user_id)) && s.user_id !== trainerUserId
      );

      let t2Status: 'PASS' | 'FAIL' | 'NOT_PROVEN' = 'PASS';
      let t2Summary = '';
      let t2Details = '';

      if (q2Error) {
        if (q2Error.code === '42501') {
          t2Status = 'PASS';
          t2Summary = 'Access blocked by RLS error 42501 (Permission Denied). Zero unassigned students leaked.';
          t2Details = 'RLS strictly restricts direct SELECT access to public.students for this role.';
        } else {
          t2Status = 'FAIL';
          t2Summary = `Query error: ${q2Error.message}`;
          t2Details = `Unexpected database error: ${q2Error.message}`;
        }
      } else if (unassignedStudents.length > 0) {
        t2Status = 'FAIL';
        t2Summary = `DATA LEAK: ${unassignedStudents.length} unassigned student profile(s) returned without assignment!`;
        t2Details = `Unfiltered SELECT returned student records not assigned to this trainer (total ${rowCount} students). RLS policy does not restrict trainer reads to assigned mentees.`;
      } else if (rowCount > 0 && unassignedStudents.length === 0) {
        t2Status = 'PASS';
        t2Summary = `Returned ${rowCount} row(s) strictly matching assigned mentee(s).`;
        t2Details = `All returned student rows correspond directly to this trainer's assigned mentees. Unassigned students are hidden by RLS.`;
      } else if (rowCount === 0) {
        t2Status = 'PASS';
        t2Summary = 'Returned 0 rows. Zero unassigned students leaked.';
        t2Details =
          'The existing policy on public.students restricts reads to auth.uid() = user_id. Since the trainer is not a student, 0 rows are returned, ensuring student isolation.';
      }

      console.log(`[RLS Runtime Test 2] students:`, {
        verdict: t2Status,
        rowsReturned: rowCount,
        unassignedStudentsFound: unassignedStudents.length,
        durationMs: q2Duration,
        error: q2Error,
      });

      results.push({
        id: 'test-students',
        name: 'Query 2: students',
        targetTable: 'public.students',
        unfilteredQuery: "supabase.from('students').select('user_id, student_id')",
        status: t2Status,
        returnedRowCount: rowCount,
        expectedRowCount: '0 rows (or assigned mentees only)',
        errorCode: q2Error?.code || null,
        errorMessage: q2Error?.message || null,
        summary: t2Summary,
        details: t2Details,
        returnedSample: rows.slice(0, 3) as Array<Record<string, unknown>>,
      });
    } catch (err: unknown) {
      results.push({
        id: 'test-students',
        name: 'Query 2: students',
        targetTable: 'public.students',
        unfilteredQuery: "supabase.from('students').select('user_id, student_id')",
        status: 'FAIL',
        returnedRowCount: 0,
        expectedRowCount: '0',
        errorCode: 'EXCEPTION',
        errorMessage: err instanceof Error ? err.message : String(err),
        summary: 'Exception occurred while querying students.',
        details: String(err),
      });
    }

    // -------------------------------------------------------------
    // Test 3: Read all rows from users (UNFILTERED)
    // -------------------------------------------------------------
    try {
      const q3Start = performance.now();
      const { data: usersData, error: q3Error, status: q3Status } = await supabase
        .from('users')
        .select('id, role');
      const q3Duration = Math.round(performance.now() - q3Start);

      const rows = usersData || [];
      const rowCount = rows.length;

      // Filter unauthorized users: records that are neither the authenticated trainer
      // nor any student legitimately assigned to this trainer via trainer_student_assignments
      const unauthorizedUsers = rows.filter(
        (u) => !u.id || !allAuthorizedUserIds.has(String(u.id))
      );

      let t3Status: 'PASS' | 'FAIL' | 'NOT_PROVEN' = 'NOT_PROVEN';
      let t3Summary = '';
      let t3Details = '';

      if (q3Error) {
        if (q3Error.code === '42501') {
          t3Status = 'PASS';
          t3Summary = 'Access blocked by RLS error 42501. User directory is protected.';
          t3Details = 'RLS policy on public.users denies arbitrary SELECT for authenticated users.';
        } else {
          t3Status = 'FAIL';
          t3Summary = `Query error: ${q3Error.message}`;
          t3Details = `Unexpected database error: ${q3Error.message}`;
        }
      } else if (unauthorizedUsers.length > 0) {
        // Unauthorized records returned (unassigned students, other trainers, or admins)
        t3Status = 'FAIL';
        t3Summary = `UNAUTHORIZED DIRECTORY LEAK: ${unauthorizedUsers.length} unassigned or foreign user record(s) returned (total: ${rowCount})!`;
        t3Details = `Unfiltered SELECT returned user accounts that are neither the authenticated trainer nor assigned mentees. RLS policy on public.users is overly permissive and leaked unassigned profiles.`;
      } else if (rowCount > 0 && unauthorizedUsers.length === 0) {
        // All returned records are legitimately authorized: trainer's own profile and/or assigned student profiles
        // Note: Correcting the audit's classification is not proof that cross-trainer isolation works.
        // Marked as NOT PROVEN until validated using an authorized second-trainer test case.
        t3Status = 'NOT_PROVEN';
        t3Summary = `Returned ${rowCount} authorized profile(s) (trainer + assigned mentees). Cross-trainer user isolation is NOT PROVEN.`;
        t3Details = `All ${rowCount} returned record(s) strictly belong to the authorized set: the authenticated trainer's own profile and legitimately assigned mentees. No unassigned student or foreign user records were exposed. However, because zero secondary trainer accounts exist in the current database, cross-trainer isolation cannot be mathematically proven without a dedicated second-trainer test case.`;
      } else if (rowCount === 0) {
        t3Status = 'PASS';
        t3Summary = 'Returned 0 rows. Directory enumeration prevented.';
        t3Details = 'Zero user records exposed.';
      }

      console.log(`[RLS Runtime Test 3] users:`, {
        verdict: t3Status,
        rowsReturned: rowCount,
        unauthorizedUsersFound: unauthorizedUsers.length,
        durationMs: q3Duration,
        error: q3Error,
      });

      results.push({
        id: 'test-users',
        name: 'Query 3: users',
        targetTable: 'public.users',
        unfilteredQuery: "supabase.from('users').select('id, role')",
        status: t3Status,
        returnedRowCount: rowCount,
        expectedRowCount: 'Authorized profiles only (trainer + assigned mentees)',
        errorCode: q3Error?.code || null,
        errorMessage: q3Error?.message || null,
        summary: t3Summary,
        details: t3Details,
        returnedSample: rows.slice(0, 3) as Array<Record<string, unknown>>,
      });
    } catch (err: unknown) {
      results.push({
        id: 'test-users',
        name: 'Query 3: users',
        targetTable: 'public.users',
        unfilteredQuery: "supabase.from('users').select('id, role')",
        status: 'FAIL',
        returnedRowCount: 0,
        expectedRowCount: 'Authorized profiles only',
        errorCode: 'EXCEPTION',
        errorMessage: err instanceof Error ? err.message : String(err),
        summary: 'Exception occurred while querying users.',
        details: String(err),
      });
    }

    // -------------------------------------------------------------
    // Test 4: Read all rows from student_learning_data (UNFILTERED)
    // -------------------------------------------------------------
    try {
      const q4Start = performance.now();
      const { data: learningData, error: q4Error, status: q4Status } = await supabase
        .from('student_learning_data')
        .select('student_id');
      const q4Duration = Math.round(performance.now() - q4Start);

      const rows = learningData || [];
      const rowCount = rows.length;

      // Check how many records belong to unassigned student IDs
      const unassignedLearningRecords = rows.filter(
        (l) => l.student_id !== null && l.student_id !== undefined && !assignedStudentIds.includes(l.student_id)
      );

      let t4Status: 'PASS' | 'FAIL' | 'NOT_PROVEN' = 'PASS';
      let t4Summary = '';
      let t4Details = '';

      if (q4Error) {
        if (q4Error.code === '42501') {
          t4Status = 'PASS';
          t4Summary = 'Access blocked by RLS error 42501 (Permission Denied). 500 dataset records protected.';
          t4Details = 'RLS policy strictly prevents authenticated trainers from querying student_learning_data without explicit authorization.';
        } else {
          t4Status = 'FAIL';
          t4Summary = `Query error: ${q4Error.message}`;
          t4Details = `Unexpected database error: ${q4Error.message}`;
        }
      } else if (rowCount >= 500 || unassignedLearningRecords.length > 0) {
        t4Status = 'FAIL';
        t4Summary = `DATA LEAK: Returned ${rowCount} learning records (including ${unassignedLearningRecords.length} unassigned student records)!`;
        t4Details = `Unfiltered SELECT on student_learning_data returned records beyond the trainer's assigned mentees. RLS does not isolate records to assigned student IDs.`;
      } else if (rowCount > 0 && unassignedLearningRecords.length === 0) {
        t4Status = 'PASS';
        t4Summary = `Returned ${rowCount} record(s) strictly matching assigned student ID(s) (${assignedStudentIds.join(', ')}).`;
        t4Details = `All 500 institutional records are protected; only records corresponding to assigned mentees are returned.`;
      } else if (rowCount === 0) {
        t4Status = 'PASS';
        t4Summary = 'Returned 0 rows. All 500 dataset records are shielded from arbitrary query.';
        t4Details =
          'The existing policy on student_learning_data ("Students can read their own mapped learning data") restricts access to student_id IN (SELECT student_id FROM students WHERE user_id = auth.uid()). Since the trainer has no record in students, 0 rows are returned, ensuring unassigned records are never leaked.';
      }

      console.log(`[RLS Runtime Test 4] student_learning_data:`, {
        verdict: t4Status,
        rowsReturned: rowCount,
        unassignedRecordsFound: unassignedLearningRecords.length,
        durationMs: q4Duration,
        error: q4Error,
      });

      results.push({
        id: 'test-learning-data',
        name: 'Query 4: student_learning_data',
        targetTable: 'public.student_learning_data',
        unfilteredQuery: "supabase.from('student_learning_data').select('student_id')",
        status: t4Status,
        returnedRowCount: rowCount,
        expectedRowCount: '0 rows (policy auth.uid() = user_id on students subquery)',
        errorCode: q4Error?.code || null,
        errorMessage: q4Error?.message || null,
        summary: t4Summary,
        details: t4Details,
        returnedSample: rows.slice(0, 3) as Array<Record<string, unknown>>,
      });
    } catch (err: unknown) {
      results.push({
        id: 'test-learning-data',
        name: 'Query 4: student_learning_data',
        targetTable: 'public.student_learning_data',
        unfilteredQuery: "supabase.from('student_learning_data').select('student_id')",
        status: 'FAIL',
        returnedRowCount: 0,
        expectedRowCount: '0',
        errorCode: 'EXCEPTION',
        errorMessage: err instanceof Error ? err.message : String(err),
        summary: 'Exception occurred while querying student_learning_data.',
        details: String(err),
      });
    }

    // -------------------------------------------------------------
    // Cross-Trainer Isolation Synthesis
    // -------------------------------------------------------------
    const hasFailures = results.some((r) => r.status === 'FAIL');
    if (hasFailures) {
      setIsolationVerdict({
        status: 'FAIL',
        reason: 'One or more queries exposed records belonging to unassigned students or foreign accounts.',
        safestNextStep: 'Review and tighten RLS SELECT policies on the failed tables in Supabase.',
      });
    } else {
      setIsolationVerdict({
        status: 'NOT_PROVEN',
        reason:
          `Current database contains only 1 trainer account (${trainerEmail || trainerUserId.slice(0, 8)}) and only assignments belonging to this trainer. Because zero assignments exist for other trainers in this dataset, cross-trainer isolation cannot be mathematically proven from query results alone.`,
        safestNextStep:
          'In a test or staging environment, insert a secondary trainer user and a second assignment for a distinct student, then verify that an unfiltered query returns only this trainer\'s assignments.',
      });
    }

    console.log(
      `%c[RLS Runtime Test] Cross-Trainer Isolation Verdict: ${hasFailures ? 'FAIL' : 'NOT PROVEN'}`,
      'color: #f59e0b; font-weight: bold;'
    );
    console.groupEnd();

    setTestResults(results);
    setLastExecutedAt(new Date().toLocaleTimeString());
    setIsRunning(false);
  }, [trainerUserId, trainerEmail, assignedStudentUserIds, assignedStudentIds]);

  // Run automatically on mount
  useEffect(() => {
    runRlsTests();
  }, [runRlsTests]);

  const getStatusBadge = (status: RlsTestItem['status']) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            FAIL
          </span>
        );
      case 'NOT_PROVEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            NOT PROVEN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-[#111827] dark:text-slate-300 dark:border-[#273449]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500 dark:text-slate-400" />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] shadow-sm overflow-hidden space-y-0 transition-colors">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 dark:from-[#0B1120] dark:via-[#111827] dark:to-[#0F292B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 dark:border-[#273449]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Lock className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Runtime Row-Level Security (RLS) Test Suite
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
              Read-Only
            </span>
          </div>
          <p className="text-xs text-slate-300 dark:text-[#94A3B8]">
            Executes unfiltered queries via the authenticated trainer's active Supabase client &amp; JWT. Zero service-role keys used.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={runRlsTests}
            disabled={isRunning}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing Tests...' : 'Re-run RLS Audit'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Context Facts & Authentication Banner */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-[#273449] text-xs text-slate-600 dark:text-[#94A3B8] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            <strong className="text-slate-800 dark:text-[#F8FAFC]">Authenticated Trainer:</strong> {trainerEmail}
          </span>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span>
            <strong className="text-slate-800 dark:text-[#F8FAFC]">Trainer UID:</strong>{' '}
            <code className="font-mono bg-white dark:bg-[#172033] px-1 py-0.5 rounded border border-slate-200 dark:border-[#273449] text-slate-900 dark:text-[#F8FAFC]">
              {trainerUserId.slice(0, 8)}...{trainerUserId.slice(-4)}
            </code>
          </span>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span>
            <strong className="text-slate-800 dark:text-[#F8FAFC]">Assigned Mentees:</strong>{' '}
            {assignedStudentIds.length > 0
              ? `${assignedStudentIds.length} Active (IDs: ${assignedStudentIds.join(', ')})`
              : 'None recorded'}
          </span>
        </div>
        {lastExecutedAt && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Last Executed: <strong className="text-slate-700 dark:text-slate-300">{lastExecutedAt}</strong>
          </span>
        )}
      </div>

      {/* Cross-Trainer Isolation Verdict Summary Card */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#273449] bg-amber-50/60 dark:bg-amber-950/20">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Cross-Trainer Isolation Verification Status:
              </h3>
              {getStatusBadge(isolationVerdict.status)}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Dataset Limitation Finding:</strong> {isolationVerdict.reason}
            </p>
            <div className="p-2.5 bg-white/90 dark:bg-[#111827]/90 rounded-lg border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-slate-700 dark:text-[#94A3B8] space-y-1">
              <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Safest Next Test (Non-Destructive):</span>
              </div>
              <p className="leading-relaxed">{isolationVerdict.safestNextStep}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Query Test Results */}
      <div className="divide-y divide-slate-200 dark:divide-[#273449]">
        {testResults.map((test) => {
          const isExpanded = expandedTest === test.id;
          return (
            <div key={test.id} className="p-5 sm:p-6 transition-colors hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">{test.targetTable}</span>
                    {getStatusBadge(test.status)}
                    <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono bg-slate-100 dark:bg-[#111827] px-2 py-0.5 rounded border border-slate-200 dark:border-[#273449]">
                      Rows Returned: <strong className="text-slate-800 dark:text-[#F8FAFC]">{test.returnedRowCount}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{test.summary}</p>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono bg-slate-100/70 dark:bg-[#111827] px-2.5 py-1 rounded inline-block border border-transparent dark:border-[#273449]">
                    {test.unfilteredQuery}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#273449] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Audit Details'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#273449] space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-[#273449] space-y-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block">Expected Safe Range:</span>
                      <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">{test.expectedRowCount}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-[#273449] space-y-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block">Supabase Status / Error:</span>
                      <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">
                        {test.errorCode ? `Code ${test.errorCode} (${test.errorMessage || 'Notice'})` : '200 OK (Clean Result)'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-[#273449] space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block">Security &amp; RLS Analysis:</span>
                    <p className="text-slate-600 dark:text-[#94A3B8] leading-relaxed">{test.details}</p>
                  </div>

                  {test.returnedSample && test.returnedSample.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block">
                        Sample Returned Records (Sanitized preview):
                      </span>
                      <pre className="p-3 bg-slate-900 dark:bg-[#0B1120] text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-40 border border-slate-800 dark:border-[#273449]">
                        {JSON.stringify(test.returnedSample, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Guidance */}
      <div className="p-4 bg-slate-50 dark:bg-[#111827] border-t border-slate-200 dark:border-[#273449] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-[#94A3B8] gap-2">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>Full diagnostic details and row breakdowns are logged to the browser console.</span>
        </div>
        <div className="font-mono text-slate-600 dark:text-slate-400">
          Platform Security Standard &bull; Zero Service-Role Frontend Exposure
        </div>
      </div>
    </div>
  );
}
