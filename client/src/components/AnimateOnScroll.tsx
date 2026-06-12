import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * AnimateOnScroll — Reusable wrapper that animates children into view on scroll.
 *
 * Variants:
 *  • fadeUp   — fade in + slide up (default)
 *  • fadeDown — fade in + slide down
 *  • fadeLeft — fade in + slide from left
 *  • fadeRight — fade in + slide from right
 *  • scale   — fade in + scale up
 *  • float   — gentle floating entrance
 */

type AnimationVariant = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'float';

interface Props {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const variants: Record<AnimationVariant, { initial: object; animate: object }> = {
  fadeUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  },
  fadeDown: {
    initial: { opacity: 0, y: -40 },
    animate: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
  },
  fadeRight: {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
  },
  float: {
    initial: { opacity: 0, y: 30, rotate: -1 },
    animate: { opacity: 1, y: 0, rotate: 0 },
  },
};

export default function AnimateOnScroll({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-60px' });
  const v = variants[variant];

  return (
    <motion.div
      ref={ref}
      initial={v.initial}
      animate={isInView ? v.animate : v.initial}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
