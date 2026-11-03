/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, BookOpen, Dumbbell, Sparkles } from 'lucide-react';

interface StudentTopicFocusChartProps {
  recommendedTopic?: string | null;
  courseName?: string | null;
  batchCode?: string | null;
}

interface Segment {
  id: string;
  name: string;
  percentage: number;
  color: string;
  hoverColor: string;
  icon: React.ReactNode;
  description: string;
}

export function StudentTopicFocusChart({
  recommendedTopic,
  courseName,
  batchCode,
}: StudentTopicFocusChartProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const targetTopic = recommendedTopic || 'Recommended Focus Topic';
  const course = courseName || 'Core Curriculum';

  const segments: Segment[] = [
    {
      id: 'target',
      name: targetTopic,
      percentage: 50,
      color: '#3B82F6', // Blue
      hoverColor: '#2563EB',
      icon: <Target className="w-3.5 h-3.5 text-blue-500" />,
      description: 'Suggested practice allocation for your recommended focus topic (configured guideline)',
    },
    {
      id: 'core',
      name: `${course} Track`,
      percentage: 35,
      color: '#10B981', // Emerald
      hoverColor: '#059669',
      icon: <BookOpen className="w-3.5 h-3.5 text-emerald-500" />,
      description: `Suggested time allocation for core coursework (${batchCode || 'Active Cohort'})`,
    },
    {
      id: 'practice',
      name: 'Practice Challenges',
      percentage: 15,
      color: '#8B5CF6', // Purple
      hoverColor: '#7C3AED',
      icon: <Dumbbell className="w-3.5 h-3.5 text-purple-500" />,
      description: 'Suggested time allocation for hands-on drill exercises and labs',
    },
  ];

  // Donut geometry
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offsets
  let cumulativePercent = 0;
  const renderedSlices = segments.map((seg) => {
    const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += seg.percentage;
    return {
      ...seg,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const highlightedSegment = segments.find((s) => s.id === activeSegment);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
      {/* SVG Donut Chart */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 overflow-visible cursor-pointer"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-slate-100 dark:stroke-[#111827]"
            fill="none"
          />

          {/* Slices */}
          {renderedSlices.map((slice) => {
            const isHovered = activeSegment === slice.id;
            return (
              <circle
                key={slice.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                stroke={isHovered ? slice.hoverColor : slice.color}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                fill="none"
                className="transition-all duration-300 ease-out"
                onMouseEnter={() => setActiveSegment(slice.id)}
                onMouseLeave={() => setActiveSegment(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-4">
          {highlightedSegment ? (
            <>
              <span
                className="text-2xl font-black font-mono tracking-tight leading-none"
                style={{ color: highlightedSegment.color }}
              >
                {highlightedSegment.percentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-1 line-clamp-1 max-w-[100px]">
                {highlightedSegment.name}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-500 mb-1" />
              <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">
                Suggested
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Study Plan
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="flex-1 w-full space-y-2.5">
        {segments.map((seg) => {
          const isSelected = activeSegment === seg.id;
          return (
            <div
              key={seg.id}
              onMouseEnter={() => setActiveSegment(seg.id)}
              onMouseLeave={() => setActiveSegment(null)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm'
                  : 'border-slate-200 dark:border-[#273449] bg-white dark:bg-[#172033] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-[#F8FAFC] truncate">
                    {seg.name}
                  </span>
                </div>
                <span
                  className="font-mono font-bold shrink-0 ml-2 text-xs"
                  style={{ color: seg.color }}
                >
                  {seg.percentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1 pl-4.5 line-clamp-1">
                {seg.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
