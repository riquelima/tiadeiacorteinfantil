import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  className = '',
  autoPlay = true,
  interval = 5000
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (autoPlay && images.length > 1) {
      const timer = setInterval(nextSlide, interval);
      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, images.length]);

  if (images.length === 0) {
    return (
      <div className={`relative rounded-3xl bg-gray-200 aspect-square flex items-center justify-center ${className}`}>
        <p className="text-gray-500">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0 aspect-square">
            <img 
              src={image} 
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuZW8gZGlzcG9uw612ZWw8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button
            onClick={previousSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5 text-[#A678E2]" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5 text-[#A678E2]" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
