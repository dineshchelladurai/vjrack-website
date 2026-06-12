import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth springs for the outer ring
  const springX = useSpring(0, { stiffness: 500, damping: 28, mass: 0.5 });
  const springY = useSpring(0, { stiffness: 500, damping: 28, mass: 0.5 });

  useEffect(() => {
    // Only show on desktop
    if (window.innerWidth < 768) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX - 24); // Center the 48px aura (w-12)
      springY.set(e.clientY - 24);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const checkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over clickable elements
      const isClickable = 
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsHovering(isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', checkHover);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', checkHover);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [springX, springY, isVisible]);

  if (!isVisible || typeof window !== 'undefined' && window.innerWidth < 768) return null;

  return (
    <>
      {/* Glowing Laser Core (Instant) */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full pointer-events-none z-[9999]"
        style={{
          background: '#22d3ee',
          boxShadow: '0 0 10px 2px #22d3ee, 0 0 20px 4px #0891b2'
        }}
        animate={{
          x: mousePosition.x - 5,
          y: mousePosition.y - 5,
          scale: isHovering ? 0.3 : 1,
          opacity: isHovering ? 0.5 : 1
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
      />

      {/* Soft Trailing Laser Aura (Spring) */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 rounded-full pointer-events-none z-[9998] mix-blend-screen"
        style={{
          x: springX,
          y: springY,
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          background: isHovering 
            ? 'radial-gradient(circle, rgba(8, 145, 178, 0.4) 0%, rgba(8, 145, 178, 0) 70%)'
            : 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, rgba(8, 145, 178, 0) 70%)',
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
      />
    </>
  );
}
