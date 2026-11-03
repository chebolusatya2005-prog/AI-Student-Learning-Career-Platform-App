/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, ShieldAlert, Sparkles, UserCheck, BookOpen, Clock } from 'lucide-react';
import { AssignedStudent } from '../TrainerDashboard';

interface TrainerRiskViewProps {
  assignedStudents: AssignedStudent[];
}

export function TrainerRiskView({ assignedStudents }: TrainerRiskViewProps) {
  const atRiskStudents = assignedStudents.filter(
    (s) => s.riskLevel === 'High' || s.riskLevel === 'Medium'
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Risk Monitoring & Intervention Roster</h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Mentees in High and Medium risk categories requiring targeted academic coaching
              </p>
            </div>
          </div>

          <span className="text-xs font-bold font-mono text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-800">
            {atRiskStudents.length} At-Risk Mentees
          </span>
        </div>

        {atRiskStudents.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-[#111827] rounded-xl border border-dashed border-slate-300 dark:border-[#273449] space-y-2">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Great Job! Zero At-Risk Students</p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              All assigned mentees are currently categorized as Low Risk.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#273449]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#111827] text-slate-600 dark:text-[#94A3B8] font-semibold border-b border-slate-200 dark:border-[#273449]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Student ID</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Readiness Score</th>
                  <th className="py-3 px-3">Recommended Focus Topic</th>
                  <th className="py-3 px-3">Action Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#273449]/60 bg-white dark:bg-[#172033]">
                {atRiskStudents.map((st) => (
                  <tr key={st.assignmentId} className="hover:bg-slate-50/80 dark:hover:bg-[#1E293B]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-[#F8FAFC]">
                      {st.fullName}
                      <p className="text-[11px] font-normal text-slate-500">{st.email}</p>
                    </td>
                    <td className="py-3 px-3 font-mono">{st.studentId ?? 'N/A'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          st.riskLevel === 'High'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {st.riskLevel} Risk
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold font-mono">{st.readinessScore !== null ? `${st.readinessScore}%` : 'N/A'}</td>
                    <td className="py-3 px-3 text-purple-700 dark:text-purple-300 font-medium">
                      {st.recommendedTopic || 'General Problem Sets'}
                    </td>
                    <td className="py-3 px-3">
                      <button className="px-2.5 py-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-100 transition-colors cursor-pointer">
                        Schedule Coaching
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
