import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Shield, Gem, Maximize, Palette, ArrowRight } from 'lucide-react';

/**
 * Features — "Why Choose VJ Rack?" section.
 *
 * Redesigned with:
 *  • Prominent animated "13+ Years" experience counter
 *  • Cards slide in from left/right on scroll
 *  • 3D tilt + glow hover effects on each card
 *  • Animated stat counters for social proof
 *  • Scroll-triggered stagger animations
 */

// Feature data with Lucide icons instead of text emoji
const featureCards = [
  {
    icon: Shield,
    title: 'Custom Storage Solutions',
    description: 'Engineered to fit your exact space, workflow, and load requirements — no off-the-shelf compromises.',
    color: '#0891b2',
    gradient: 'from-cyan-500/10 to-teal-500/10',
  },
  {
    icon: Gem,
    title: 'Durable Design Quality',
    description: 'Heavy-gauge steel, powder-coated finishes, and precision welding that withstands decades of daily use.',
    color: '#8b5cf6',
    gradient: 'from-violet-500/10 to-purple-500/10',
  },
  {
    icon: Maximize,
    title: 'Innovative Space Savers',
    description: 'Increase storage capacity by up to 60% with our intelligently designed vertical and modular systems.',
    color: '#f59e0b',
    gradient: 'from-amber-500/10 to-orange-500/10',
  },
  {
    icon: Palette,
    title: 'Stylish & Functional',
    description: 'Premium aesthetics meet industrial strength — racks that enhance your brand and retail environment.',
    color: '#10b981',
    gradient: 'from-emerald-500/10 to-green-500/10',
  },
];


// ── Animated Counter Component ────────────────────────────────────────
function AnimatedCounter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) {
      animate(motionVal, value, { duration, ease: 'easeOut' });
    }
  }, [isInView, value, duration, motionVal]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = `${v}${suffix}`;
    });
    return unsub;
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// ── Feature Card Component ────────────────────────────────────────────
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof featureCards)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-80px' });
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const Icon = feature.icon;

  // Slide in: even cards from left, odd from right
  const slideFrom = index % 2 === 0 ? -80 : 80;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: slideFrom, y: 20 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className="relative group"
      style={{ perspective: '800px' }}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? (mousePos.y - 0.5) * -8 : 0,
          rotateY: isHovered ? (mousePos.x - 0.5) * 8 : 0,
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative overflow-hidden bg-white rounded-2xl p-7 md:p-8 border border-gray-100 h-full`}
        style={{
          boxShadow: isHovered
            ? `0 20px 40px -12px ${feature.color}22, 0 8px 20px -8px rgba(0,0,0,0.08)`
            : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {/* Hover glow spot */}
        {isHovered && (
          <div
            className="absolute w-40 h-40 rounded-full pointer-events-none opacity-60 blur-3xl transition-all duration-300"
            style={{
              background: `radial-gradient(circle, ${feature.color}20, transparent 70%)`,
              left: `${mousePos.x * 100}%`,
              top: `${mousePos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Icon */}
        <motion.div
          animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="relative w-14 h-14 rounded-xl flex items-center justify-center mb-5"
          style={{
            background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}08)`,
            border: `1px solid ${feature.color}20`,
          }}
        >
          <Icon className="w-7 h-7" style={{ color: feature.color }} />
        </motion.div>

        {/* Content */}
        <h3
          className="text-lg md:text-xl font-bold text-gray-900 mb-3 relative z-10"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {feature.title}
        </h3>
        <p className="text-sm md:text-[15px] text-gray-500 leading-relaxed relative z-10">
          {feature.description}
        </p>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[3px] rounded-full"
          style={{ background: feature.color }}
          initial={{ width: '0%' }}
          animate={{ width: isHovered ? '100%' : '0%' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}

// ── Main Features Section ─────────────────────────────────────────────
export default function Features() {
  const [, navigate] = useLocation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-[#f8fafb] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0891b2 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">

        {/* ── Experience Badge + Section Header ──────────────────── */}
        <div className="flex flex-col items-center text-center mb-14 md:mb-20">
          {/* Animated experience badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative mb-8"
          >
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                boxShadow: '0 8px 32px rgba(8,145,178,0.3), 0 0 0 8px rgba(8,145,178,0.08), 0 0 0 16px rgba(8,145,178,0.04)',
              }}
            >
              {/* Rotating ring */}
              <motion.div
                className="absolute inset-[-4px] rounded-full border-2 border-dashed border-[#0891b2]/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <span
                className="text-4xl md:text-5xl font-extrabold text-white leading-none"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <AnimatedCounter value={13} suffix="+" duration={1.5} />
              </span>
              <span className="text-[11px] md:text-xs font-semibold text-white/80 uppercase tracking-widest mt-1">
                Years
              </span>
            </div>
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#0891b2]/20"
              animate={{ scale: [1, 1.3, 1.3], opacity: [0.4, 0, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#0891b2]/15"
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.3, 0, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, delay: 0.5 }}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Poppins', sans-serif", lineHeight: 1.2 }}
          >
            Why Choose{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#0891b2]">VJ Rack</span>
              <motion.span
                className="absolute bottom-1 left-0 w-full h-3 bg-[#0891b2]/10 rounded-full -z-0"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{ originX: 0 }}
              />
            </span>
            ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base md:text-lg text-gray-500 max-w-2xl leading-relaxed"
          >
            With <strong className="text-gray-700">13+ years of experience</strong> and <strong className="text-gray-700">900+ projects</strong> delivered across Tamil Nadu — we combine quality craftsmanship, innovation, and reliability to deliver storage solutions that exceed expectations.
          </motion.p>
        </div>

        {/* ── Feature Cards Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7 mb-16 md:mb-20">
          {featureCards.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-14 md:mt-16 text-center"
        >
          <p className="text-base md:text-lg text-gray-500 mb-6">
            Ready to transform your storage space?
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 bg-[#0891b2] text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-[#0891b2]/20 hover:shadow-xl hover:shadow-[#0891b2]/30 hover:bg-[#0e7490] transition-all duration-300 group"
          >
            Get Started Today
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
