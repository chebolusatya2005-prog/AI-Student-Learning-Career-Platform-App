/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  GraduationCap,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { AssignedStudent } from '../TrainerDashboard';

interface TrainerStudentsViewProps {
  assignedStudents: AssignedStudent[];
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  trainerUserId?: string;
}

export function TrainerStudentsView({
  assignedStudents,
  isLoading,
  onRefresh,
  isRefreshing,
  trainerUserId,
}: TrainerStudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [placementFilter, setPlacementFilter] = useState<'all' | 'ready' | 'developing'>('all');

  const filteredStudents = useMemo(() => {
    return assignedStudents.filter((st) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        st.fullName.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q) ||
        String(st.studentId || '').includes(q) ||
        st.course.toLowerCase().includes(q) ||
        st.batch.toLowerCase().includes(q);

      const matchesRisk =
        riskFilter === 'all' || st.riskLevel.toLowerCase() === riskFilter.toLowerCase();

      const matchesPlacement =
        placementFilter === 'all' ||
        (placementFilter === 'ready' && st.placementReady) ||
        (placementFilter === 'developing' && !st.placementReady);

      return matchesSearch && matchesRisk && matchesPlacement;
    });
  }, [assignedStudents, searchQuery, riskFilter, placementFilter]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#273449] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Assigned Student Roster</h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Authorized students linked to trainer UUID (<code className="font-mono text-purple-600 dark:text-purple-400">{trainerUserId?.slice(0, 8)}...</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#273449] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-600 dark:text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Roster'}</span>
            </button>
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
              {assignedStudents.length} Total Assigned
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID, email, course, or batch..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#111827] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors"
            />
          </div>

          {/* Risk Level Segment */}
          <div className="sm:col-span-3 flex items-center gap-1.5 bg-slate-100 dark:bg-[#111827] p-1 rounded-xl text-xs border border-transparent dark:border-[#273449]">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Risk:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                  riskFilter === r
                    ? 'bg-white dark:bg-[#172033] text-purple-900 dark:text-purple-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Placement Readiness Segment */}
          <div className="sm:col-span-3 flex items-center gap-1.5 bg-slate-100 dark:bg-[#111827] p-1 rounded-xl text-xs border border-transparent dark:border-[#273449]">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Status:</span>
            {(['all', 'ready', 'developing'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlacementFilter(p)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                  placementFilter === p
                    ? 'bg-white dark:bg-[#172033] text-purple-900 dark:text-purple-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Student Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#273449]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#111827] text-slate-600 dark:text-[#94A3B8] font-semibold border-b border-slate-200 dark:border-[#273449]">
              <tr>
                <th className="py-3 px-4">Student & Profile</th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Course / Batch</th>
                <th className="py-3 px-3">Goals & Focus</th>
                <th className="py-3 px-3">Risk Tier</th>
                <th className="py-3 px-3">Readiness</th>
                <th className="py-3 px-3">Placement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#273449]/60 bg-white dark:bg-[#172033]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No assigned students match your filter search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.assignmentId} className="hover:bg-slate-50/80 dark:hover:bg-[#1E293B]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold flex items-center justify-center text-xs shrink-0 uppercase border border-purple-200 dark:border-purple-800">
                          {st.fullName[0] || 'S'}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-[#F8FAFC] leading-tight">{st.fullName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate max-w-[160px]">{st.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-[#F8FAFC]">
                      {st.studentId !== null ? String(st.studentId) : 'Unmapped'}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{st.course}</p>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-[#94A3B8] bg-slate-100 dark:bg-[#111827] px-1.5 py-0.5 rounded">
                        {st.batch}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {st.recommendedTopic ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800 truncate max-w-[160px]">
                          <Sparkles className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                          <span className="truncate">{st.recommendedTopic}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Core Practice</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          st.riskLevel === 'High'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : st.riskLevel === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {st.riskLevel}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">
                      {st.readinessScore !== null ? `${st.readinessScore}%` : 'N/A'}
                    </td>

                    <td className="py-3 px-3">
                      {st.placementReady ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 dark:text-[#94A3B8] bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Developing</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
