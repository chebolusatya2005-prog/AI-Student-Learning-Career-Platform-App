/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  AlertTriangle,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Sparkles,
  Check,
  Loader2,
  ChevronRight,
  UserCheck,
  Link2,
} from 'lucide-react';
import type { AdminNavTab } from '../AdminDashboard';
import { DonutChart, DonutSegment } from './charts/DonutChart';
import { ColumnChart, ColumnDataPoint } from './charts/ColumnChart';
import { TopicBarChart } from './charts/TopicBarChart';

interface AdminKpiAndChartsProps {
  isLoadingAnalytics: boolean;
  totalLearningRecords: number;
  riskCounts: { High: number; Medium: number; Low: number };
  riskPercentages: {
    highPct: string;
    medPct: string;
    lowPct: string;
    highNum: number;
    medNum: number;
    lowNum: number;
  };
  placementStats: {
    ready: number;
    developing: number;
    readyPct: string;
    readyPctFormatted?: string;
    devPct: string;
    readyNum: number;
    devNum: number;
  };
  averageReadinessScore: number | null;
  avgScoreByRisk: {
    High: string;
    Medium: string;
    Low: string;
    numeric: { High: number; Medium: number; Low: number };
    counts: { High: number; Medium: number; Low: number };
  };
  topicDistribution: Array<{ topic: string; count: number }>;
  isSampleSizeVerified: boolean;
  isPlacementReadyVerified: boolean;
  isHighRiskVerified: boolean;
  isAvgScoreVerified: boolean;
  onNavigateTab: (tab: AdminNavTab) => void;
}

