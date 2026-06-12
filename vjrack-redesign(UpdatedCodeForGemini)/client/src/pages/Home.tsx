import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Features from '@/components/Features';
import FeaturedProducts from '@/components/FeaturedProducts';
import Testimonials from '@/components/Testimonials';
import Videos from '@/components/Videos';
import Footer from '@/components/Footer';

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
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Categories />
      <Features />
      <FeaturedProducts />
      <Testimonials />
      <Videos />
      <Footer />
    </div>
  );
}
