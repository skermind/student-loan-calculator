'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface LoanSummaryProps {
  principal: number;
  interest: number;
}

export default function LoanSummaryChart({ principal, interest }: LoanSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hovered, setHovered] = useState<'principal' | 'interest' | null>(null);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const item = payload[0];
    const key = item?.dataKey;
    const value = item?.value;

    if (key === 'principal') {
      return (
        <div className="bg-[#0f1117] border border-[#2a2f3d] rounded-lg px-3 py-2 shadow-lg">
          <p className="text-[#1DB954] text-xs font-semibold">
            Principal: £{value?.toLocaleString('en-GB')}
          </p>
        </div>
      );
    }

    if (key === 'interest') {
      return (
        <div className="bg-[#0f1117] border border-[#2a2f3d] rounded-lg px-3 py-2 shadow-lg">
          <p className="text-[#ff6b6b] text-xs font-semibold">
            Interest: £{value?.toLocaleString('en-GB')}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      ref={containerRef}
      className="w-full mt-12 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {/* Title */}
      <motion.h2 className="text-2xl font-bold text-[#1DB954] mb-8" variants={itemVariants}>
        Your Loan Breakdown
      </motion.h2>

      {/* Main Bar Chart */}
      <motion.div className="space-y-8" variants={itemVariants}>
        {/* Recharts Chart */}
        <motion.div
          className="w-full h-24 overflow-visible"
          variants={barVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{ transformOrigin: 'left' }}
        >
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

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              onMouseMove={(state: any) => {
                if (!state?.activePayload?.length) return;

                const key = state.activePayload[0]?.dataKey;

                if (key === 'principal' || key === 'interest') {
                  setHovered(key);
                }
              }}
              onMouseLeave={() => setHovered(null)}
            >
              <XAxis
                type="number"
                domain={[0, total]}
                ticks={[0, principal, total]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#a9b3c1',
                  fontSize: 12,
                }}
                tickFormatter={(value) =>
                  `£${Number(value).toLocaleString('en-GB', {
                    maximumFractionDigits: 0,
                  })}`
                }
              />

              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#a9b3c1',
                  fontSize: 12,
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'transparent' }}
              />

              <Bar
                dataKey="principal"
                stackId="a"
                fill="#1DB954"
                fillOpacity={hovered && hovered !== 'principal' ? 0.25 : 1}
                style={{
                  filter:
                    hovered === 'principal'
                      ? 'drop-shadow(0px 0px 8px rgba(29,185,84,0.45))'
                      : 'none',
                }}
                radius={[6, 0, 0, 6]}
                isAnimationActive={isInView}
                animationDuration={1800}
              />

              <Bar
                dataKey="interest"
                stackId="a"
                fill="#ff6b6b"
                fillOpacity={hovered && hovered !== 'interest' ? 0.25 : 1}
                style={{
                  filter:
                    hovered === 'interest'
                      ? 'drop-shadow(0px 0px 8px rgba(255,107,107,0.35))'
                      : 'none',
                }}
                radius={[0, 6, 6, 0]}
                isAnimationActive={isInView}
                animationDuration={1800}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend */}
        <motion.div className="flex gap-8 mt-10 pt-6 border-t border-[#2a2f3d]" variants={itemVariants}>
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
        <motion.p className="text-[#a9b3c1] text-sm italic" variants={itemVariants}>
          {(interest / principal) > 0.5
            ? `You'll pay £${interest.toLocaleString('en-GB', { maximumFractionDigits: 0 })} in interest — ${((interest / principal) * 100).toFixed(0)}% of your initial loan amount.`
            : `Your interest costs are relatively low at £${interest.toLocaleString('en-GB', { maximumFractionDigits: 0 })}.`}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
