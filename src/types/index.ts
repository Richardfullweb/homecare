export type AppointmentStatus = 
  | 'pending'    // Cliente solicitou
  | 'accepted'   // Cuidador aceitou
  | 'paid'       // Cliente pagou
  | 'completed'  // Serviço prestado
  | 'rated'      // Cliente avaliou
  | 'cancelled'; // Cancelado

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  type?: 'client' | 'caregiver';
  phone?: string;
  address?: string;
  bio?: string;
  specialties?: string[];
  role?: string;
  fullName?: string;
  imageUrl?: string;
  phoneNumber?: string;
  favorites?: string[];
  availability?: {
    [key: string]: { start: string; end: string; }[];
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface Appointment {
  id: string;
  clientId: string;
  caregiverId: string;
  caregiverName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  amount?: number;
  notes?: string;
  createdAt: any;
  updatedAt: any;
  paymentDate?: any;
  completedDate?: any;
  ratingDate?: any;
  rating?: number;
  ratingComment?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface CaregiverRating {
  id: string;
  appointmentId: string;
  caregiverId: string;
  clientId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface AppointmentGroup {
  date: string;
  appointments: Appointment[];
}
