import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { companyInfo } from '@/lib/data';
import { CheckCircle, Award, Users, Play, MapPin, Factory, Handshake, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import PremiumQuote from '@/components/PremiumQuote';
import PageHero from '@/components/PageHero';
import Hover3DCard from '@/components/Hover3DCard';

export default function About() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [, navigate] = useLocation();

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <PageHero 
          title="About VJ Rack" 
          subtitle={`${companyInfo.tagline} — Based in Tiruchirappalli (Trichy), Tamil Nadu, India`} 
        />

        {/* Company Story */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimateOnScroll variant="fadeLeft">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Our Story
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
                    {companyInfo.description}
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
                    We pride ourselves on our unwavering commitment to durability, aesthetics, and functionality. Every product we offer is engineered with precision, strength, and long-term performance in mind.
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Our range includes industrial racking, retail displays, supermarket racks, textile racks, and many more — all designed to serve diverse industries. We provide end-to-end support including consultation, layout design, installation, and after-sales service.
                  </p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll variant="fadeRight" delay={0.15}>
                <div className="bg-secondary rounded-lg p-8 md:p-12">
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Our Mission
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                    {companyInfo.mission}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Factory className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">Precision-engineered products for strength, durability, and long-term performance</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Handshake className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">End-to-end support — consultation, layout design, installation & after-sales service</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">Proudly based in Tiruchirappalli (Trichy), Tamil Nadu, serving businesses across India</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Premium Quote */}
        <div className="bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <PremiumQuote
              text="Build products that last, provide service that matters, and create partnerships that help businesses grow smarter."
              author="Mr. Charles, Founder & Owner"
              variant="center"
            />
          </div>
        </div>

        {/* Owner Section with Video */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <AnimateOnScroll variant="fadeUp">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Meet Our Founder
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Hear directly from {companyInfo.owner}, the visionary behind VJ Rack, about our commitment to delivering world-class storage solutions.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Video */}
              <AnimateOnScroll variant="fadeLeft" delay={0.1}>
                <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black aspect-video">
                  {!isVideoPlaying ? (
                    <div 
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                      onClick={() => setIsVideoPlaying(true)}
                    >
                      {/* Video thumbnail / poster */}
                      <video 
                        src={companyInfo.ownerVideo}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/90 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shadow-lg">
                          <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      {/* Label */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-semibold text-sm md:text-base">
                          ▶ Watch: {companyInfo.owner} speaks about VJ Rack
                        </p>
                      </div>
                    </div>
                  ) : (
                    <video
                      src={companyInfo.ownerVideo}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                    />
                  )}
                </div>
              </AnimateOnScroll>

              {/* Owner Info */}
              <AnimateOnScroll variant="fadeRight" delay={0.2}>
                <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-border">
                  <div className="mb-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {companyInfo.owner}
                    </h3>
                    <p className="text-lg text-primary font-semibold">
                      {companyInfo.ownerTitle}
                    </p>
                  </div>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      With a clear vision to revolutionize the storage solutions industry, {companyInfo.owner} founded VJ Rack to bring innovative, high-quality, and customizable racking systems to businesses of all sizes.
                    </p>
                    <p>
                      Under his leadership, VJ Rack has grown to become a trusted name in manufacturing, serving industries ranging from supermarkets and textile showrooms to warehouses and industrial facilities across Tamil Nadu and beyond.
                    </p>
                    <p>
                      His philosophy is simple — build products that last, provide service that matters, and create partnerships that help businesses grow smarter and more efficiently.
                    </p>
                  </div>
                  <div className="mt-8">
                    <Button 
                      onClick={() => navigate('/contact')}
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-semibold"
                    >
                      Get in Touch
                    </Button>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll variant="fadeUp">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
                Why Choose VJ Rack?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-center mb-12">
                We combine quality, innovation, and reliability to deliver storage solutions that exceed expectations.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: CheckCircle, title: 'Quality Assured', desc: 'Every product undergoes rigorous quality checks. Our racks are precision-engineered for strength, durability, and long-term performance.' },
                { icon: Award, title: 'Industry Leading', desc: 'Recognized as a leading rack manufacturer in Tamil Nadu with proven expertise across industrial, retail, and commercial sectors.' },
                { icon: Users, title: 'End-to-End Service', desc: 'From initial consultation and layout design to professional installation and dedicated after-sales support — we\'ve got you covered.' },
                { icon: ShieldCheck, title: 'Built to Last', desc: 'Our products are designed to maximize space utilization and enhance operational efficiency — built with materials that stand the test of time.' },
              ].map((item, index) => (
                <Hover3DCard key={item.title} delay={index * 0.15}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-primary/10 border border-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </Hover3DCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4 text-center">
            <AnimateOnScroll variant="scale">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Transform Your Space?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let us help you find the perfect storage solution for your business. Contact our team for a free consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/contact')}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-base font-semibold"
                >
                  Contact Us Today
                </Button>
                <Button 
                  onClick={() => navigate('/shop')}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 text-base font-semibold"
                >
                  Browse Our Products
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
