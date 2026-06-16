import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { galleryCategories } from '@/lib/galleryData';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import PageTransition from '@/components/PageTransition';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import PremiumQuote from '@/components/PremiumQuote';
import PageHero from '@/components/PageHero';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [, navigate] = useLocation();

  const [allImages, setAllImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load gallery images from server on mount
  useEffect(() => {
    fetch('/api/gallery/custom')
      .then(res => res.json())
      .then(data => { if (data.success) setAllImages(data.customImages); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredImages = selectedCategory === 'All' 
    ? allImages 
    : allImages.filter(img => img.category === selectedCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(prev => prev === null ? null : (prev + 1) % filteredImages.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(prev => prev === null ? null : (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setLightboxIndex(prev => prev === null ? null : (prev + 1) % filteredImages.length);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev === null ? null : (prev - 1 + filteredImages.length) % filteredImages.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages.length]);

  useEffect(() => {
    if (lightboxIndex !== null) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  const categoryCounts = galleryCategories.map(cat => ({
    name: cat,
    count: cat === 'All' ? allImages.length : allImages.filter(img => img.category === cat).length
  }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />

        <PageHero 
          title="Our Gallery" 
          subtitle={`Browse ${allImages.length}+ real photos of our rack installations, products, and happy customers`} 
        />

        {/* Category Filter */}
        <section className="py-6 bg-secondary border-b border-border sticky top-16 md:top-[68px] z-30">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoryCounts.map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === name
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border'
                  }`}
                >
                  {name} <span className="opacity-70">({count})</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Quote */}
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <PremiumQuote
              text="A picture speaks a thousand words — see the quality and craftsmanship that goes into every VJ Rack installation."
              author="VJ Rack Gallery"
              variant="center"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll variant="fadeUp">
              <div className="flex items-center justify-between mb-8">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredImages.length}</span> images
                  {selectedCategory !== 'All' && <> in <span className="font-semibold text-primary">{selectedCategory}</span></>}
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredImages.map((image, index) => (
                <AnimateOnScroll
                  key={image.id}
                  variant="scale"
                  delay={Math.min(index * 0.04, 0.4)}
                >
                  <div className="relative group">
                    <div
                      onClick={() => openLightbox(index)}
                      className="group relative cursor-pointer rounded-lg overflow-hidden bg-secondary aspect-[3/4]"
                    >
                      <img
                        src={image.thumbnailSrc || image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                          <ZoomIn className="w-8 h-8 text-white" />
                          <span className="text-white text-xs font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                            {image.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4 text-center">
            <AnimateOnScroll variant="scale">
              <h2 className="text-3xl font-bold text-foreground mb-4">Like What You See?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let us design the perfect storage solution for your business. Contact our team for a free consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/contact')} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-semibold">
                  Get a Free Quote
                </Button>
                <Button onClick={() => navigate('/shop')} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 font-semibold">
                  Browse Categories
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Lightbox */}
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
            <button onClick={closeLightbox} className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>
            <button onClick={prevImage} className="absolute left-2 md:left-8 z-50 p-3 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm">
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button onClick={nextImage} className="absolute right-2 md:right-8 z-50 p-3 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm">
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <div className="relative max-w-5xl w-full max-h-[90vh] px-12 md:px-24 flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <img
                src={filteredImages[lightboxIndex].src}
                alt={filteredImages[lightboxIndex].alt}
                className="max-w-full max-h-[85vh] object-contain select-none"
                draggable={false}
              />
              <div className="absolute bottom-[-2rem] left-0 right-0 text-center text-white/70 text-sm">
                {lightboxIndex + 1} / {filteredImages.length} &bull; {filteredImages[lightboxIndex].category}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}
