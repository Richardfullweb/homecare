import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { NotificationService } from '../services/NotificationService';

export async function createPendingNotifications(caregiverId: string) {
  try {
    // Buscar todas as solicitações pendentes
    const q = query(
      collection(db, "appointments"),
      where("caregiverId", "==", caregiverId),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);
    
    // Criar notificações para cada solicitação
    const promises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      return NotificationService.notifyNewAppointment({
        appointmentId: doc.id,
        userId: caregiverId,
        patientName: data.clientName,
        date: data.date.toDate(),
        description: data.description,
        price: data.price,
        duration: data.duration,
        address: data.address
      });
    });

    await Promise.all(promises);
    console.log(`Created ${promises.length} notifications for caregiver ${caregiverId}`);
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}
