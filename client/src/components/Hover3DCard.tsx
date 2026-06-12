import { useState, useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface Props {
  children: ReactNode;
  delay?: number;
  color?: string; // Hex color for glow, defaults to teal
}

export default function Hover3DCard({ children, delay = 0, color = '#0891b2' }: Props) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className="relative group h-full"
      style={{ perspective: '800px' }}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? (mousePos.y - 0.5) * -8 : 0,
          rotateY: isHovered ? (mousePos.x - 0.5) * 8 : 0,
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative overflow-hidden bg-white rounded-2xl p-7 md:p-8 border border-gray-100 h-full flex flex-col"
        style={{
          boxShadow: isHovered
            ? `0 20px 40px -12px ${color}22, 0 8px 20px -8px rgba(0,0,0,0.08)`
            : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {/* Hover glow spot */}
        {isHovered && (
          <div
            className="absolute w-40 h-40 rounded-full pointer-events-none opacity-60 blur-3xl transition-all duration-300"
            style={{
              background: `radial-gradient(circle, ${color}20, transparent 70%)`,
              left: `${mousePos.x * 100}%`,
              top: `${mousePos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        <div className="relative z-10 flex-grow">
          {children}
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[3px] rounded-full"
          style={{ background: color }}
          initial={{ width: '0%' }}
          animate={{ width: isHovered ? '100%' : '0%' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
