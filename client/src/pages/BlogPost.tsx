import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogPosts, type BlogPost as BlogPostType } from '@/lib/data';
import { useLocation, useParams } from 'wouter';
import { Calendar, Clock, ArrowLeft, Tag, Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';
import DOMPurify from 'dompurify';

function loadCustomPosts(): BlogPostType[] {
  try {
    const stored = localStorage.getItem('vjrack-blog-posts');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  const allPosts = [...loadCustomPosts(), ...blogPosts];
  const post = allPosts.find(p => p.slug === params.slug);

  if (!post) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')} className="bg-primary hover:bg-primary/90 text-white">
            Back to Blog
          </Button>
        </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get related posts (same category, excluding current)
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
    .slice(0, 3);

  // Simple markdown-like bold text parser & XSS Sanitization
  const renderContent = (text: string) => {
    // Sanitize first to prevent any HTML injection
    const cleanText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    const parts = cleanText.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="font-bold text-foreground">{part}</strong> : part
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Breadcrumb */}
      <section className="py-4 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/blog')} className="hover:text-primary transition-colors">Blog</button>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-none">{post.title}</span>
          </div>
        </div>
      </section>

      {/* Article Header */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </button>

            {/* Category badge */}
            <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              {post.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-8 border-b border-border">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {post.readTime}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-primary transition-colors ml-auto"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="pb-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-lg bg-secondary aspect-[16/9]">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {post.content.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-base md:text-lg text-muted-foreground leading-relaxed"
                >
                  {renderContent(paragraph)}
                </p>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-secondary text-sm text-muted-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Box */}
            <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 md:p-10 border border-primary/20">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                Need Help Choosing the Right Rack?
              </h3>
              <p className="text-muted-foreground mb-6">
                Our experts can help you find the perfect storage solution for your business. Get a free consultation and custom quote today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('/contact')}
                  className="bg-primary hover:bg-primary/90 text-white px-6"
                >
                  Contact Us
                </Button>
                <Button
                  onClick={() => navigate('/shop')}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white px-6"
                >
                  Browse Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <article
                    key={related.id}
                    onClick={() => {
                      navigate(`/blog/${related.slug}`);
                      window.scrollTo(0, 0);
                    }}
                    className="group cursor-pointer bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative overflow-hidden bg-secondary h-44">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary/90 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                          {related.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(related.date)}
                        <span className="text-border">•</span>
                        {related.readTime}
                      </div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

        <Footer />
      </div>
    </PageTransition>
  );
}
