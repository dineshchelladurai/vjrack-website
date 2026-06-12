import { testimonials } from '@/lib/data';
import { Star } from 'lucide-react';
import { useLocation } from 'wouter';
import AnimateOnScroll from '@/components/AnimateOnScroll';

// Colors for avatars based on name initial
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Testimonials() {
  const [, navigate] = useLocation();

  return (
    <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <AnimateOnScroll variant="fadeUp">
          <div className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GoogleIcon />
              <div className="flex text-[#FBBC05]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Excellent
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Based on <span className="font-bold text-gray-900">45+ reviews</span> from our verified customers. 
              See what people are saying about VJ Rack.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <AnimateOnScroll
              key={testimonial.id}
              variant="fadeUp"
              delay={index * 0.1}
            >
              <a
                href={testimonial.link || 'https://www.google.com/search?sca_esv=09fac29a4686d309&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOSi2R2xulc4yUUiGdkbrOeQiufKyIjvaPfgmUXDwiyW-a3UB8TIFmyeTkjVKbKTgLqlqV5eQaTKkpfaMJ5n70KCRCDn5UGKhhm3Cyy7vVb5EktWzf95KabR_qFobdVtd0BfvAng%3D&q=VJ+Rack-supermarket+rack+manufacturer+Reviews'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 h-full flex flex-col hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow duration-300 block cursor-pointer"
              >
                {/* Header: Avatar, Name, Time, Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {testimonial.image ? (
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-medium text-lg ${getAvatarColor(testimonial.name)}`}>
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-[15px] text-gray-900 leading-tight">
                        {testimonial.name}
                      </h4>
                      <div className="text-[13px] text-gray-500 mt-0.5 flex items-center gap-1">
                        {testimonial.role === 'Local Guide' && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
                            Local Guide
                            <span className="mx-0.5">·</span>
                          </span>
                        )}
                        {testimonial.time || '1 month ago'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <GoogleIcon />
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-[18px] h-[18px] fill-[#FBBC05] text-[#FBBC05]" />
                  ))}
                  {[...Array(5 - (testimonial.rating || 5))].map((_, i) => (
                    <Star key={i} className="w-[18px] h-[18px] fill-gray-200 text-gray-200" />
                  ))}
                </div>

                {/* Review Content */}
                <div className="text-[15px] text-[#3c4043] leading-relaxed flex-grow">
                  {testimonial.content}
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Bottom CTA */}
        <AnimateOnScroll variant="fadeUp" delay={0.3}>
          <div className="mt-12 text-center">
            <a 
              href="https://www.google.com/search?sca_esv=09fac29a4686d309&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOSi2R2xulc4yUUiGdkbrOeQiufKyIjvaPfgmUXDwiyW-a3UB8TIFmyeTkjVKbKTgLqlqV5eQaTKkpfaMJ5n70KCRCDn5UGKhhm3Cyy7vVb5EktWzf95KabR_qFobdVtd0BfvAng%3D&q=VJ+Rack-supermarket+rack+manufacturer+Reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2.5 rounded-full font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Write a Review
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
