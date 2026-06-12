import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogPosts as defaultPosts, blogCategories, type BlogPost } from '@/lib/data';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Clock, ArrowRight, Tag, Search, Plus, X, Image as ImageIcon, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';
import PageHero from '@/components/PageHero';

// Session token key — actual auth is validated server-side
const ADMIN_TOKEN_KEY = 'vjrack-admin-token';

const STORAGE_KEY = 'vjrack-blog-posts';
const HIDDEN_KEY = 'vjrack-hidden-posts';

// Sanitize user input to prevent XSS
function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function loadCustomPosts(): BlogPost[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveCustomPosts(posts: BlogPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function loadHiddenIds(): string[] {
  try {
    const stored = localStorage.getItem(HIDDEN_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveHiddenIds(ids: string[]) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
}

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [customPosts, setCustomPosts] = useState<BlogPost[]>(loadCustomPosts);
  const [hiddenIds, setHiddenIds] = useState<string[]>(loadHiddenIds);
  const [, navigate] = useLocation();

  // Admin auth state — validated via server-side token
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

  // On mount, verify existing token with server
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

  // Check URL for ?admin=true to trigger login
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

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Buying Guide');
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formTags, setFormTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Combine default + custom posts, exclude hidden, sorted by date
  const allPosts = [...customPosts, ...defaultPosts]
    .filter(p => !hiddenIds.includes(p.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const featuredPost = allPosts.length > 0 ? allPosts[0] : null;
  const regularPosts = filteredPosts.filter(p => selectedCategory !== 'All' || searchTerm || !featuredPost ? true : p.id !== featuredPost.id);

  const resetForm = () => {
    setFormTitle(''); setFormExcerpt(''); setFormContent('');
    setFormCategory('Buying Guide'); setFormImage(null); setFormTags('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = sanitizeText(formTitle.trim()).substring(0, 200);
    const content = sanitizeText(formContent.trim()).substring(0, 10000);
    if (!title || !content) return;

    let imageUrl = 'https://vjrack.com/wp-content/uploads/2025/02/all-typeracks-2-430x573.png';

    if (formImage) {
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
        if (data.success) {
          imageUrl = data.url;
        }
      } catch (e) {
        console.error("Upload failed", e);
      } finally {
        setIsUploading(false);
      }
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 100);
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const excerpt = sanitizeText(formExcerpt.trim()).substring(0, 300) || content.substring(0, 160) + '...';

    const newPost: BlogPost = {
      id: `custom-${Date.now()}`,
      slug,
      title,
      excerpt,
      content: content.split('\n\n').filter(p => p.trim()),
      category: formCategory,
      image: imageUrl,
      author: 'VJ Rack Team',
      date: new Date().toISOString().split('T')[0],
      readTime,
      tags: sanitizeText(formTags).split(',').map(t => t.trim()).filter(Boolean).slice(0, 10),
    };

    const updated = [newPost, ...customPosts];
    setCustomPosts(updated);
    saveCustomPosts(updated);
    resetForm();
    setShowForm(false);
  };

  const handleDeletePost = (id: string) => {
    if (id.startsWith('custom-')) {
      // Remove custom post entirely
      const updated = customPosts.filter(p => p.id !== id);
      setCustomPosts(updated);
      saveCustomPosts(updated);
    } else {
      // Hide default post
      const updated = [...hiddenIds, id];
      setHiddenIds(updated);
      saveHiddenIds(updated);
    }
  };

  // Lock body scroll when form is open
  useEffect(() => {
    document.body.style.overflow = showForm ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <PageHero 
          title="VJ Rack Blog" 
          subtitle="Expert insights on storage solutions, rack systems, and industry best practices. Helping businesses make smarter storage decisions since day one." 
        >
          {isAdmin && (
            <div className="flex items-center justify-center gap-3 w-full">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Article
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

      {/* Search & Filter */}
      <section className="py-8 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {blogCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {selectedCategory === 'All' && !searchTerm && featuredPost && (
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Featured Article</span>
            </div>
            <div
              onClick={() => navigate(`/blog/${featuredPost.slug}`)}
              className="group cursor-pointer grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl border border-border hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative overflow-hidden bg-secondary h-64 lg:h-auto lg:min-h-[400px]">
                <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">{featuredPost.category}</span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(featuredPost.date)}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{featuredPost.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-200">{featuredPost.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{featuredPost.excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full"><Tag className="w-3 h-3" />{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-200">Read Full Article<ArrowRight className="w-4 h-4" /></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {selectedCategory === 'All' && !searchTerm ? 'Latest Articles' : 'Articles'}
              </h2>
              <p className="text-muted-foreground mt-1">{filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} found</p>
            </div>
          </div>

          {regularPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div onClick={() => navigate(`/blog/${post.slug}`)} className="cursor-pointer">
                    <div className="relative overflow-hidden bg-secondary h-56">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">{post.category}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(post.date)}</span>
                        <span className="text-border">•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary font-semibold group-hover:gap-3 transition-all duration-200">Read More<ArrowRight className="w-4 h-4" /></div>
                    </div>
                  </div>
                  {/* Delete button — admin only */}
                  {isAdmin && (
                    <div className="px-6 pb-4 pt-0 border-t border-border mt-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete Article
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                No articles found {searchTerm && `for "${searchTerm}"`} {selectedCategory !== 'All' && `in "${selectedCategory}"`}
              </p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} variant="outline">Clear Filters</Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Need Expert Storage Advice?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our team has years of experience designing storage solutions for every industry.
          </p>
          <Button onClick={() => navigate('/contact')} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-base font-semibold">
            Talk to Our Experts
          </Button>
        </div>
      </section>

      <Footer />

      {/* Add Article Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4 md:p-8" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">Add New Article</h2>
                <p className="text-sm text-muted-foreground mt-1">Create a new blog post for your website</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Article Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., How to Organize Your Warehouse Efficiently"
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={200}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {blogCategories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Short Description</label>
                <textarea
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="A brief summary that appears on the blog listing (auto-generated if left empty)"
                  rows={2}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Article Content *</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write your article content here. Use **bold text** for emphasis. Separate paragraphs with a blank line."
                  rows={8}
                  maxLength={10000}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Tip: Use **text** for bold. Separate paragraphs with blank lines.</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Cover Image</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormImage(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Tags</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  maxLength={150}
                  placeholder="e.g., Warehouse, Storage, Tips (comma separated)"
                  className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-border mt-6">
                <Button type="submit" disabled={isUploading} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3">
                  <Plus className="w-4 h-4 mr-2" />
                  {isUploading ? 'Publishing...' : 'Publish Article'}
                </Button>
                <Button type="button" variant="outline" disabled={isUploading} onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-3">
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
                {show2FA ? (setup2FAUrl ? 'Scan the QR code with your Authenticator app and enter the code below' : 'Enter the 6-digit code from your Authenticator app') : 'Enter the admin password to manage articles'}
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
