import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { NotificationService } from '../../../services/NotificationService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { caregiverId } = req.body;

  if (!caregiverId) {
    return res.status(400).json({ message: 'caregiverId is required' });
  }

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
    
    return res.status(200).json({ 
      message: `Created ${promises.length} notifications for caregiver ${caregiverId}`,
      count: promises.length
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
