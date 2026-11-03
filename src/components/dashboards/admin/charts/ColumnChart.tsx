/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export interface ColumnDataPoint {
  id: string;
  category: string; // e.g. 'Low Risk', 'Medium Risk', 'High Risk'
  value: number; // e.g. 70.7, 61.4, 40.7
  formattedValue: string; // '70.7'
  count: number; // e.g. 248, 147, 105
  color: string; // e.g. '#10B981', '#F59E0B', '#EF4444'
  description?: string;
}

interface ColumnChartProps {
  data: ColumnDataPoint[];
  referenceLine?: {
    value: number;
    label: string; // e.g. 'Cohort Mean: 61.67'
    color?: string;
  };
  yAxisLabel?: string;
  height?: number;
}

export function ColumnChart({
  data,
  referenceLine,
  yAxisLabel = 'Readiness Score (0–100)',
  height = 240,
}: ColumnChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // SVG coordinate system
  const svgWidth = 440;
  const svgHeight = 240;
  const paddingLeft = 44;
  const paddingRight = 85; // space for reference line badge
  const paddingTop = 32;
  const paddingBottom = 48;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const yMax = 100;
  const yMin = 0;
  const yTicks = [0, 25, 50, 75, 100];

  const getYCoord = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    const ratio = (clamped - yMin) / (yMax - yMin);
    return paddingTop + chartHeight * (1 - ratio);
  };

  // 3 columns evenly spaced
  const slotWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(slotWidth * 0.55, 46);

  const activePoint = hoveredId ? data.find((d) => d.id === hoveredId) : null;

  return (
    <div className="w-full space-y-3">
      {/* Top Legend & Metrics Header */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] gap-2">
        <span className="font-semibold">{yAxisLabel}</span>
        {referenceLine && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-purple-600 dark:border-purple-400" />
            <span>{referenceLine.label}</span>
          </div>
        )}
      </div>

      {/* Main SVG Chart with interactive Tooltip */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => {
            setHoveredId(null);
            setTooltipPos(null);
          }}
        >
          {/* Grid lines and Y-axis tick labels */}
          {yTicks.map((tick) => {
            const y = getYCoord(tick);
            return (
              <g key={tick} className="transition-colors">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-200 dark:text-[#273449]"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-medium"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Reference Line for Cohort Mean */}
          {referenceLine && (() => {
            const refY = getYCoord(referenceLine.value);
            return (
              <g key="reference-line" className="transition-all">
                <line
                  x1={paddingLeft}
                  y1={refY}
                  x2={svgWidth - paddingRight + 4}
                  y2={refY}
                  stroke="#8B5CF6"
                  strokeWidth="1.75"
                  strokeDasharray="5 3"
                />
                <rect
                  x={svgWidth - paddingRight + 8}
                  y={refY - 9}
                  width="74"
                  height="18"
                  rx="4"
                  fill="#8B5CF6"
                  className="opacity-95"
                />
                <text
                  x={svgWidth - paddingRight + 45}
                  y={refY + 3.5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  className="text-[9.5px] font-mono font-bold"
                >
                  Mean {referenceLine.value.toFixed(1)}
                </text>
              </g>
            );
          })()}

          {/* Columns */}
          {data.map((item, index) => {
            const slotCenterX = paddingLeft + slotWidth * index + slotWidth / 2;
            const barX = slotCenterX - barWidth / 2;
            const barY = getYCoord(item.value);
            const barH = paddingTop + chartHeight - barY;
            const isHovered = hoveredId === item.id;

            return (
              <g
                key={item.id}
                className="cursor-pointer transition-opacity"
                onMouseEnter={(e) => {
                  setHoveredId(item.id);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Invisible hover capture slot */}
                <rect
                  x={slotCenterX - slotWidth / 2}
                  y={paddingTop}
                  width={slotWidth}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* Column background hover highlight */}
                {isHovered && (
                  <rect
                    x={slotCenterX - slotWidth * 0.45}
                    y={paddingTop}
                    width={slotWidth * 0.9}
                    height={chartHeight}
                    rx="8"
                    className="fill-slate-100/60 dark:fill-[#172033]/80"
                  />
                )}

                {/* Main Column Bar with rounded top */}
                <path
                  d={`
                    M ${barX} ${paddingTop + chartHeight}
                    L ${barX} ${barY + 6}
                    Q ${barX} ${barY} ${barX + 6} ${barY}
                    L ${barX + barWidth - 6} ${barY}
                    Q ${barX + barWidth} ${barY} ${barX + barWidth} ${barY + 6}
                    L ${barX + barWidth} ${paddingTop + chartHeight}
                    Z
                  `}
                  fill={item.color}
                  opacity={hoveredId && !isHovered ? 0.6 : 1}
                  className="transition-all duration-200"
                />

                {/* Value Label above the column */}
                <text
                  x={slotCenterX}
                  y={barY - 8}
                  textAnchor="middle"
                  className="text-xs font-mono font-bold fill-slate-900 dark:fill-[#F8FAFC]"
                >
                  {item.formattedValue}
                </text>

                {/* X-axis Category Label */}
                <text
                  x={slotCenterX}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className={`text-xs font-bold transition-colors ${
                    isHovered
                      ? 'fill-blue-600 dark:fill-blue-400'
                      : 'fill-slate-700 dark:fill-slate-200'
                  }`}
                >
                  {item.category}
                </text>

                {/* Student Count under X-axis Category */}
                <text
                  x={slotCenterX}
                  y={paddingTop + chartHeight + 33}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                >
                  {item.count} students
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {activePoint && (
          <div className="p-3 bg-slate-900/95 dark:bg-[#0B1120]/95 text-white border border-slate-700 dark:border-[#273449] rounded-xl shadow-xl text-xs space-y-1 transition-all mt-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 font-bold">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activePoint.color }}
                />
                <span>{activePoint.category}</span>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: activePoint.color }}>
                {activePoint.formattedValue} / 100
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
              <span>Cohort enrollment:</span>
              <span className="font-mono font-semibold">{activePoint.count} students</span>
            </div>
            {referenceLine && (
              <div className="text-[10px] text-slate-400 pt-0.5 flex items-center justify-between border-t border-slate-800 dark:border-slate-800">
                <span>Vs. Cohort Mean ({referenceLine.value.toFixed(1)}):</span>
                <span
                  className={`font-mono font-bold ${
                    activePoint.value >= referenceLine.value
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {activePoint.value >= referenceLine.value ? '+' : ''}
                  {(activePoint.value - referenceLine.value).toFixed(1)} pts
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
