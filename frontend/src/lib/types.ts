/* ========================================
   bookin — TypeScript Type Definitions
   ======================================== */

export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Building {
  id: number;
  name: string;
  code: string;
  campus: string;
  description: string;
  imageUrl: string | null;
}

export type FacilityType =
  | 'LECTURE_HALL'
  | 'COMPUTER_LAB'
  | 'SEMINAR_ROOM'
  | 'AUDITORIUM'
  | 'LIBRARY_SPACE'
  | 'CONFERENCE_ROOM'
  | 'LABORATORY'
  | 'STUDIO'
  | 'BOARDROOM'
  | 'STUDY_ROOM'
  | 'SPORTS_FACILITY';

export interface Facility {
  id: number;
  name: string;
  building: Building | null;
  type: FacilityType;
  location: string;
  capacity: number;
  floor: string | null;
  roomNumber: string | null;
  description: string | null;
  amenities: string | null;
  imageUrl: string | null;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'PENDING';

export interface Booking {
  id: number;
  facility: Facility;
  user: User;
  date: string;        // "YYYY-MM-DD"
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  status: BookingStatus;
  purpose: string | null;
}

export interface AvailabilitySlot {
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  available: boolean;
}

export interface BookingPayload {
  facilityId: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  purpose?: string;
}

export interface FacilityPayload {
  name: string;
  buildingId: number;
  type: FacilityType;
  location: string;
  capacity: number;
  floor?: string;
  roomNumber?: string;
  description?: string;
  amenities?: string;
  imageUrl?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  role: Role;
}

export interface BuildingPayload {
  name: string;
  code: string;
  campus: string;
  description: string;
  imageUrl?: string;
}

/* Label maps for display */
export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  LECTURE_HALL: 'Lecture Hall',
  COMPUTER_LAB: 'Computer Lab',
  SEMINAR_ROOM: 'Seminar Room',
  AUDITORIUM: 'Auditorium',
  LIBRARY_SPACE: 'Library Space',
  CONFERENCE_ROOM: 'Conference Room',
  LABORATORY: 'Laboratory',
  STUDIO: 'Studio',
  BOARDROOM: 'Boardroom',
  STUDY_ROOM: 'Study Room',
  SPORTS_FACILITY: 'Sports Facility',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
};

export const FACILITY_TYPE_ICONS: Record<FacilityType, string> = {
  LECTURE_HALL: '🎓',
  COMPUTER_LAB: '💻',
  SEMINAR_ROOM: '📋',
  AUDITORIUM: '🎭',
  LIBRARY_SPACE: '📚',
  CONFERENCE_ROOM: '🤝',
  LABORATORY: '🔬',
  STUDIO: '🎬',
  BOARDROOM: '👔',
  STUDY_ROOM: '📖',
  SPORTS_FACILITY: '⚽',
};
