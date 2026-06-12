import { type ReactNode } from 'react';
import AnimateOnScroll from './AnimateOnScroll';

interface Props {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export default function PageHero({ title, subtitle, children }: Props) {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden bg-slate-900">
      {/* Crisp Diagonal Accents (No Blur) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[120%] bg-gradient-to-bl from-primary/15 to-transparent -skew-x-12 translate-x-20 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[120%] bg-gradient-to-tr from-[#d4a017]/10 to-transparent skew-x-12 -translate-x-20 translate-y-10" />
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-10 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <AnimateOnScroll variant="fadeUp" duration={0.6}>
          {/* Subtle Top Accent */}
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-primary/70"></span>
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">VJ Rack</span>
            <span className="w-8 h-[1px] bg-primary/70"></span>
          </div>
          
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {title}
          </h1>
          
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          
          {children && (
            <div className="mt-8 flex justify-center">
              {children}
            </div>
          )}
        </AnimateOnScroll>
      </div>

      {/* Crisp bottom border */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
