export interface Appointment {
  id: string;
  caregiverId: string;
  clientId: string;
  clientName?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  description?: string;
  address?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  caregiverName?: string;
  caregiverImageUrl?: string;
  serviceType?: string;
  price?: number;
  rated?: boolean;
  totalAmount?: number;
  hours?: number;
  hourlyRate?: number;
  platformFee?: number;
  caregiverAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DailyAvailability {
  date: string;
  timeSlots: TimeSlot[];
}
