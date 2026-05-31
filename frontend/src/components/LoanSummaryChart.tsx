'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LoanSummaryProps {
  principal: number;
  interest: number;
}

export default function LoanSummaryChart({ principal, interest }: LoanSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hovered, setHovered] = useState<'principal' | 'interest' | null>(null);
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const total = principal + interest;
  const principalPercent = (principal / total) * 100;
  const data = [
    {
      name: 'Loan',
      principal,
      interest,
    },
  ];

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

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const barVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 2.0,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const markerVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: 1.0,
      },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: 1.1,
      },
    },
  };


  return (
    <motion.div
      ref={containerRef}
      className="w-full mt-12 mb-8"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Title */}
      <motion.h2
        className="text-2xl font-bold text-[#1DB954] mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      >
        Your Loan Breakdown
      </motion.h2>

      {/* Main Bar Chart */}
      <motion.div className="space-y-8">
        {/* Segmented Financial Bar (Apple-style system) */}
        <motion.div
          className="w-full space-y-3"
          variants={barVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{ transformOrigin: 'left' }}
        >
          <div className="relative w-full">
            {/* BAR TRACK */}
            <div className="relative w-full h-12 bg-[#161924] rounded-lg overflow-hidden ring-1 ring-[#2a2f3d]">

              {/* Sweep highlight */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: '-100%' }}
                animate={isInView ? { x: '100%' } : { x: '-100%' }}
                transition={{
                  duration: 1.8,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2,
                }}
                style={{
                  background:
                    'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                }}
              />

              {/* PRINCIPAL SEGMENT */}
              <motion.div
                className="absolute left-0 top-0 h-full bg-[#1DB954]"
                style={{
                  width: `${(principal / total) * 100}%`,
                  opacity: hovered && hovered !== 'principal' ? 0.25 : 1,
                  filter:
                    hovered === 'principal'
                      ? 'drop-shadow(0px 0px 10px rgba(29,185,84,0.5))'
                      : 'none',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={() => {
                  setHovered('principal');
                  setHoverPos(principalPercent / 2);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  setHoverPos(null);
                }}
              />

              {/* INTEREST SEGMENT */}
              <motion.div
                className="absolute top-0 right-0 h-full bg-[#ff6b6b]"
                style={{
                  width: `${(interest / total) * 100}%`,
                  opacity: hovered && hovered !== 'interest' ? 0.25 : 1,
                  filter:
                    hovered === 'interest'
                      ? 'drop-shadow(0px 0px 10px rgba(255,107,107,0.45))'
                      : 'none',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={() => {
                  setHovered('interest');
                  setHoverPos(principalPercent + (100 - principalPercent) / 2);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  setHoverPos(null);
                }}
              />
            </div>

            {hovered && hoverPos !== null && (
              <div
                className="absolute -bottom-5 px-3 py-1  bg-gray-900 rounded-lg text-center text-xs shadow-lg"
                style={{
                  left: `${hoverPos}%`,
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {hovered === 'principal' ? (
                  <span className="text-[#1DB954] font-semibold">
                    Principal: £{principal.toLocaleString('en-GB')}
                  </span>
                ) : (
                  <span className="text-[#ff6b6b] font-semibold">
                    Interest: £{interest.toLocaleString('en-GB')}
                  </span>
                )}
              </div>
            )}

            {/* AXIS */}
            <div className="relative w-full h-6">
              <div className="absolute left-0 text-xs text-[#a9b3c1]">
                £0
              </div>

              <div
                className="absolute text-xs text-[#1DB954]"
                style={{
                  left: `${(principal / total) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                £{principal.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
              </div>

              <div className="absolute right-0 text-xs text-[#fcffe9]">
                £{total.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          className="flex gap-8 mt-10 pt-6 border-t border-[#2a2f3d]"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#1DB954] rounded" />
            <div>
              <p className="text-[#a9b3c1] text-xs">Principal Loan</p>
              <motion.p className="text-[#1DB954] font-bold text-lg" variants={numberVariants}>
                £{principal.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#ff6b6b] rounded" />
            <div>
              <p className="text-[#a9b3c1] text-xs">Interest Cost</p>
              <motion.p className="text-[#ff6b6b] font-bold text-lg" variants={numberVariants}>
                £{interest.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="w-6 h-6 bg-[#fcffe9] border border-[#2a2f3d] rounded" />
            <div>
              <p className="text-[#a9b3c1] text-xs">Total to Pay</p>
              <motion.p className="text-[#fcffe9] font-bold text-lg" variants={numberVariants}>
                £{total.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Insight Text */}
        <motion.p
          className="text-[#a9b3c1] text-sm italic"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {(interest / principal) > 0.5
            ? `You'll pay £${interest.toLocaleString('en-GB', { maximumFractionDigits: 0 })} in interest — ${((interest / principal) * 100).toFixed(0)}% of your initial loan amount.`
            : `Your interest costs are relatively low at £${interest.toLocaleString('en-GB', { maximumFractionDigits: 0 })}.`}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
