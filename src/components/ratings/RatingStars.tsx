import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingStars({ rating, onChange, readOnly = false, size = 'md' }: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const starSize = sizes[size];

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          className={`focus:outline-none ${!readOnly ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        >
          <Star
            className={`${starSize} ${
              (hoverRating || rating) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
