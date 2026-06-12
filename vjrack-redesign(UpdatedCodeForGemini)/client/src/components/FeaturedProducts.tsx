import { featuredProducts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useLocation } from 'wouter';

export default function FeaturedProducts() {
  const [, navigate] = useLocation();

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            Discover our most popular and highly-rated storage solutions trusted by businesses across industries.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden bg-secondary h-64 md:h-72">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                  {product.name}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {product.features.slice(0, 2).map((feature, idx) => (
                    <li key={idx} className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  onClick={() => navigate('/contact')}
                  className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Send Enquiry
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <Button
            onClick={() => navigate('/shop')}
            variant="outline"
            className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-white"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}
