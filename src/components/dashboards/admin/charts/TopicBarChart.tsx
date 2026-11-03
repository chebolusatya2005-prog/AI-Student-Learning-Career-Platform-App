/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export interface TopicItem {
  topic: string;
  count: number;
}

interface TopicBarChartProps {
  topics: TopicItem[];
  totalRecords: number;
}

export function TopicBarChart({ topics, totalRecords }: TopicBarChartProps) {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  // Compute maximum count for proportional bar scaling
  const maxCount = Math.max(...topics.map((t) => t.count), 1);
  const total = totalRecords > 0 ? totalRecords : 1;

  // Modern corporate color spectrum for horizontal bars
  const barColors = [
    '#3B82F6', // Blue 500 (Primary)
    '#6366F1', // Indigo 500
    '#8B5CF6', // Purple 500
    '#06B6D4', // Cyan 500
    '#0EA5E9', // Sky 500
    '#64748B', // Slate 500
  ];

  const activeTopicObj = hoveredTopic
    ? topics.find((t) => t.topic === hoveredTopic)
    : null;

  return (
    <div className="w-full space-y-3.5">
      {/* Topics list with proportional horizontal bars */}
      <div className="space-y-3">
        {topics.map((item, index) => {
          const pct = ((item.count / total) * 100).toFixed(1);
          const relativeWidthPct = Math.max(5, (item.count / maxCount) * 100);
          const isHovered = hoveredTopic === item.topic;
          const color = barColors[index % barColors.length];

          return (
            <div
              key={item.topic}
              onMouseEnter={() => setHoveredTopic(item.topic)}
              onMouseLeave={() => setHoveredTopic(null)}
              className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                isHovered
                  ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                  : 'border-transparent hover:border-slate-200 dark:hover:border-[#273449] hover:bg-slate-50/60 dark:hover:bg-[#111827]/40'
              }`}
            >
              {/* Row Header: Rank, Label, Value, Percentage */}
              <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-[#111827] text-slate-500 dark:text-[#94A3B8] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>
                  <span
                    className={`font-semibold truncate transition-colors ${
                      isHovered
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-800 dark:text-[#F8FAFC]'
                    }`}
                  >
                    {item.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-slate-900 dark:text-[#F8FAFC]">
                    {item.count}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    ({pct}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full bg-slate-100 dark:bg-[#111827] h-3 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${relativeWidthPct}%`,
                    backgroundColor: color,
                    filter: isHovered ? 'brightness(1.1)' : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Topic Tooltip / Info Card */}
      {activeTopicObj && (
        <div className="p-3 bg-slate-900/95 dark:bg-[#0B1120]/95 text-white border border-slate-700 dark:border-[#273449] rounded-xl shadow-xl text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div>
            <span className="font-bold">{activeTopicObj.topic}</span>
            <p className="text-[11px] text-slate-300">
              Assigned to {activeTopicObj.count} students across current cohort batches
            </p>
          </div>
          <div className="text-right shrink-0 ml-4 font-mono">
            <span className="font-bold text-blue-400 text-sm">
              {((activeTopicObj.count / total) * 100).toFixed(1)}%
            </span>
            <p className="text-[10px] text-slate-400">of total 500</p>
          </div>
        </div>
      )}
    </div>
  );
}
