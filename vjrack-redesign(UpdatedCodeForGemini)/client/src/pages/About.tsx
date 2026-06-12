import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { companyInfo } from '@/lib/data';
import { CheckCircle, Award, Users, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-foreground to-primary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About VJ Rack
            </h1>
            <p className="text-lg md:text-xl text-gray-100">
              {companyInfo.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
                {companyInfo.description}
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                With years of experience in the storage solutions industry, we have built a reputation for delivering exceptional quality and customer service. Our commitment to innovation and excellence drives everything we do.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-8 md:p-12">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Our Mission
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {companyInfo.mission}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Why Choose VJ Rack?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <CheckCircle className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                Quality Assured
              </h3>
              <p className="text-muted-foreground">
                Every product undergoes rigorous quality checks to ensure durability and reliability.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <Award className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                Industry Leading
              </h3>
              <p className="text-muted-foreground">
                Recognized as a leading rack manufacturer in Tamil Nadu with proven expertise.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                Customer Focused
              </h3>
              <p className="text-muted-foreground">
                We prioritize customer satisfaction and provide exceptional support throughout.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">
                Innovation Driven
              </h3>
              <p className="text-muted-foreground">
                Continuously innovating to bring cutting-edge storage solutions to market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Info */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Leadership
            </h2>
            <div className="bg-secondary p-8 md:p-12 rounded-lg">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {companyInfo.owner}
              </h3>
              <p className="text-lg text-primary font-semibold mb-6">
                {companyInfo.ownerTitle}
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                With a vision to revolutionize the storage solutions industry, our owner has led VJ Rack to become a trusted name in manufacturing high-quality, customizable storage systems that serve businesses across multiple sectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
