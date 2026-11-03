/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileSpreadsheet,
  Database,
  Award,
  AlertTriangle,
  TrendingUp,
  Users,
} from 'lucide-react';

interface AdminReportsViewProps {
  totalLearningRecords: number;
  riskCounts: { High: number; Medium: number; Low: number };
  riskPercentages: { highPct: string; medPct: string; lowPct: string };
  placementStats: { ready: number; developing: number; readyPct: string; devPct: string };
  averageReadinessScore: number | null;
  topicDistribution: Array<{ topic: string; count: number }>;
}

export function AdminReportsView({
  totalLearningRecords,
  riskCounts,
  riskPercentages,
  placementStats,
  averageReadinessScore,
  topicDistribution,
}: AdminReportsViewProps) {
  return (
    <div className="space-y-6">
      {/* Executive Report Header */}
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-3">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#273449] pb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              Cohort Executive Performance Report
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Automated audit report compiled from live <code className="font-mono text-blue-600 dark:text-blue-400">public.student_learning_data</code> records
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
              Evaluated Students
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">{totalLearningRecords}</p>
            <p className="text-[10px] text-slate-400">100% of batch cohort</p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Placement Benchmark
            </span>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
              {placementStats.readyPct}%
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
              {placementStats.ready} qualified students
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
              High Risk Ratio
            </span>
            <p className="text-2xl font-black text-rose-950 dark:text-rose-300">
              {riskPercentages.highPct}%
            </p>
            <p className="text-[10px] text-rose-600 dark:text-rose-400">
              {riskCounts.High} intervention cases
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">
              Cohort Mean Score
            </span>
            <p className="text-2xl font-black text-purple-950 dark:text-purple-200">
              {averageReadinessScore !== null ? averageReadinessScore.toFixed(2) : 'N/A'}
            </p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400">Scale 0–100</p>
          </div>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Distribution Summary */}
        <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
            Risk Level Distribution Summary
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
              <span className="font-semibold text-rose-800 dark:text-rose-300">High Risk Tier</span>
              <span className="font-mono font-bold text-rose-900 dark:text-rose-200">
                {riskCounts.High} students ({riskPercentages.highPct}%)
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
              <span className="font-semibold text-amber-800 dark:text-amber-300">Medium Risk Tier</span>
              <span className="font-mono font-bold text-amber-900 dark:text-amber-200">
                {riskCounts.Medium} students ({riskPercentages.medPct}%)
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">Low Risk Tier</span>
              <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                {riskCounts.Low} students ({riskPercentages.lowPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Top Topic Interventions */}
        <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
            Primary Recommended Focus Topics
          </h3>
          <div className="space-y-2 text-xs">
            {topicDistribution.slice(0, 5).map((item) => (
              <div
                key={item.topic}
                className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.topic}</span>
                <span className="font-mono text-slate-600 dark:text-[#94A3B8]">
                  {item.count} students (
                  {totalLearningRecords > 0
                    ? Math.round((item.count / totalLearningRecords) * 100)
                    : 0}
                  %)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AdminSettingsViewProps {
  totalLearningRecords: number;
}

export function AdminSettingsView({
  totalLearningRecords,
}: AdminSettingsViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#273449] pb-3">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
              Database Linkage & Isolation Audit
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Schema relations and privacy isolation guard
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827] space-y-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              User ID Mapping State:
            </span>
            <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              All {totalLearningRecords > 0 ? totalLearningRecords : 'cohort'} records in{' '}
              <code className="font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-[#172033] px-1 py-0.5 rounded border border-slate-200 dark:border-[#273449]">
                public.student_learning_data
              </code>{' '}
              currently have <code className="font-mono font-bold">user_id = NULL</code>.
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
              &bull; Privacy Guard Active: Unmapped records are never exposed as personal student records.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827] space-y-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Cohort Academic Scope:
            </span>
            <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] font-mono">
              Batch: 2013J &bull; Course: Open University - AAA
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Evaluated across 500 standardized academic assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
