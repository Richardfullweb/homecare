// src/types/notification.ts
import { Timestamp } from 'firebase/firestore';

export type NotificationType = 
  | 'new_appointment_request'      // Cliente solicita -> Cuidador recebe
  | 'appointment_accepted'         // Cuidador aceita -> Cliente recebe
  | 'appointment_rejected'         // Cuidador rejeita -> Cliente recebe
  | 'payment_received'            // Cliente paga -> Cuidador recebe
  | 'new_rating'                  // Cliente avalia -> Cuidador recebe
  | 'service_completed'           // Mensagem de agradecimento -> Ambos recebem

export interface NotificationData {
  appointmentId: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  caregiverName?: string;
  clientName?: string;
  status?: string;
  amount?: number;
  rating?: number;
  comment?: string;
}

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  data: NotificationData | Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  read?: boolean;
  createdAt?: Timestamp;
}
