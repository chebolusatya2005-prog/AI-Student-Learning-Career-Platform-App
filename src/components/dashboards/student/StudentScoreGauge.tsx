/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface StudentScoreGaugeProps {
  score: number | null;
  benchmarkScore?: number; // Application target threshold, default 70
  riskLevel?: 'High' | 'Medium' | 'Low';
  isReady?: boolean;
}

export function StudentScoreGauge({
  score,
  benchmarkScore = 70,
  riskLevel = 'Low',
  isReady = true,
}: StudentScoreGaugeProps) {
  if (score === null || isNaN(score)) {
    return (
      <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-[#111827] rounded-xl border border-dashed border-slate-300 dark:border-[#273449]">
        <p className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">Readiness Score Unavailable</p>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
          No numerical readiness score is recorded for this student ID in the active dataset.
        </p>
      </div>
    );
  }

  // Geometry for circular SVG gauge
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Placement benchmark marker position
  const benchmarkAngle = (benchmarkScore / 100) * 360 - 90; // degrees from 12 o'clock
  const benchmarkRad = (benchmarkAngle * Math.PI) / 180;
  const markerX = size / 2 + radius * Math.cos(benchmarkRad);
  const markerY = size / 2 + radius * Math.sin(benchmarkRad);

  const delta = score - benchmarkScore;
  const isAboveBenchmark = delta >= 0;

  // Theme-aware score color
  const scoreColor =
    clampedScore >= 70
      ? '#10B981' // Emerald
      : clampedScore >= 50
      ? '#F59E0B' // Amber
      : '#EF4444'; // Rose

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
      {/* Circular SVG Gauge Meter */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-slate-100 dark:stroke-[#111827]"
            fill="none"
          />

          {/* Active Score Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={scoreColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />

          {/* Benchmark Target Indicator Dot on Ring */}
          <circle
            cx={markerX}
            cy={markerY}
            r={4.5}
            fill="#8B5CF6"
            className="shadow-sm"
          />
        </svg>

        {/* Center Score Reading */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span
            className="text-3xl font-black font-mono tracking-tight leading-none"
            style={{ color: scoreColor }}
          >
            {score.toFixed(1)}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mt-1">
            out of 100
          </span>
        </div>
      </div>

      {/* Benchmark Target Comparison Breakdown */}
      <div className="flex-1 w-full space-y-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Placement Target Threshold</span>
            <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
              {benchmarkScore}.0 Benchmark
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-[#273449]">
            <span className="text-slate-500 dark:text-[#94A3B8]">Threshold Delta:</span>
            <span
              className={`font-mono font-bold flex items-center gap-1 ${
                isAboveBenchmark ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {isAboveBenchmark ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>+{delta.toFixed(1)} pts (Threshold Met)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{delta.toFixed(1)} pts to Threshold</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Status Verification Row */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#172033] flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Database Status</span>
              <strong className="text-slate-800 dark:text-[#F8FAFC]">
                {isReady ? 'Placement Ready' : 'Developing'}
              </strong>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#172033] flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Database Risk Tier</span>
              <strong className="text-slate-800 dark:text-[#F8FAFC]">
                {riskLevel} Risk
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
