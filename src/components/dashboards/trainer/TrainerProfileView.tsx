/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, ShieldCheck, Users, BookOpen, Award, Mail, Lock } from 'lucide-react';
import { TrainerProfileRecord, AssignedCourseRecord } from '../TrainerDashboard';

interface TrainerProfileViewProps {
  trainerName: string;
  trainerEmail?: string;
  trainerUserId?: string;
  trainerDetails?: TrainerProfileRecord | null;
  assignedCourses?: AssignedCourseRecord[];
  assignedCount: number;
}

export function TrainerProfileView({
  trainerName,
  trainerEmail,
  trainerUserId,
  trainerDetails,
  assignedCourses = [],
  assignedCount,
}: TrainerProfileViewProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-[#273449] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl font-black uppercase shadow-lg shadow-purple-900/30">
            {trainerName[0] || 'T'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{trainerName}</h2>
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                Verified Faculty Trainer
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono">{trainerEmail}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trainer User ID</span>
            <p className="font-mono text-slate-900 dark:text-[#F8FAFC] truncate">{trainerUserId}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialization</span>
            <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">
              {trainerDetails?.specialization || 'Software Engineering & Applied AI'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</span>
            <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">
              {trainerDetails?.experience_years ? `${trainerDetails.experience_years} Years` : '5+ Years Industry Experience'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Cohort Mentees</span>
            <p className="font-bold text-purple-600 dark:text-purple-400">{assignedCount} Assigned Students</p>
          </div>
        </div>

        {assignedCourses.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Assigned Curriculum Tracks</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {assignedCourses.map((c, i) => (
                <div key={c.id || i} className="p-3 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827] text-xs">
                  <p className="font-bold text-slate-900 dark:text-[#F8FAFC]">{c.title || 'Course Module'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">{c.description || 'Assigned track'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
