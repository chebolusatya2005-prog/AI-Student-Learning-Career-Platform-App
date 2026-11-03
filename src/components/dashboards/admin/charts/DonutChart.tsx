/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string; // e.g. '#EF4444'
  hoverColor?: string;
  sublabel?: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  total?: number;
  centerPrimaryText: string;
  centerSecondaryText: string;
  title?: string;
  size?: number;
  valueSuffix?: string;
  showLegend?: boolean;
}

export function DonutChart({
  data,
  total: explicitTotal,
  centerPrimaryText,
  centerSecondaryText,
  size = 200,
  valueSuffix = '',
  showLegend = true,
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const clipId = useId();

  const totalValue =
    explicitTotal !== undefined
      ? explicitTotal
      : data.reduce((sum, item) => sum + item.value, 0);

  // SVG dimensions & radii
  const viewBoxSize = 220;
  const center = viewBoxSize / 2;
  const outerRadius = 86;
  const innerRadius = 56;
  const padAngle = data.length > 1 ? 0.025 : 0; // slight gap in radians

  // Calculate arc paths
  let accumulatedAngle = -Math.PI / 2; // start at 12 o'clock
  const segments = data.map((item, index) => {
    const fraction = totalValue > 0 ? item.value / totalValue : 0;
    const angleSpan = fraction * 2 * Math.PI;

    const startAngle = accumulatedAngle + padAngle / 2;
    const endAngle = accumulatedAngle + angleSpan - padAngle / 2;
    accumulatedAngle += angleSpan;

    const isHovered = hoveredIndex === index;
    // Slight offset for active segment
    const rOuter = isHovered ? outerRadius + 4 : outerRadius;
    const rInner = isHovered ? innerRadius - 2 : innerRadius;

    // Center angle for radial translation if hovered
    const midAngle = (startAngle + endAngle) / 2;
    const shiftDistance = isHovered ? 3 : 0;
    const shiftX = Math.cos(midAngle) * shiftDistance;
    const shiftY = Math.sin(midAngle) * shiftDistance;

    const x1 = center + shiftX + rOuter * Math.cos(startAngle);
    const y1 = center + shiftY + rOuter * Math.sin(startAngle);
    const x2 = center + shiftX + rOuter * Math.cos(endAngle);
    const y2 = center + shiftY + rOuter * Math.sin(endAngle);
    const x3 = center + shiftX + rInner * Math.cos(endAngle);
    const y3 = center + shiftY + rInner * Math.sin(endAngle);
    const x4 = center + shiftX + rInner * Math.cos(startAngle);
    const y4 = center + shiftY + rInner * Math.sin(startAngle);

    const largeArcFlag = angleSpan > Math.PI ? 1 : 0;

    let pathD = '';
    if (fraction >= 0.999) {
      // Full circle donut
      pathD = `
        M ${center} ${center - rOuter}
        A ${rOuter} ${rOuter} 0 1 1 ${center} ${center + rOuter}
        A ${rOuter} ${rOuter} 0 1 1 ${center} ${center - rOuter}
        M ${center} ${center - rInner}
        A ${rInner} ${rInner} 0 1 0 ${center} ${center + rInner}
        A ${rInner} ${rInner} 0 1 0 ${center} ${center - rInner}
        Z
      `;
    } else if (fraction > 0) {
      pathD = `
        M ${x1} ${y1}
        A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
      `;
    }

    const pct = totalValue > 0 ? (fraction * 100).toFixed(1) : '0.0';

    return {
      ...item,
      fraction,
      pct,
      pathD,
      isHovered,
    };
  });

  const activeSegment = hoveredIndex !== null ? segments[hoveredIndex] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
      {/* Donut graphic container */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="overflow-visible"
          onMouseLeave={() => {
            setHoveredIndex(null);
            setTooltipPos(null);
          }}
        >
          <defs>
            <filter id={`shadow-${clipId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Empty background track */}
          <circle
            cx={center}
            cy={center}
            r={(outerRadius + innerRadius) / 2}
            strokeWidth={outerRadius - innerRadius}
            fill="none"
            className="stroke-slate-100 dark:stroke-[#111827]"
          />

          {/* Segments */}
          {segments.map((seg, index) => {
            if (!seg.pathD) return null;
            return (
              <path
                key={seg.id}
                d={seg.pathD}
                fill={seg.color}
                filter={seg.isHovered ? `url(#shadow-${clipId})` : undefined}
                className="transition-all duration-200 cursor-pointer hover:opacity-95"
                onMouseEnter={(e) => {
                  setHoveredIndex(index);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (rect) {
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Center Text (Always readable in light and dark mode) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeSegment ? (
            <>
              <span
                className="text-2xl font-black font-mono tracking-tight leading-none transition-all duration-150"
                style={{ color: activeSegment.color }}
              >
                {activeSegment.value}
                {valueSuffix}
              </span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-[#F8FAFC] mt-1 leading-tight line-clamp-1">
                {activeSegment.label}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono">
                {activeSegment.pct}%
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] font-mono tracking-tight leading-none">
                {centerPrimaryText}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mt-1 max-w-[100px] leading-tight">
                {centerSecondaryText}
              </span>
            </>
          )}
        </div>

        {/* Hover Tooltip Floating Tag */}
        {activeSegment && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 px-2.5 py-1.5 rounded-lg shadow-lg text-xs border whitespace-nowrap bg-slate-900/95 dark:bg-[#0B1120]/95 text-white border-slate-700 dark:border-[#273449] backdrop-blur-xs"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 10}px`,
            }}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeSegment.color }}
              />
              <span>{activeSegment.label}:</span>
              <span className="font-mono font-bold">{activeSegment.value}</span>
              <span className="text-slate-400 font-mono">({activeSegment.pct}%)</span>
            </div>
            {activeSegment.sublabel && (
              <p className="text-[10px] text-slate-300 mt-0.5">{activeSegment.sublabel}</p>
            )}
          </div>
        )}
      </div>

      {/* Legend & Breakdown Column */}
      {showLegend && (
        <div className="flex-1 w-full space-y-2.5">
          {segments.map((seg, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={seg.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between ${
                  isHovered
                    ? 'border-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 shadow-xs'
                    : 'border-slate-200/80 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827]/60 hover:bg-slate-100/60 dark:hover:bg-[#1E293B]/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: seg.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                      {seg.label}
                    </p>
                    {seg.sublabel && (
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
                        {seg.sublabel}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC]">
                    {seg.value}
                    <span className="text-[11px] font-normal text-slate-500 dark:text-[#94A3B8] ml-1">
                      students
                    </span>
                  </div>
                  <div
                    className="text-[11px] font-mono font-semibold"
                    style={{ color: seg.color }}
                  >
                    {seg.pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
