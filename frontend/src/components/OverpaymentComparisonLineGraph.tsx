'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

type LoanYear = {
  Year: number;
  Interest: number;
  Repayment: number;
};

type Props = {
  baseline: LoanYear[];
  overpayment: LoanYear[];
};

export default function OverpaymentComparisonLineGraph({
  baseline,
  overpayment,
}: Props) {
  const baselinePayoffYear = baseline.length
    ? baseline[baseline.length - 1].Year
    : undefined;

  const overpaymentPayoffYear = overpayment.length
    ? overpayment[overpayment.length - 1].Year
    : undefined;

  const showOverpaymentLine = overpayment.some(
    (row, index) => row.Repayment !== baseline[index]?.Repayment
  );

  const data = useMemo(() => {
    let baselineCum = 0;
    let overpaymentCum = 0;

    const maxLen = Math.max(baseline.length, overpayment.length);

    return Array.from({ length: maxLen }, (_, i) => {
      baselineCum += baseline[i]?.Repayment ?? 0;
      overpaymentCum += overpayment[i]?.Repayment ?? 0;

      return {
        Year: baseline[i]?.Year ?? overpayment[i]?.Year ?? i + 1,
        baselineRepayment: baselineCum,
        overpaymentRepayment: overpaymentCum,
      };
    });
  }, [baseline, overpayment]);

  return (
    <div className="w-full h-[400px] bg-[#0f1117] p-4 rounded-lg border border-[#2a2f3d]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="Year"
            stroke="#a9b3c1"
             interval={1}
             ticks={data.map(d => d.Year)}
          />
          <YAxis
            stroke="#a9b3c1"
            tickFormatter={(v) => `£${v.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => `£${value.toLocaleString()}`}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{
              backgroundColor: '#1a1d29',
              border: '1px solid #2a2f3d',
              color: '#fff',
            }}
          />
          <Legend />

          {baselinePayoffYear && (
            <ReferenceLine
              x={baselinePayoffYear}
              stroke="#6b7280"
              strokeDasharray="3 3"
            />
          )}

          {showOverpaymentLine && overpaymentPayoffYear && (
            <ReferenceLine
              x={overpaymentPayoffYear}
              stroke="#1DB954"
              strokeDasharray="3 3"
            />
          )}

          {/* Baseline */}
          <Line
            type="monotone"
            dataKey="baselineRepayment"
            name="Total paid (standard)"
            stroke="#6b7280"
            strokeWidth={2}
            strokeDasharray="6 6"
            dot={false}
          />

          {/* Overpayment */}
          <Line
            type="monotone"
            dataKey="overpaymentRepayment"
            name="Total paid (with overpayment)"
            stroke="#1DB954"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}