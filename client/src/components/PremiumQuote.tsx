import { Quote } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

/**
 * PremiumQuote — A golden-accented quote block for scattered placement across pages.
 *
 * Styles:
 *  • Gold gradient accent bar
 *  • Italic serif-style quote text
 *  • Optional attribution line
 *  • Scroll-triggered fade-in animation
 */

interface Props {
  text: string;
  author?: string;
  variant?: 'left' | 'center';
  className?: string;
}

export default function PremiumQuote({
  text,
  author,
  variant = 'left',
  className = '',
}: Props) {
  const isCenter = variant === 'center';

  return (
    <AnimateOnScroll variant="fadeUp" delay={0.1} className={className}>
      <div
        className={`relative py-10 md:py-14 px-6 md:px-10 ${
          isCenter ? 'text-center' : ''
        }`}
      >
        {/* Gold accent bar */}
        {!isCenter && (
          <div
            className="absolute left-0 top-6 bottom-6 w-1 rounded-full"
            style={{
              background:
                'linear-gradient(180deg, #d4a017, #f5c842, #d4a017)',
            }}
          />
        )}

        {/* Decorative quote icon */}
        <div
          className={`mb-4 ${isCenter ? 'flex justify-center' : ''}`}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(212,160,23,0.12), rgba(245,200,66,0.08))',
              border: '1px solid rgba(212,160,23,0.2)',
            }}
          >
            <Quote
              className="w-5 h-5"
              style={{ color: '#d4a017' }}
            />
          </div>
        </div>

        {/* Quote text */}
        <p
          className={`text-lg md:text-xl leading-relaxed italic ${
            isCenter ? 'max-w-3xl mx-auto' : 'max-w-4xl'
          }`}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            color: '#374151',
            letterSpacing: '-0.01em',
          }}
        >
          <span
            className="text-2xl md:text-3xl font-bold mr-1"
            style={{
              background: 'linear-gradient(135deg, #d4a017, #f5c842)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            "
          </span>
          {text}
          <span
            className="text-2xl md:text-3xl font-bold ml-1"
            style={{
              background: 'linear-gradient(135deg, #d4a017, #f5c842)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            "
          </span>
        </p>

        {/* Attribution */}
        {author && (
          <p
            className={`mt-4 text-sm font-semibold uppercase tracking-wider ${
              isCenter ? '' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, #d4a017, #b8860b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            — {author}
          </p>
        )}

        {/* Center divider */}
        {isCenter && (
          <div className="flex justify-center mt-5">
            <div
              className="w-16 h-[2px] rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, #d4a017, transparent)',
              }}
            />
          </div>
        )}
      </div>
    </AnimateOnScroll>
  );
}
