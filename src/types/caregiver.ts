export interface CaregiverSearchFilters {
  specialty?: string;
  minRate?: number;
  maxRate?: number;
  city?: string;
  state?: string;
  startDate?: Date;
  endDate?: Date;
  timeSlots?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface SearchResult {
  id: string;
  fullName: string;
  specialty: string;
  hourlyRate: number;
  rating: number;
  totalReviews?: number;
  availability: Record<string, boolean>;
  bio: string;
  city?: string;
  state?: string;
  payment?: {
    rate: number;
  };
}
