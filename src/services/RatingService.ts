import { collection, addDoc, doc, getDoc, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { Rating, CaregiverRating } from '../types/rating';
import { NotificationService } from './NotificationService';
import { AppointmentService } from './AppointmentService';

export class RatingService {
  private static ratingsCollection = 'ratings';
  private static caregiverRatingsCollection = 'caregiverRatings';

  static async createRating(data: Omit<Rating, 'id' | 'createdAt'>) {
    try {
      // Adicionar a avaliação
      const ratingData = {
        ...data,
        createdAt: Timestamp.now(),
      };

      const ratingRef = await addDoc(collection(db, this.ratingsCollection), ratingData);

      // Atualizar a média de avaliações do cuidador
      await this.updateCaregiverRating(data.caregiverId, data.rating);

      // Atualizar o status do agendamento para rated
      await AppointmentService.updateAppointmentRating(
        data.appointmentId,
        data.rating,
        data.comment
      );

      // Notificar o cuidador sobre a avaliação
      await NotificationService.notifyNewRating({
        appointmentId: data.appointmentId,
        userId: data.caregiverId,
        rating: data.rating,
        comment: data.comment,
      });

      return ratingRef.id;
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }

  private static async updateCaregiverRating(caregiverId: string, newRating: number) {
    try {
      const caregiverRatingRef = doc(db, this.caregiverRatingsCollection, caregiverId);

      await runTransaction(db, async (transaction) => {
        const caregiverRatingDoc = await transaction.get(caregiverRatingRef);

        if (!caregiverRatingDoc.exists()) {
          // Primeira avaliação do cuidador
          const initialRating: CaregiverRating = {
            averageRating: newRating,
            totalRatings: 1,
            ratings: {
              1: newRating === 1 ? 1 : 0,
              2: newRating === 2 ? 1 : 0,
              3: newRating === 3 ? 1 : 0,
              4: newRating === 4 ? 1 : 0,
              5: newRating === 5 ? 1 : 0,
            },
            lastUpdated: Timestamp.now(),
          };

          transaction.set(caregiverRatingRef, initialRating);
        } else {
          // Atualizar avaliação existente
          const currentRating = caregiverRatingDoc.data() as CaregiverRating;
          const newTotalRatings = currentRating.totalRatings + 1;
          const newAverageRating = (
            (currentRating.averageRating * currentRating.totalRatings + newRating) /
            newTotalRatings
          );

          const updatedRating: CaregiverRating = {
            averageRating: Number(newAverageRating.toFixed(2)),
            totalRatings: newTotalRatings,
            ratings: {
              ...currentRating.ratings,
              [newRating]: currentRating.ratings[newRating as 1|2|3|4|5] + 1,
            },
            lastUpdated: Timestamp.now(),
          };

          transaction.update(caregiverRatingRef, updatedRating);
        }
      });
    } catch (error) {
      console.error('Error updating caregiver rating:', error);
      throw error;
    }
  }

  static async getCaregiverRating(caregiverId: string): Promise<CaregiverRating | null> {
    try {
      const caregiverRatingRef = doc(db, this.caregiverRatingsCollection, caregiverId);
      const caregiverRatingDoc = await getDoc(caregiverRatingRef);

      if (!caregiverRatingDoc.exists()) {
        return null;
      }

      return caregiverRatingDoc.data() as CaregiverRating;
    } catch (error) {
      console.error('Error getting caregiver rating:', error);
      throw error;
    }
  }
}
