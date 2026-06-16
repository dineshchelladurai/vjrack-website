import { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { companyInfo } from '@/lib/data';

/**
 * Header — Premium responsive navigation bar.
 *
 * Features:
 *  • Slim top info bar with phone & email (collapses on scroll)
 *  • Active page indicator with animated underline
 *  • Scroll-aware: becomes frosted glass after scrolling
 *  • Smooth mobile drawer with staggered item animations
 *  • Premium "Get a Quote" CTA with hover glow effect
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Shop', href: '/shop' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  // Track scroll for header style change
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isActive = (href: string) =>
    href === '/' ? location === '/' : location.startsWith(href);

  return (
    <>
      {/* ── Top Info Bar ─────────────────────────────────────────────── */}
      <motion.div
        initial={false}
        animate={{
          height: isScrolled ? 0 : 'auto',
          opacity: isScrolled ? 0 : 1,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden bg-[#0e1a2b] text-white/80 text-xs z-50 relative"
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${companyInfo.phone}`}
              className="flex items-center gap-1.5 hover:text-[#22d3ee] transition-colors duration-200"
            >
              <Phone className="w-3 h-3" />
              <span>{companyInfo.phone}</span>
            </a>
            <a
              href={`mailto:${companyInfo.email}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-[#22d3ee] transition-colors duration-200"
            >
              <Mail className="w-3 h-3" />
              <span>{companyInfo.email}</span>
            </a>
          </div>
          <div className="hidden sm:block text-white/50 text-[11px]">
            Leading Rack Manufacturer in Tamil Nadu
          </div>
        </div>
      </motion.div>

      {/* ── Main Navbar ──────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/[0.04] border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* ── Logo ──────────────────────────────────────────────── */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center group relative"
            >
              <img
                src="/vjrack-logo.png"
                alt="VJ Rack - The Complete Shop Needs"
                className="h-10 lg:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </button>

            {/* ── Desktop Navigation ────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const hovered = hoveredItem === item.label;

                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative px-4 py-2 text-[15px] font-medium transition-colors duration-200"
                    style={{
                      color: active || hovered ? '#0891b2' : '#374151',
                    }}
                  >
                    <span className="relative z-10">{item.label}</span>

                    {/* Industrial Laser Scanner Indicator */}
                    {(active || hovered) && (
                      <motion.div
                        layoutId="nav-laser-track"
                        className="absolute bottom-1 left-3 right-3 h-[2px] bg-[#0891b2]/30 overflow-hidden rounded-full"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        {/* The Spark */}
                        <motion.div
                          className="absolute top-0 bottom-0 w-3 bg-[#22d3ee] rounded-full"
                          style={{ boxShadow: '0 0 8px 2px #22d3ee, 0 0 12px 1px #0891b2' }}
                          animate={{ 
                            left: ['-20%', '120%', '-20%'] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5, 
                            ease: 'linear' 
                          }}
                        />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── Right Actions (Desktop) ───────────────────────────── */}
            <div className="hidden lg:flex items-center gap-3">
              {/* WhatsApp quick link */}
              <a
                href={`https://wa.me/${companyInfo.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>

              {/* Primary CTA */}
              <Button
                onClick={() => navigate('/contact')}
                className="relative overflow-hidden bg-[#0891b2] hover:bg-[#0e7490] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-[#0891b2]/20 hover:shadow-lg hover:shadow-[#0891b2]/30 transition-all duration-300 group"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Get a Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </span>
                {/* Shine effect on hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Button>
            </div>

            {/* ── Mobile Menu Toggle ────────────────────────────────── */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5 text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Drawer Overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-white shadow-2xl lg:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
                <img
                  src="/vjrack-logo.png"
                  alt="VJ Rack"
                  className="h-8 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1 overflow-y-auto py-4 px-3">
                {navItems.map((item, i) => {
                  const active = isActive(item.href);
                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, duration: 0.25 }}
                      onClick={() => {
                        navigate(item.href);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 mb-1 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                        active
                          ? 'bg-[#0891b2]/10 text-[#0891b2]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 space-y-3">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${companyInfo.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Us
                </a>

                {/* Get a Quote */}
                <Button
                  onClick={() => {
                    navigate('/contact');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-[#0891b2] hover:bg-[#0e7490] text-white font-semibold py-2.5 rounded-xl"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    Get a Quote
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