export function AdminKpiAndCharts({
  isLoadingAnalytics,
  totalLearningRecords,
  riskCounts,
  riskPercentages,
  placementStats,
  averageReadinessScore,
  avgScoreByRisk,
  topicDistribution,
  isSampleSizeVerified,
  isPlacementReadyVerified,
  isHighRiskVerified,
  isAvgScoreVerified,
  onNavigateTab,
}: AdminKpiAndChartsProps) {
  const placementRateFormatted =
    placementStats.readyPctFormatted ||
    (totalLearningRecords > 0
      ? ((placementStats.ready / totalLearningRecords) * 100).toFixed(2)
      : '0.00');

  const avgScoreFormatted =
    averageReadinessScore !== null ? averageReadinessScore.toFixed(2) : 'N/A';

  // Chart 1: Donut data for Risk Level Distribution
  const riskDonutData: DonutSegment[] = [
    {
      id: 'high-risk',
      label: 'High Risk',
      value: riskCounts.High,
      color: '#EF4444',
      sublabel: 'Immediate faculty intervention advised',
    },
    {
      id: 'medium-risk',
      label: 'Medium Risk',
      value: riskCounts.Medium,
      color: '#F59E0B',
      sublabel: 'Needs periodic checkpoint monitoring',
    },
    {
      id: 'low-risk',
      label: 'Low Risk',
      value: riskCounts.Low,
      color: '#10B981',
      sublabel: 'On-track with curriculum milestones',
    },
  ];

  // Chart 2: Donut data for Placement Readiness Status
  const placementDonutData: DonutSegment[] = [
    {
      id: 'placement-ready',
      label: 'Placement Ready',
      value: placementStats.ready,
      color: '#10B981',
      sublabel: 'Satisfies benchmark criteria',
    },
    {
      id: 'developing',
      label: 'Developing Skills',
      value: placementStats.developing,
      color: '#64748B',
      sublabel: 'In progress with core curriculum',
    },
  ];

  // Chart 3: Column data for Average Readiness Score by Risk Level
  const readinessColumnData: ColumnDataPoint[] = [
    {
      id: 'low',
      category: 'Low Risk',
      value: avgScoreByRisk.numeric.Low,
      formattedValue: avgScoreByRisk.Low,
      count: avgScoreByRisk.counts.Low,
      color: '#10B981',
      description: 'On-track students scoring highest on average',
    },
    {
      id: 'medium',
      category: 'Medium Risk',
      value: avgScoreByRisk.numeric.Medium,
      formattedValue: avgScoreByRisk.Medium,
      count: avgScoreByRisk.counts.Medium,
      color: '#F59E0B',
      description: 'Moderate progress nearing readiness threshold',
    },
    {
      id: 'high',
      category: 'High Risk',
      value: avgScoreByRisk.numeric.High,
      formattedValue: avgScoreByRisk.High,
      count: avgScoreByRisk.counts.High,
      color: '#EF4444',
      description: 'Students requiring targeted remedial exercises',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Sample Verification Status Banner */}
      <div className="bg-white dark:bg-[#172033] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-2xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
            Sample Verification Status (Batch: <code className="font-mono text-blue-600 dark:text-blue-400">2013J</code> &bull; Course: <code className="font-mono text-blue-600 dark:text-blue-400">Open University - AAA</code>)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border ${
              isSampleSizeVerified
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-[#111827] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#273449]'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Total: {totalLearningRecords} Records</span>
          </span>

          <span
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border ${
              isPlacementReadyVerified
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Placement Ready: {placementStats.ready} / {totalLearningRecords}</span>
          </span>

          <span
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border ${
              isHighRiskVerified
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>High Risk: {riskCounts.High} / {totalLearningRecords}</span>
          </span>

          <span
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border ${
              isAvgScoreVerified
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-[#111827] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#273449]'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Avg Readiness: {avgScoreFormatted}</span>
          </span>
        </div>
      </div>

      {/* 1. Four KPI Cards in One Row on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 — Total Students (Blue icon) */}
        <div className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-2xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/80">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-[#F8FAFC]">
            {isLoadingAnalytics ? '...' : totalLearningRecords}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            Verified cohort in student_learning_data
          </p>
        </div>

        {/* Card 2 — High Risk Students (Red icon) */}
        <div className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-2xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              High Risk Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-800/80">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-950 dark:text-rose-300">
              {isLoadingAnalytics ? '...' : riskCounts.High}
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              ({riskPercentages.highPct}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            Students requiring academic intervention
          </p>
        </div>

        {/* Card 3 — Placement Ready Percentage (Green icon) */}
        <div className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-2xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Placement Ready Percentage
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/80">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-950 dark:text-emerald-300">
              {isLoadingAnalytics ? '...' : `${placementRateFormatted}%`}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ({placementStats.ready} / {totalLearningRecords})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            Verified placement benchmark ready
          </p>
        </div>

        {/* Card 4 — Average Readiness Score (Purple icon) */}
        <div className="bg-white dark:bg-[#172033] p-5 rounded-2xl border border-slate-200 dark:border-[#273449] shadow-2xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              Average Readiness Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800/80">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-950 dark:text-purple-200">
              {isLoadingAnalytics ? '...' : avgScoreFormatted}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
              Scale 0–100
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            Arithmetic mean of valid readiness scores
          </p>
        </div>
      </div>

      {/* 2. Four Analytics Visualizations in Responsive 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visualization 1 — Student Risk Level Distribution */}
        <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Student Risk Level Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Cohort risk assessment segmentation
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
              Database Aggregated
            </span>
          </div>

          {isLoadingAnalytics ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-[#94A3B8] text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Computing risk distribution...</span>
            </div>
          ) : (
            <DonutChart
              data={riskDonutData}
              total={totalLearningRecords}
              centerPrimaryText={String(totalLearningRecords)}
              centerSecondaryText="Total Records"
              size={200}
            />
          )}
        </div>

        {/* Visualization 2 — Placement Readiness Status */}
        <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Placement Readiness Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Career and internship benchmark distribution
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
              Database Evaluated
            </span>
          </div>

          {isLoadingAnalytics ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-[#94A3B8] text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>Computing placement readiness...</span>
            </div>
          ) : (
            <DonutChart
              data={placementDonutData}
              total={totalLearningRecords}
              centerPrimaryText={`${placementRateFormatted}%`}
              centerSecondaryText="Placement Ready"
              size={200}
            />
          )}
        </div>

        {/* Visualization 3 — Average Readiness Score by Risk Level */}
        <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Average Readiness Score by Risk Level
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Mean benchmark score segmented across risk tiers
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
              Database Computed
            </span>
          </div>

          {isLoadingAnalytics ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-[#94A3B8] text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400" />
              <span>Computing risk-segmented scores...</span>
            </div>
          ) : (
            <ColumnChart
              data={readinessColumnData}
              referenceLine={{
                value: averageReadinessScore !== null ? averageReadinessScore : 61.67,
                label: `Cohort Mean: ${avgScoreFormatted}`,
              }}
              yAxisLabel="Average Readiness Score (0–100 Scale)"
            />
          )}
        </div>

        {/* Visualization 4 — Recommended Learning Topics */}
        <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#273449] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Recommended Learning Topics
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Frequency of each recommended topic across cohort
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
              Database Aggregated
            </span>
          </div>

          {isLoadingAnalytics ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-[#94A3B8] text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Computing topic distribution from database...</span>
            </div>
          ) : topicDistribution.length > 0 ? (
            <TopicBarChart
              topics={topicDistribution}
              totalRecords={totalLearningRecords}
            />
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-[#111827] rounded-xl border border-dashed border-slate-300 dark:border-[#273449] space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">
                No Recommended Topics Returned
              </p>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-sm mx-auto">
                Recommended topics column is empty or unpopulated for this batch.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Executive Shortcuts to Other Admin Views */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <button
          onClick={() => onNavigateTab('assignments')}
          className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#172033] hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                Manage Assignments
              </p>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                Pair students with faculty trainers
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('students')}
          className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#172033] hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                View Student Directory
              </p>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                Inspect accounts & institutional IDs
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('trainers')}
          className="p-4 rounded-xl border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#172033] hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">
                Faculty Roster
              </p>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                Mentorship load and specializations
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
        </button>
      </div>
    </div>
  );
}
