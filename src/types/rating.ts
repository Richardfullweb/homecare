export interface Rating {
  id?: string;
  appointmentId: string;
  caregiverId: string;
  clientId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt?: any; // Firestore Timestamp
}

export interface CaregiverRating {
  averageRating: number;
  totalRatings: number;
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  lastUpdated: any; // Firestore Timestamp
}
