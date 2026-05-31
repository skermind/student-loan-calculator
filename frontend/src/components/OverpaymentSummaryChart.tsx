'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  summary: {
    PrincipalLoanAmount: number;
    TotalInterest: number;
  };
  results: any[];
  overpaymentResults: any[];
}

export default function OverpaymentSummaryChart({ summary, results, overpaymentResults }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  if (!summary || !results?.length || !overpaymentResults?.length) return null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const baselinePrincipal = summary.PrincipalLoanAmount;
  const baselineInterest = summary.TotalInterest;
  const baselineTotal = baselinePrincipal + baselineInterest;

  const overInterest = overpaymentResults.reduce((a, r) => a + r.Interest, 0);

  const totalOverpayment = overpaymentResults.reduce(
    (a, r) => a + (r.Overpayment || 0),
    0
  );

  const overPrincipal = summary.PrincipalLoanAmount;
  const overTotal = overPrincipal + totalOverpayment + overInterest;

  // 🔥 shared axis (true unified comparison)
  const maxTotal = Math.max(baselineTotal, overTotal);

  const barVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="w-full mt-12 mb-8"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >

      <motion.h2 className="text-2xl font-bold text-[#1DB954] mb-8">
        Loan Comparison Overview
      </motion.h2>

      {/* CHART CARD (single unified system) */}
      <div className="p-4 bg-[#1a1d29] border border-[#2a2f3d] rounded-lg space-y-8">

        {/* BASELINE ROW */}
        <div>
          <p className="text-xs text-[#a9b3c1] mb-2">Standard Loan</p>

          <motion.div
            className="w-full h-12 bg-[#161924] rounded-lg overflow-hidden ring-1 ring-[#2a2f3d] flex"
            variants={barVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ transformOrigin: 'left' }}
          >
            <div
              className="h-full bg-[#1DB954]"
              style={{ width: `${(baselinePrincipal / maxTotal) * 100}%` }}
              onMouseEnter={() => setHovered('baseline-principal')}
              onMouseLeave={() => setHovered(null)}
            />

            <div
              className="h-full bg-[#ff6b6b]"
              style={{ width: `${(baselineInterest / maxTotal) * 100}%` }}
              onMouseEnter={() => setHovered('baseline-interest')}
              onMouseLeave={() => setHovered(null)}
            />
          </motion.div>
        </div>

        {/* OVERPAYMENT ROW */}
        <div>
          <p className="text-xs text-[#a9b3c1] mb-2">With Overpayment</p>

          <motion.div
            className="w-full h-12 bg-[#161924] rounded-lg overflow-hidden ring-1 ring-[#2a2f3d] flex"
            variants={barVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ transformOrigin: 'left' }}
          >
            <div
              className="h-full bg-[#1DB954]"
              style={{ width: `${(overPrincipal / maxTotal) * 100}%` }}
              onMouseEnter={() => setHovered('over-principal')}
              onMouseLeave={() => setHovered(null)}
            />

            <div
              className="h-full bg-[#4da3ff]"
              style={{ width: `${(totalOverpayment / maxTotal) * 100}%` }}
              onMouseEnter={() => setHovered('over-payment')}
              onMouseLeave={() => setHovered(null)}
            />

            <div
              className="h-full bg-[#ff6b6b]"
              style={{ width: `${(overInterest / maxTotal) * 100}%` }}
              onMouseEnter={() => setHovered('over-interest')}
              onMouseLeave={() => setHovered(null)}
            />
          </motion.div>
        </div>

        {/* LEGEND */}
        <div className="flex gap-6 text-xs text-[#a9b3c1] pt-4 border-t border-[#2a2f3d]">
          <span><span className="text-[#1DB954]">■</span> Principal</span>
          <span><span className="text-[#ff6b6b]">■</span> Interest</span>
          <span><span className="text-[#4da3ff]">■</span> Overpayment</span>
        </div>
      </div>

      {/* TOOLTIP */}
      {hovered && (
        <div className="mt-4 text-xs text-[#fcffe9] bg-[#0f111a] border border-[#2a2f3d] p-2 rounded-md inline-block">
          {hovered === 'baseline-principal' && `Principal: £${baselinePrincipal.toLocaleString('en-GB')}`}
          {hovered === 'baseline-interest' && `Interest: £${baselineInterest.toLocaleString('en-GB')}`}
          {hovered === 'over-principal' && `Principal: £${overPrincipal.toLocaleString('en-GB')}`}
          {hovered === 'over-payment' && `Overpayment: £${totalOverpayment.toLocaleString('en-GB')}`}
          {hovered === 'over-interest' && `Interest: £${overInterest.toLocaleString('en-GB')}`}
        </div>
      )}

    </motion.div>
  );
}
