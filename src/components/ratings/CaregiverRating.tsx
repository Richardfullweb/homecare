import React from 'react';
import { useEffect, useState } from 'react';
import { RatingService } from '../../services/RatingService';
import { CaregiverRating as ICaregiverRating } from '../../types/rating';
import RatingStars from './RatingStars';

interface CaregiverRatingProps {
  caregiverId: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export default function CaregiverRating({ caregiverId, size = 'md', showDetails = false }: CaregiverRatingProps) {
  const [rating, setRating] = useState<ICaregiverRating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRating = async () => {
      try {
        const data = await RatingService.getCaregiverRating(caregiverId);
        setRating(data);
      } catch (error) {
        console.error('Error loading caregiver rating:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRating();
  }, [caregiverId]);

  if (loading) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="text-sm text-gray-500">
        Sem avaliações
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-2">
        <RatingStars rating={Math.round(rating.averageRating)} readOnly size={size} />
        <span className="text-sm text-gray-600">
          ({rating.averageRating.toFixed(1)})
        </span>
        <span className="text-sm text-gray-500">
          · {rating.totalRatings} {rating.totalRatings === 1 ? 'avaliação' : 'avaliações'}
        </span>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-3">{star}</span>
              <RatingStars rating={star} readOnly size="sm" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{
                    width: `${(rating.ratings[star as keyof typeof rating.ratings] / rating.totalRatings) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-500 w-12 text-right">
                {rating.ratings[star as keyof typeof rating.ratings]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
