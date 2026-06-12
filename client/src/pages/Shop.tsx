import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import PageTransition from '@/components/PageTransition';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import PremiumQuote from '@/components/PremiumQuote';
import PageHero from '@/components/PageHero';

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [, setLocation] = useLocation();

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || cat.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEnquiry = (categoryName: string) => {
    // Navigate to contact page with category info
    setLocation(`/contact?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <PageHero 
          title="All Product Categories" 
          subtitle="Explore our complete range of 28+ specialized storage and display rack categories designed for every industry and requirement." 
        />

        {/* Search & Filter Section */}
        <section className="py-8 bg-secondary border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <div className="w-full md:w-80">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white text-foreground cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  <option value="All">All Categories ({categories.length})</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Quote */}
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <PremiumQuote
              text="The right storage solution doesn't just organise your products — it transforms how your business operates."
              author="VJ Rack"
              variant="center"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll variant="fadeUp">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Browse Categories
                </h2>
                <p className="text-muted-foreground">
                  Showing {filteredCategories.length} of {categories.length} categories
                </p>
              </div>
            </AnimateOnScroll>

            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => (
                  <AnimateOnScroll
                    key={category.id}
                    variant="float"
                    delay={Math.min(index * 0.06, 0.5)}
                  >
                    <div
                      className="group bg-white rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden bg-secondary h-64">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 mb-2">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-border">
                          <Button
                            onClick={() => handleEnquiry(category.name)}
                            className="flex-1 bg-primary hover:bg-primary/80 text-white transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 font-semibold"
                          >
                            Send Enquiry
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  No categories found matching "{searchTerm}"
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4 text-center">
            <AnimateOnScroll variant="scale">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Contact our team for custom storage solutions tailored to your specific needs.
              </p>
              <Button
                onClick={() => setLocation('/contact')}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-base font-semibold"
              >
                Contact Us Today
              </Button>
            </AnimateOnScroll>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
