import React, { useState, useEffect } from 'react';
    import { useAuthState } from 'react-firebase-hooks/auth';
    import { auth, db } from '../../firebase';
    import {
      collection,
      query,
      where,
      orderBy,
      getDocs,
      addDoc,
      serverTimestamp
    } from 'firebase/firestore';
    import { Review, ReviewStats } from '../../types/review';

    interface ReviewSectionProps {
      caregiverId: string;
    }

    const ReviewSection: React.FC<ReviewSectionProps> = ({ caregiverId }) => {
      const [user] = useAuthState(auth);
      const [reviews, setReviews] = useState<Review[]>([]);
      const [stats, setStats] = useState<ReviewStats>({
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: {}
      });
      const [newReview, setNewReview] = useState({
        rating: 5,
        comment: ''
      });
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      useEffect(() => {
        fetchReviews();
      }, [caregiverId]);

      const fetchReviews = async () => {
        try {
          const q = query(
            collection(db, 'reviews'),
            where('caregiverId', '==', caregiverId),
            orderBy('timestamp', 'desc')
          );

          const querySnapshot = await getDocs(q);
          const reviewsData: Review[] = [];
          const ratingCounts: { [key: number]: number } = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
          };
          let totalRating = 0;

          querySnapshot.forEach((doc) => {
            const review = { id: doc.id, ...doc.data() } as Review;
            reviewsData.push(review);
            ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
            totalRating += review.rating;
          });

          setReviews(reviewsData);
          setStats({
            averageRating: totalRating / reviewsData.length || 0,
            totalReviews: reviewsData.length,
            ratingCounts
          });
        } catch (err) {
          setError('Failed to load reviews');
          console.error('Error fetching reviews:', err);
        } finally {
          setLoading(false);
        }
      };

      const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setError('');

        try {
          await addDoc(collection(db, 'reviews'), {
            caregiverId,
            clientId: user.uid,
            clientName: user.displayName || 'Anonymous',
            rating: newReview.rating,
            comment: newReview.comment,
            timestamp: serverTimestamp()
          });

          setNewReview({ rating: 5, comment: '' });
          await fetchReviews();
        } catch (err) {
          setError('Failed to submit review');
          console.error('Error submitting review:', err);
        } finally {
          setIsSubmitting(false);
        }
      };

      if (loading) {
        return (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        );
      }

      return (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6">Reviews</h2>

          {/* Review Stats */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-500">{stats.totalReviews} reviews</div>
              </div>
              <div className="flex-1 ml-8">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <span className="w-12 text-sm text-gray-600">{rating} stars</span>
                    <div className="flex-1 mx-4 h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-yellow-400 rounded"
                        style={{
                          width: `${(stats.ratingCounts[rating] / stats.totalReviews) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="w-12 text-sm text-gray-600">
                      {stats.ratingCounts[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Write Review Form */}
          {user && user.uid !== caregiverId && (
            <form onSubmit={handleSubmitReview} className="mb-8">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Stars
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 15.585l-7.07 4.425 1.35-7.845L.72 7.775l7.88-.68L10 0l2.4 7.095 7.88.68-5.56 4.39 1.35 7.845z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 font-medium">{review.clientName}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}
        </div>
      );
    };

    export default ReviewSection;
