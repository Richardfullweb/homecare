export interface Review {
      id: string;
      caregiverId: string;
      clientId: string;
      clientName: string;
      rating: number;
      comment: string;
      timestamp: Date;
    }

    export interface ReviewStats {
      averageRating: number;
      totalReviews: number;
      ratingCounts: {
        [key: number]: number;
      };
    }
