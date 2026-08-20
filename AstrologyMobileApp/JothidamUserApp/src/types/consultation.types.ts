// Verified against source/src/app/api/consultation/{astrologers,book,list}/route.ts.
// NOTE: GET /consultation/astrologers returns a PLAIN ARRAY (no {astrologers}
// wrapper) — confirmed by reading the route handler directly, contradicting
// an earlier (wrong) secondhand research pass.

export interface Astrologer {
  id: string;
  name: string;
  specialization: string;
  experienceYrs: number;
  ratePerHour: number;
  bio: string | null;
  photoUrl: string | null;
  available: boolean;
}

export interface BookConsultationRequest {
  astrologerId: string;
  date: string;
  timeSlot: string;
}

export interface Booking {
  id: string;
  astrologerName: string;
  date: string;
  timeSlot: string;
  status: string;
  createdAt?: string;
}

export interface BookConsultationResponse {
  message: string;
  booking: Booking;
}

export interface ConsultationListResponse {
  bookings: Booking[];
}
