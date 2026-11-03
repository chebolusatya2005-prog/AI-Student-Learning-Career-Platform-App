/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, Award, CheckCircle2, Clock, BookOpen, Target, Sparkles } from 'lucide-react';
import { AssignedStudent } from '../TrainerDashboard';

interface TrainerProgressViewProps {
  assignedStudents: AssignedStudent[];
}

export function TrainerProgressView({ assignedStudents }: TrainerProgressViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#273449] pb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Mentee Progress & Milestone Velocity</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Track individual coursework milestones, practice challenge completion, and score trends
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {assignedStudents.map((st) => (
            <div
              key={st.assignmentId}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-[#273449] pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">{st.fullName}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-mono">
                    ID: {st.studentId ?? 'N/A'} · {st.course}
                  </p>
                </div>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                  {st.readinessScore !== null ? `${st.readinessScore}%` : 'N/A'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-[#94A3B8]">
                  <span>Curriculum Mastery Progress</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {st.readinessScore !== null ? `${Math.min(100, Math.round(st.readinessScore * 1.1))}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#172033] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${st.readinessScore || 0}%` }}
                  />
                </div>
              </div>

              {st.recommendedTopic && (
                <div className="text-[11px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded border border-purple-100 dark:border-purple-800 flex items-center justify-between">
                  <span className="font-semibold">Active Focus: {st.recommendedTopic}</span>
                  <Sparkles className="w-3 h-3 text-purple-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
