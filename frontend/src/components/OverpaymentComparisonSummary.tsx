type LoanYear = {
  Year: number;
  Repayment: number;
};

type Props = {
  baseline: LoanYear[];
  overpayment: LoanYear[];
  isOverpaymentActive: boolean;
};

export default function OverpaymentComparisonSummary({
  baseline,
  overpayment,
  isOverpaymentActive,
}: Props) {
  const baselineTotal = Array.isArray(baseline)
    ? baseline.reduce((sum, row) => sum + (row.Repayment ?? 0), 0)
    : 0;

  const overpaymentTotal = Array.isArray(overpayment)
    ? overpayment.reduce((sum, row) => sum + (row.Repayment ?? 0), 0)
    : 0;

  const baselinePayoffYear = baseline[baseline.length - 1]?.Year;
  const overpaymentPayoffYear = overpayment[overpayment.length - 1]?.Year;

  const yearsDiff =
    baselinePayoffYear != null && overpaymentPayoffYear != null
      ? baselinePayoffYear - overpaymentPayoffYear
      : null;

  const totalSaved = (baselineTotal ?? 0) - (overpaymentTotal ?? 0);

  const baselineTotalPaid = baselineTotal;
  const overpaymentTotalPaid = overpaymentTotal;

  const differenceInCost = baselineTotalPaid - overpaymentTotalPaid;

  const isWorthOverpaying = differenceInCost > 0;

  const isWorseScenario =
    isOverpaymentActive && Number.isFinite(totalSaved) && totalSaved < 0;

  return (
    <div className="mb-4 p-3 rounded-lg border border-[#2a2f3d] bg-[#0f1117] text-sm text-[#a9b3c1]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

        <div>
          <div className="text-xs text-[#6b7280]">Years saved</div>
          <div className="text-white font-semibold">
            {yearsDiff != null ? `${yearsDiff} years` : 'N/A'}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#6b7280]">Total saved</div>
          <div className="text-white font-semibold">
            {Number.isFinite(totalSaved) ? (
              <>
                {totalSaved >= 0 ? '+' : '-'}£{Math.abs(totalSaved).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </>
            ) : (
              'N/A'
            )}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#6b7280]">Payoff comparison</div>
          <div className="text-white font-semibold">
            {baseline.length && overpayment.length
              ? `${baseline[baseline.length - 1]?.Year ?? 'N/A'} → ${overpayment[overpayment.length - 1]?.Year ?? 'N/A'}`
              : 'N/A'}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg border border-[#2a2f3d] bg-[#0b0d12] text-sm">

        <div className="text-xs text-[#6b7280] mb-3">Overpayment comparison</div>

        {/* SIDE BY SIDE COMPARISON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

          {/* BASELINE */}
          <div className="p-3 rounded-lg bg-[#161924] border border-[#2a2f3d]">
            <div className="text-xs text-[#a9b3c1] mb-1">Baseline</div>
            <div className="flex items-center justify-between">
              <span className="text-[#a9b3c1] text-xs">Total Paid</span>
              <span className="text-[#1DB954] font-bold">
                £{baselineTotalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* OVERPAYMENT SCENARIO */}
          <div className="p-3 rounded-lg bg-[#161924] border border-[#2a2f3d]">
            <div className="text-xs text-[#a9b3c1] mb-1">With Overpayments</div>
            <div className="flex items-center justify-between">
              <span className="text-[#a9b3c1] text-xs">Total Paid</span>
              <span className="text-[#4da3ff] font-bold">
                £{overpaymentTotalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

        </div>

        {/* RESULT ROW */}
        <div className="mt-3 p-3 rounded-lg border border-[#2a2f3d] bg-[#0f1117] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-[#a9b3c1] text-xs">Difference</span>
          <span className={isWorthOverpaying ? "text-[#1DB954] font-bold" : "text-[#ff6b6b] font-bold"}>
            {isWorthOverpaying ? '+' : '-'}£{Math.abs(differenceInCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* INSIGHT */}
        <div className="mt-3 text-[#a9b3c1] text-xs">
          {isWorthOverpaying
            ? 'Overpayments reduce total cost in this scenario.'
            : 'Overpayments do not reduce total cost in this scenario.'}
        </div>

      </div>

      {isWorseScenario && (
        <div className="mt-3 text-yellow-400 text-xs">
          Overpayment does not improve total cost in this scenario (likely due to write-off rules or timing effects).
        </div>
      )}
    </div>
  );
}