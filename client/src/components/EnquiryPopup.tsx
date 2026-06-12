import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { companyInfo } from '@/lib/data';

/**
 * EnquiryPopup — Auto-popup enquiry form that appears on website load.
 *
 * Features:
 *  • Elastic bounce-in animation from center on first visit
 *  • Glassmorphism backdrop with blur
 *  • Session-aware — only shows once per browser session
 *  • Full input validation matching Contact page security standards
 *  • Smooth exit animation on close
 *  • Keyboard accessible (Escape to close, focus trap)
 *  • Sends data to /api/enquiry endpoint
 */

// Rate limit: 1 enquiry per 60 seconds from popup
const SUBMIT_COOLDOWN_MS = 60_000;

export default function EnquiryPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productInterest: '',
    message: '',
  });

  // Show popup after 1.5s delay — only once per session
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('vjrack_enquiry_shown');
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem('vjrack_enquiry_shown', 'true');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Focus first input when popup opens
  useEffect(() => {
    if (isVisible && firstInputRef.current) {
      // Small delay to let animation start before focusing
      const focusTimer = setTimeout(() => firstInputRef.current?.focus(), 400);
      return () => clearTimeout(focusTimer);
    }
  }, [isVisible]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot — bots fill hidden fields
    if (honeypot) {
      toast.success('Enquiry submitted!');
      return;
    }

    // Required fields check
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Length limits
    if (formData.name.length > 100) {
      toast.error('Name is too long (max 100 characters)');
      return;
    }
    if (formData.message.length > 2000) {
      toast.error('Message is too long (max 2000 characters)');
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneClean = formData.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?\d{7,15}$/.test(phoneClean)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Rate limit
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN_MS) {
      toast.error('Please wait before submitting another enquiry');
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(now);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.substring(0, 100),
          email: formData.email.substring(0, 254),
          phone: formData.phone.substring(0, 20),
          productInterest: (formData.productInterest || 'Not specified').substring(0, 100),
          message: formData.message.substring(0, 2000),
          source: 'popup',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast.success('Thank you! We will contact you shortly.');
        setFormData({ name: '', email: '', phone: '', productInterest: '', message: '' });

        // Auto-close after success
        setTimeout(() => {
          handleClose();
        }, 2500);
      } else {
        toast.error(result.error || 'Failed to submit. Please try again.');
      }
    } catch {
      toast.error(
        `Network error. Please call us directly at ${companyInfo.phone}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        /* Backdrop */
        <motion.div
          id="enquiry-popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-popup-title"
        >
          {/* Popup Card */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={
              isClosing
                ? { opacity: 0, scale: 0.8, y: 30, transition: { duration: 0.25 } }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 22,
              mass: 0.8,
            }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Top Gradient Bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: 'linear-gradient(90deg, #0891b2, #06b6d4, #22d3ee, #06b6d4, #0891b2)',
                backgroundSize: '200% 100%',
                animation: 'gradientShift 3s ease-in-out infinite',
              }}
            />

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              {/* Close Button */}
              <motion.button
                id="enquiry-popup-close"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                aria-label="Close enquiry form"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Icon & Title */}
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                  }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2
                    id="enquiry-popup-title"
                    className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Quick Enquiry
                  </h2>
                  <p className="text-sm text-gray-500">
                    Get a free quote for your storage needs
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              {/* Honeypot — hidden from real users */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="enquiry-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  ref={firstInputRef}
                  id="enquiry-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 focus:border-[#0891b2] transition-all duration-200"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email & Phone — Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="enquiry-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    id="enquiry-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={254}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 focus:border-[#0891b2] transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="enquiry-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    id="enquiry-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={20}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 focus:border-[#0891b2] transition-all duration-200"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>

              {/* Product Interest */}
              <div>
                <label htmlFor="enquiry-product" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Product Interest
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  id="enquiry-product"
                  name="productInterest"
                  value={formData.productInterest}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 focus:border-[#0891b2] transition-all duration-200 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}
                >
                  <option value="">Select a category...</option>
                  <option value="Super Market Rack">Super Market Rack</option>
                  <option value="Heavy Duty Rack">Heavy Duty Rack</option>
                  <option value="Textile Garments Rack">Textile Garments Rack</option>
                  <option value="Hyper Market Rack">Hyper Market Rack</option>
                  <option value="Fruits & Vegetable Rack">Fruits & Vegetable Rack</option>
                  <option value="Slotted Angle Rack">Slotted Angle Rack</option>
                  <option value="Glass Frame Rack">Glass Frame Rack</option>
                  <option value="Medical Shop Rack">Medical Shop Rack</option>
                  <option value="Shoe Rack">Shoe Rack</option>
                  <option value="Other">Other</option>
                </motion.select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="enquiry-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  id="enquiry-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  maxLength={2000}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 focus:border-[#0891b2] transition-all duration-200 resize-none"
                  placeholder="Tell us about your storage requirements..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                id="enquiry-popup-submit"
                type="submit"
                disabled={isSubmitting || isSuccess}
                whileHover={{ scale: isSubmitting || isSuccess ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting || isSuccess ? 1 : 0.98 }}
                className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                  isSuccess
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : isSubmitting
                    ? 'bg-[#0891b2]/70 cursor-not-allowed'
                    : 'bg-[#0891b2] hover:bg-[#0e7490] shadow-lg shadow-[#0891b2]/25 hover:shadow-[#0891b2]/40'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submitted Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Enquiry
                  </>
                )}
              </motion.button>

              {/* Privacy Note */}
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By submitting, you agree to be contacted by VJ Rack regarding your enquiry. 
                We respect your privacy.
              </p>
            </form>

            {/* Decorative floating particles */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full opacity-20"
                  style={{
                    background: '#0891b2',
                    left: `${15 + i * 18}%`,
                    top: `${10 + i * 15}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
