import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * PageTransition — Wraps page content with a smooth fade+slide transition.
 * Eliminates the "blink" feeling when navigating between pages.
 */

interface Props {
  children: ReactNode;
}

export default function PageTransition({ children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
