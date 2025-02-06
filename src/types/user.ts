export type ProfessionalType = 'caregiver' | 'doctor' | 'physiotherapist';

export interface PaymentDetails {
  type: 'hourly' | 'daily';
  rate: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  photoURL?: string;
  name?: string;
  role: 'client' | ProfessionalType;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  specialty?: string;
  specialties?: string[];
  experience?: string;
  education?: string;
  languages?: string[];
  certifications?: string[];
  availability?: {
    [key: string]: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
  payment?: PaymentDetails;
  favorites?: string[];
}
