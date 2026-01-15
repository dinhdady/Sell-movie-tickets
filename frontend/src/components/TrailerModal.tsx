import React, { useEffect } from 'react';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  movieTitle: string;
}
const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const videoId = getYouTubeVideoId(trailerUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) {
    return null;
  }
  
  // Show error message if no valid video URL
  if (!embedUrl) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
            <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không thể tải video
            </h3>
            <p className="text-gray-600 mb-4">
              URL trailer không hợp lệ hoặc không phải YouTube video
            </p>
            {trailerUrl && (
              <p className="text-sm text-gray-500 mb-4 break-all">
                URL: {trailerUrl}
              </p>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
          {/* Video container */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
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
              <h3 className="text-white text-lg font-semibold mb-1">
                Trailer - {movieTitle}
              </h3>
              <p className="text-gray-300 text-sm">
                Nhấn ESC hoặc click bên ngoài để đóng
              </p>
            </div>
          </div>
          {/* Alternative if video not found */}
          {!videoId && (
            <div className="bg-white rounded-lg p-8 text-center">
              <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không thể tải video
              </h3>
              <p className="text-gray-600 mb-4">
                URL trailer không hợp lệ hoặc không phải YouTube video
              </p>
              <p className="text-sm text-gray-500 mb-4">
                URL: {trailerUrl}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TrailerModal;
