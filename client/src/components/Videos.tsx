import { useState } from 'react';
import { videos } from '@/lib/data';
import { Play } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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
                {/* Video Thumbnail */}
                <video
                  src={video.url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  muted
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
