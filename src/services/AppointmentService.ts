import { collection, addDoc, doc, getDoc, updateDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment } from '../types/appointment';
import { NotificationService } from './NotificationService';

export class AppointmentService {
  private static collection = 'appointments';

  static async createAppointment(data: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = Timestamp.now();
      const appointmentData = {
        ...data,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, this.collection), appointmentData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  static async getAppointment(id: string) {
    try {
      const docRef = doc(db, this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Appointment not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Appointment;
    } catch (error) {
      console.error('Error getting appointment:', error);
      throw error;
    }
  }

  static async updateAppointmentStatus(id: string, status: Appointment['status']) {
    try {
      const appointmentRef = doc(db, this.collection, id);
      await updateDoc(appointmentRef, {
        status,
        updatedAt: Timestamp.now(),
      });

      // Buscar o agendamento atualizado para enviar notificações
      const appointment = await this.getAppointment(id);

      // Enviar notificação apropriada
      switch (status) {
        case 'accepted':
          await NotificationService.notifyAppointmentAccepted({
            appointmentId: id,
            userId: appointment.clientId,
            patientName: appointment.clientName || '',
            date: appointment.date.toDate(),
            description: appointment.description,
            price: appointment.price,
            duration: appointment.duration,
            address: appointment.address,
          });
          break;
        case 'rejected':
          await NotificationService.notifyAppointmentRejected({
            appointmentId: id,
            userId: appointment.clientId,
            patientName: appointment.clientName || '',
            date: appointment.date.toDate(),
            description: appointment.description,
          });
          break;
        case 'completed':
          await NotificationService.notifyAppointmentCompleted({
            appointmentId: id,
            userId: appointment.clientId,
            patientName: appointment.clientName || '',
            date: appointment.date.toDate(),
          });

          // Enviar notificação para avaliar o atendimento
          await NotificationService.notifyEvaluationRequest({
            appointmentId: id,
            userId: appointment.clientId,
            patientName: appointment.clientName || '',
            date: appointment.date.toDate(),
          });
          break;
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  static async updateAppointmentRating(id: string, rating: number, comment?: string) {
    try {
      const now = Timestamp.now();
      const appointmentRef = doc(db, this.collection, id);
      await updateDoc(appointmentRef, {
        rated: true,
        rating: {
          rating,
          comment,
          createdAt: now,
        },
        updatedAt: now,
      });
    } catch (error) {
      console.error('Error updating appointment rating:', error);
      throw error;
    }
  }

  static async getCaregiverAppointments(caregiverId: string) {
    try {
      const q = query(
        collection(db, this.collection),
        where('caregiverId', '==', caregiverId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error) {
      console.error('Error getting caregiver appointments:', error);
      throw error;
    }
  }

  static async getClientAppointments(clientId: string) {
    try {
      const q = query(
        collection(db, this.collection),
        where('clientId', '==', clientId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error) {
      console.error('Error getting client appointments:', error);
      throw error;
    }
  }
}
