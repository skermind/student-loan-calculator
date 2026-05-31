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

  const isWorseScenario =
    isOverpaymentActive && Number.isFinite(totalSaved) && totalSaved < 0;

  return (
    <div className="mb-4 p-3 rounded-lg border border-[#2a2f3d] bg-[#0f1117] text-sm text-[#a9b3c1]">
      <div className="grid grid-cols-3 gap-4">

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

      {isWorseScenario && (
        <div className="mt-3 text-yellow-400 text-xs">
          Overpayment does not improve total cost in this scenario (likely due to write-off rules or timing effects).
        </div>
      )}
    </div>
  );
}