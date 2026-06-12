import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { galleryImages, galleryCategories } from '@/lib/galleryData';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Plus, Lock, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import PageTransition from '@/components/PageTransition';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import PremiumQuote from '@/components/PremiumQuote';
import PageHero from '@/components/PageHero';

const ADMIN_TOKEN_KEY = 'vjrack-admin-token';
const GALLERY_STORAGE_KEY = 'vjrack-custom-gallery';
const HIDDEN_GALLERY_KEY = 'vjrack-hidden-gallery';

function loadCustomImages() {
  try {
    const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveCustomImages(images: any[]) {
  localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(images));
}

function loadHiddenImageIds() {
  try {
    const stored = localStorage.getItem(HIDDEN_GALLERY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveHiddenImageIds(ids: string[]) {
  localStorage.setItem(HIDDEN_GALLERY_KEY, JSON.stringify(ids));
}

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [, navigate] = useLocation();

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 2FA State
  const [show2FA, setShow2FA] = useState(false);
  const [setup2FAUrl, setSetup2FAUrl] = useState('');
  const [tempSecret, setTempSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formCategory, setFormCategory] = useState(galleryCategories[1] || 'Commercial Racks');
  const [formAlt, setFormAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [customImages, setCustomImages] = useState<any[]>(loadCustomImages);
  const [hiddenIds, setHiddenIds] = useState<string[]>(loadHiddenImageIds);

  useEffect(() => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(res => res.json())
        .then(data => { if (data.valid) setIsAdmin(true); else sessionStorage.removeItem(ADMIN_TOKEN_KEY); })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' && !isAdmin) {
      setShowLoginModal(true);
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const payload: any = { password: adminPassword };
      if (show2FA) payload.code = totpCode;
      if (tempSecret) payload.tempSecret = tempSecret;

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (data.requiresSetup) {
          setSetup2FAUrl(data.qrCodeUrl);
          setTempSecret(data.tempSecret);
          setShow2FA(true);
        } else if (data.requires2FA) {
          setShow2FA(true);
        } else if (data.token) {
          sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
          setIsAdmin(true);
          setShowLoginModal(false);
          setAdminPassword('');
          setTotpCode('');
          setTempSecret('');
          setShow2FA(false);
          setLoginError('');
        }
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }
    setIsAdmin(false);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImage) return;

    setIsUploading(true);
    try {
      const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      const formData = new FormData();
      formData.append("image", formImage);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const newImage = {
        id: `custom-${Date.now()}`,
        src: data.url,
        category: formCategory,
        alt: formAlt.trim() || 'VJ Rack Product',
      };

      const updated = [newImage, ...customImages];
      setCustomImages(updated);
      saveCustomImages(updated);
      
      setFormImage(null);
      setFormAlt('');
      setShowAddForm(false);
    } catch (e) {
      alert("Failed to upload image. Make sure you are logged in.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith('custom-')) {
      const updated = customImages.filter((img: any) => img.id !== id);
      setCustomImages(updated);
      saveCustomImages(updated);
    } else {
      const updated = [...hiddenIds, id];
      setHiddenIds(updated);
      saveHiddenImageIds(updated);
    }
  };

  const allImages = [...customImages, ...galleryImages].filter(img => !hiddenIds.includes(img.id));

  const filteredImages = selectedCategory === 'All'
    ? allImages
    : allImages.filter(img => img.category === selectedCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null ? (prev + 1) % filteredImages.length : null);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
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

        {/* Hero */}
        <PageHero 
          title="Our Gallery" 
          subtitle={`Browse ${allImages.length}+ real photos of our rack installations, products, and happy customers`} 
        >
          {isAdmin && (
            <div className="flex items-center justify-center gap-3 w-full mt-6">
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Image
              </Button>
              <button
                onClick={handleAdminLogout}
                className="p-2 text-white/60 hover:text-white transition-colors" title="Logout Admin"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </PageHero>

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
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                          <ZoomIn className="w-8 h-8 text-white" />
                          <span className="text-white text-xs font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                            {image.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteImage(image.id, e)}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-md z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
            {/* Close */}
            <button onClick={closeLightbox} className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 z-50 text-white/70 text-sm font-medium">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>

            {/* Category label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
              <span className="bg-primary/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                {filteredImages[lightboxIndex].category}
              </span>
            </div>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Image */}
            <div className="max-w-5xl max-h-[85vh] px-16" onClick={(e) => e.stopPropagation()}>
              <img
                src={filteredImages[lightboxIndex].src}
                alt={filteredImages[lightboxIndex].alt}
                className="max-w-full max-h-[85vh] object-contain mx-auto rounded-lg"
              />
            </div>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Alt text */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 text-white/80 text-sm text-center">
              {filteredImages[lightboxIndex].alt}
            </div>
          </div>
        )}

        <Footer />

        {/* Add Image Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAddForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Add New Image</h2>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    {galleryCategories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Image File *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormImage(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Alt Text / Description</label>
                  <input
                    type="text"
                    value={formAlt}
                    onChange={(e) => setFormAlt(e.target.value)}
                    placeholder="Brief description of the image"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button type="submit" disabled={isUploading || !formImage} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3">
                    <Plus className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Add Image'}
                  </Button>
                  <Button type="button" variant="outline" disabled={isUploading} onClick={() => setShowAddForm(false)} className="px-6 py-3">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => { setShowLoginModal(false); setShow2FA(false); setTempSecret(''); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Admin Access</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {show2FA ? (setup2FAUrl ? 'Scan the QR code with your Authenticator app and enter the code below' : 'Enter the 6-digit code from your Authenticator app') : 'Enter the admin password to manage gallery'}
                </p>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {!show2FA && (
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => { setAdminPassword(e.target.value); setLoginError(''); }}
                      placeholder="Enter admin password"
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-center"
                      autoFocus
                    />
                  )}

                  {show2FA && (
                    <div className="space-y-4">
                      {setup2FAUrl && (
                        <div className="flex justify-center mb-4">
                          <img src={setup2FAUrl} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => { setTotpCode(e.target.value.replace(/\D/g, '').substring(0, 6)); setLoginError(''); }}
                        placeholder="000000"
                        className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-mono"
                        autoFocus
                      />
                    </div>
                  )}

                  {loginError && <p className="text-sm text-red-500">{loginError}</p>}
                  <Button type="submit" disabled={isLoggingIn || (show2FA && totpCode.length < 6)} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3">
                    {isLoggingIn ? 'Verifying...' : (show2FA ? 'Verify Code' : 'Unlock')}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
