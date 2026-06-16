import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogPosts as defaultPosts, blogCategories, type BlogPost } from '@/lib/data';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Clock, ArrowRight, Tag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';
import PageHero from '@/components/PageHero';

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [serverPosts, setServerPosts] = useState<BlogPost[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.blogs) {
          // Format server posts to match BlogPost interface if needed
          setServerPosts(data.blogs);
        }
      })
      .catch(console.error);
  }, []);

  const allPosts = [...serverPosts, ...defaultPosts];

  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <PageHero 
          title="Insights & News" 
          subtitle="Expert advice on storage solutions, retail display strategies, and industry news." 
        />

        {/* Filter and Search Section */}
        <section className="py-8 bg-white border-b border-gray-200 sticky top-16 md:top-[68px] z-30 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
              
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide w-full lg:w-auto">
                {blogCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-72 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                />
              </div>

            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 flex-grow">
          <div className="container mx-auto px-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-500">We couldn't find any articles matching your search criteria.</p>
                <Button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                  variant="outline"
                  className="mt-6"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article 
                    key={post.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col cursor-pointer"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    <div className="relative overflow-hidden aspect-[16/10]">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary shadow-sm flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-xs text-gray-500 mb-4 gap-4">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-grow">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <span className="text-sm font-medium text-gray-900">
                          By {post.author}
                        </span>
                        <span className="text-primary text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white mt-auto">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Need Expert Advice for Your Space?</h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              Our team of specialists can help you design the perfect storage and display solution tailored to your exact needs.
            </p>
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3 h-auto text-lg rounded-full"
            >
              Get a Free Consultation
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
