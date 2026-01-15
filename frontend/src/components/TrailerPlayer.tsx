import React from 'react';
import { PlayIcon, XMarkIcon } from '@heroicons/react/24/outline';
interface TrailerPlayerProps {
  trailerUrl: string;
  movieTitle: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}
const TrailerPlayer: React.FC<TrailerPlayerProps> = ({ 
  trailerUrl, 
  movieTitle, 
  onClose, 
  showCloseButton = false 
}) => {
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const videoId = getYouTubeVideoId(trailerUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
  if (!embedUrl) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không thể tải video
        </h3>
        <p className="text-gray-600 mb-4">
          URL trailer không hợp lệ hoặc không phải YouTube video
        </p>
        <p className="text-sm text-gray-500">
          URL: {trailerUrl}
        </p>
      </div>
    );
  }
  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
      {/* Close button */}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-all"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      )}
      {/* Video container */}
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={`Trailer - ${movieTitle}`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {/* Video info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <h3 className="text-white text-lg font-semibold">
          Trailer - {movieTitle}
        </h3>
      </div>
    </div>
  );
};
export default TrailerPlayer;
