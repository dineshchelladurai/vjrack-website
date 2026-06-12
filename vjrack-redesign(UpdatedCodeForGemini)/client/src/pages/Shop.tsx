import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Shop() {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnquiry = (categoryName: string) => {
    // Navigate to contact page with category info
    setLocation(`/contact?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-foreground to-primary/20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            All Product Categories
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl">
            Explore our complete range of 28+ specialized storage and display rack categories designed for every industry and requirement.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Browse Categories
            </h2>
            <p className="text-muted-foreground">
              Showing {filteredCategories.length} of {categories.length} categories
            </p>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No categories found matching "{searchTerm}"
              </p>
              <Button
                onClick={() => setSearchTerm('')}
                variant="outline"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
