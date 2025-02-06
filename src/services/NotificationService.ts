import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  onSnapshot,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

const firestore = db;

export class NotificationService {
  static async createNotification(notification: {
    userId: string;
    type: string;
    message: string;
    read?: boolean;
    link?: string;
  }) {
    try {
      await addDoc(collection(firestore, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
        read: notification.read || false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(firestore, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const querySnapshot = await getDocs(
        query(notificationsRef, where('userId', '==', userId), where('read', '==', false))
      );
      
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
    const notificationsRef = collection(firestore, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  }

  static async notifyNewAppointment(notification: {
    userId: string;
    appointmentId: string;
    message: string;
  }) {
    return this.createNotification({
      ...notification,
      type: 'new-appointment',
      link: `/appointments/${notification.appointmentId}`
    });
  }

  static async notifyAppointmentAccepted(notification: {
    userId: string;
    appointmentId: string;
    message: string;
  }) {
    return this.createNotification({
      ...notification,
      type: 'appointment-accepted',
      link: `/appointments/${notification.appointmentId}`
    });
  }

  static async notifyAppointmentRejected(notification: {
    userId: string;
    appointmentId: string;
    message: string;
  }) {
    return this.createNotification({
      ...notification,
      type: 'appointment-rejected',
      link: `/appointments/${notification.appointmentId}`
    });
  }

  static async notifyAppointmentCompleted(notification: {
    userId: string;
    appointmentId: string;
    message: string;
  }) {
    return this.createNotification({
      ...notification,
      type: 'appointment-completed',
      link: `/appointments/${notification.appointmentId}`
    });
  }

  static async notifyEvaluationRequest(notification: {
    userId: string;
    appointmentId: string;
    message: string;
  }) {
    return this.createNotification({
      ...notification,
      type: 'evaluation-request',
      link: `/appointments/${notification.appointmentId}`
    });
  }

  static async notifyNewRating(notification: {
    userId: string;
    ratingId: string;
    message: string;
  }) {
    return this.createNotification({
      ...notification,
      type: 'new-rating',
      link: `/ratings/${notification.ratingId}`
    });
  }
}
