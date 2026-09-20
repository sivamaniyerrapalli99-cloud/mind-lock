import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface CircularRingProps {
  totalSegments?: number;
  activeSegments?: number; // 0 to 36, or time percentage
  ringStatus: 'idle' | 'success' | 'error' | 'countdown';
  countdownRatio?: number; // 1.0 down to 0.0
  children?: React.ReactNode;
  size?: number; // Diameter in pixels (responsive)
  glowIntensity?: 'low' | 'normal' | 'high';
}

export const CircularRing: React.FC<CircularRingProps> = ({
  totalSegments = 36,
  activeSegments = 36,
  ringStatus = 'idle',
  countdownRatio = 1,
  children,
  size = 320,
  glowIntensity = 'normal',
}) => {
  const center = size / 2;
  const radius = size * 0.43;
  const segmentWidth = Math.max(7, size * 0.026);
  const gapAngleDeg = 2.4; // Degrees of gap between segments

  // Compute segments data
  const segments = useMemo(() => {
    const segs = [];
    const angleStep = 360 / totalSegments;
    const effectiveAngle = angleStep - gapAngleDeg;

    for (let i = 0; i < totalSegments; i++) {
      const startAngle = i * angleStep - 90; // Start at 12 o'clock
      const endAngle = startAngle + effectiveAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      // Arc path
      const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;

      // Determine segment state based on countdown or activeSegments
      const segmentIndexNormalized = i / totalSegments;
      const isSegmentActive = countdownRatio >= (totalSegments - i) / totalSegments || i < activeSegments;

      segs.push({
        id: i,
        pathData,
        isActive: isSegmentActive,
      });
    }
    return segs;
  }, [totalSegments, activeSegments, countdownRatio, center, radius]);

  // Color logic based on ring status
  const glowClass = useMemo(() => {
    if (ringStatus === 'success') return 'filter drop-shadow-[0_0_16px_rgba(0,255,102,0.9)]';
    if (ringStatus === 'error') return 'filter drop-shadow-[0_0_16px_rgba(255,60,60,0.85)]';
    if (glowIntensity === 'high') return 'filter drop-shadow-[0_0_12px_rgba(0,255,102,0.6)]';
    if (glowIntensity === 'low') return 'filter drop-shadow-[0_0_4px_rgba(0,255,102,0.2)]';
    return 'filter drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]';
  }, [ringStatus, glowIntensity]);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Subtle outer rotating decorative ring */}
      <svg
        className={`absolute inset-0 pointer-events-none ${glowClass} transition-all duration-300`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <radialGradient id="ringBgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#041206" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#061c0a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020803" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Center Circular Background */}
        <circle
          cx={center}
          cy={center}
          r={radius - segmentWidth * 1.6}
          fill="url(#ringBgGrad)"
          stroke={ringStatus === 'error' ? '#FF3333' : ringStatus === 'success' ? '#00FF66' : '#0B3312'}
          strokeWidth="1.5"
          className="transition-colors duration-300"
        />

        {/* Inner thin glowing guide ring */}
        <circle
          cx={center}
          cy={center}
          r={radius - segmentWidth * 2.8}
          fill="none"
          stroke={ringStatus === 'error' ? 'rgba(255,50,50,0.3)' : 'rgba(0,255,102,0.25)'}
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* 36 Segmented Arc Blocks */}
        {segments.map((seg) => {
          let strokeColor = '#08210D'; // Inactive dark green
          let strokeWidth = segmentWidth;
          let opacity = 0.35;

          if (seg.isActive) {
            if (ringStatus === 'success') {
              strokeColor = '#55FFAA'; // Super bright green
              opacity = 1;
            } else if (ringStatus === 'error') {
              strokeColor = '#FF4444'; // Error red
              opacity = 0.9;
            } else {
              strokeColor = '#00FF66'; // Neon green
              opacity = 0.95;
            }
          }

          return (
            <path
              key={seg.id}
              d={seg.pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
              className="transition-all duration-150"
            />
          );
        })}
      </svg>

      {/* Center content container */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center p-6 rounded-full"
        style={{ width: (radius - segmentWidth * 2) * 2, height: (radius - segmentWidth * 2) * 2 }}
        animate={
          ringStatus === 'error'
            ? { x: [-8, 8, -6, 6, -3, 3, 0], scale: [0.97, 1.01, 1] }
            : ringStatus === 'success'
            ? { scale: [1, 1.06, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
};
