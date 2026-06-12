import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Features from '@/components/Features';
import FeaturedProducts from '@/components/FeaturedProducts';
import Testimonials from '@/components/Testimonials';
import Videos from '@/components/Videos';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import PremiumQuote from '@/components/PremiumQuote';

/**
 * Home Page - VJ Rack Website Redesign
 * 
 * Design Philosophy: Modern Minimalist Industrial
 * - Clean, spacious layouts with generous whitespace
 * - Bold typography hierarchy with Poppins (headings) and Inter (body)
 * - Teal accent color (#0891b2) for innovation and reliability
 * - Smooth animations and transitions for enhanced UX
 * - Professional, trustworthy aesthetic emphasizing durability
 */
export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />
        <Hero />
        <Categories />

        {/* Quote between Categories and Features */}
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <PremiumQuote
              text="Great storage isn't just about space — it's about building the foundation for a smarter, more efficient business."
              author="VJ Rack Philosophy"
              variant="center"
            />
          </div>
        </div>

        <Features />
        <FeaturedProducts />

        {/* Quote between Products and Testimonials */}
        <div className="bg-secondary">
          <div className="container mx-auto px-4">
            <PremiumQuote
              text="Every rack we build carries our promise — precision engineering, unwavering durability, and the trust of 900+ businesses across Tamil Nadu."
              author="Mr. Charles, Founder"
              variant="center"
            />
          </div>
        </div>

        <Testimonials />
        <Videos />
        <Footer />
      </div>
    </PageTransition>
  );
}
