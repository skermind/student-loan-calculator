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
  const [hoverPos, setHoverPos] = useState<number | null>(null);

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

  const totalOverpayment = overpaymentResults.reduce((a, r) => {
    const value = Object.entries(r).find(([key]) =>
      key.toLowerCase().includes('overpayment')
    );

    return a + Number(value?.[1] ?? 0);
  }, 0);

  const overPrincipal = summary.PrincipalLoanAmount;
  const overTotal = overPrincipal + totalOverpayment + overInterest;

  console.log('OverpaymentSummaryChart', {
    overPrincipal,
    totalOverpayment,
    overInterest,
    overTotal
  });

  console.log('First overpayment row', overpaymentResults[0]);

  if (overpaymentResults.length > 0) {
    console.log('Available keys', Object.keys(overpaymentResults[0]));
  }

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

      {/* Main Bar Chart */}
      <motion.div className="space-y-8">

        {/* BASELINE BAR */}
        <motion.div
          className="w-full space-y-3"
          variants={barVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{ transformOrigin: 'left' }}
        >
          <div className="relative w-full">

            <div className="relative w-full h-12 bg-[#161924] rounded-lg overflow-hidden ring-1 ring-[#2a2f3d]">

              {/* PRINCIPAL */}
              <motion.div
                className="absolute left-0 top-0 h-full bg-[#1DB954]"
                style={{ width: `${(baselinePrincipal / baselineTotal) * 100}%` }}
                onMouseEnter={() => {
                  setHovered('baseline-principal');
                  setHoverPos((baselinePrincipal / 2 / maxTotal) * 100);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  setHoverPos(null);
                }}
              />

              {/* INTEREST */}
              <motion.div
                className="absolute top-0 right-0 h-full bg-[#ff6b6b]"
                style={{ width: `${(baselineInterest / baselineTotal) * 100}%` }}
                onMouseEnter={() => {
                  setHovered('baseline-interest');
                  setHoverPos((baselinePrincipal + baselineInterest / 2) / maxTotal * 100);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  setHoverPos(null);
                }}
              />

            </div>
          </div>
        </motion.div>

        {/* OVERPAYMENT BAR */}
        <div>
          <p className="text-xs text-[#a9b3c1] mb-2">With Overpayment</p>

          <motion.div
            className="relative w-full h-12 bg-[#161924] rounded-lg overflow-hidden ring-1 ring-[#2a2f3d] flex"
            variants={barVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            style={{ transformOrigin: 'left' }}
          >
            <div
              className="h-full bg-[#1DB954]"
              style={{ width: `${(overPrincipal / maxTotal) * 100}%` }}
              onMouseEnter={() => {
                setHovered('over-principal');
                setHoverPos((overPrincipal / 2 / maxTotal) * 100);
              }}
              onMouseLeave={() => {
                setHovered(null);
                setHoverPos(null);
              }}
            />

            <div
              className="h-full bg-[#4da3ff]"
              style={{ width: `${(totalOverpayment / maxTotal) * 100}%` }}
              onMouseEnter={() => {
                setHovered('over-payment');
                setHoverPos(((overPrincipal + totalOverpayment / 2) / maxTotal) * 100);
              }}
              onMouseLeave={() => {
                setHovered(null);
                setHoverPos(null);
              }}
            />

            <div
              className="h-full bg-[#ff6b6b]"
              style={{ width: `${(overInterest / maxTotal) * 100}%` }}
              onMouseEnter={() => {
                setHovered('over-interest');
                setHoverPos(((overPrincipal + totalOverpayment + overInterest / 2) / maxTotal) * 100);
              }}
              onMouseLeave={() => {
                setHovered(null);
                setHoverPos(null);
              }}
            />
          </motion.div>
        </div>

        {/* LEGEND */}
        <div className="flex gap-6 text-xs text-[#a9b3c1] pt-4 border-t border-[#2a2f3d]">
          <span><span className="text-[#1DB954]">■</span> Principal</span>
          <span><span className="text-[#ff6b6b]">■</span> Interest</span>
          <span><span className="text-[#4da3ff]">■</span> Overpayment</span>
        </div>

      </motion.div>

      </div>

      {/* TOOLTIP */}
      {hovered && hoverPos !== null && (
        <div
          className="absolute -bottom-5 px-3 py-1 bg-gray-900 rounded-lg text-center text-xs shadow-lg"
          style={{
            left: `${hoverPos}%`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {hovered === 'baseline-principal' && (
            <span className="text-[#1DB954] font-semibold">
              Principal: £{baselinePrincipal.toLocaleString('en-GB')}
            </span>
          )}

          {hovered === 'baseline-interest' && (
            <span className="text-[#ff6b6b] font-semibold">
              Interest: £{baselineInterest.toLocaleString('en-GB')}
            </span>
          )}

          {hovered === 'over-principal' && (
            <span className="text-[#1DB954] font-semibold">
              Principal: £{overPrincipal.toLocaleString('en-GB')}
            </span>
          )}

          {hovered === 'over-payment' && (
            <span className="text-[#4da3ff] font-semibold">
              Overpayment: £{totalOverpayment.toLocaleString('en-GB')}
            </span>
          )}

          {hovered === 'over-interest' && (
            <span className="text-[#ff6b6b] font-semibold">
              Interest: £{overInterest.toLocaleString('en-GB')}
            </span>
          )}
        </div>
      )}

    </motion.div>
  );
}
