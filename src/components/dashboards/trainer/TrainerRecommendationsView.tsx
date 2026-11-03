/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Target, BookOpen, Clock, Award } from 'lucide-react';
import { AssignedStudent } from '../TrainerDashboard';

interface TrainerRecommendationsViewProps {
  assignedStudents: AssignedStudent[];
}

export function TrainerRecommendationsView({ assignedStudents }: TrainerRecommendationsViewProps) {
  const topicMap: Record<string, { count: number; students: string[] }> = {};

  for (const st of assignedStudents) {
    const topic = st.recommendedTopic || 'Data Structures & Logic';
    if (!topicMap[topic]) {
      topicMap[topic] = { count: 0, students: [] };
    }
    topicMap[topic].count += 1;
    topicMap[topic].students.push(st.fullName);
  }

  const topicList = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    count: data.count,
    students: data.students,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#273449] pb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Curated Focus Topics & Skill Matrix</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              High-impact learning recommendations tailored to your assigned student cohort
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {topicList.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-100 dark:border-purple-800">
                  Topic 0{idx + 1}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {item.count} Mentees Focus
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">{item.topic}</h3>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned Mentees:</span>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed truncate">
                  {item.students.join(', ')}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-[#273449] flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-semibold">
                <span>Suggested practice: 5 hrs/week</span>
                <span>Assign Problem Set &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
