import { useState } from 'react';
import { videos } from '@/lib/data';
import { Play } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Don't render the section if there are no videos
  if (videos.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <AnimateOnScroll variant="fadeUp">
          <div className="mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Videos
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              Showcasing Excellence in Action - Watch our products in real-world installations and demonstrations.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {videos.map((video, index) => (
            <AnimateOnScroll
              key={video.id}
              variant="scale"
              delay={index * 0.12}
            >
              <div
                className="group relative overflow-hidden rounded-lg bg-secondary h-64 md:h-80 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => setSelectedVideo(video.url)}
              >
                {/* Video Thumbnail — #t=0.5 forces browser to show a preview frame */}
                <video
                  src={`${video.url}#t=0.5`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  muted
                  preload="metadata"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
                  <p className="text-white font-semibold text-base md:text-lg">
                    {video.title}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* YouTube CTA */}
        <AnimateOnScroll variant="fadeUp" delay={0.3}>
          <div className="mt-12 md:mt-16 text-center">
            <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-xl mx-auto">
              Explore our full library of rack installations, factory tours, and product demos on YouTube.
            </p>
            <a
              href="https://www.youtube.com/@rack_manufacturer_retailstores"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#FF0000] hover:bg-[#cc0000] text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 group"
            >
              {/* YouTube Icon */}
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>Watch More on YouTube</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </AnimateOnScroll>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}
