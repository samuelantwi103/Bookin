import type {
  Building,
  Facility,
  Booking,
  User,
  BookingPayload,
  FacilityPayload,
  UserPayload,
  BuildingPayload,
  AvailabilitySlot,
} from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body.error || body.message || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  /* ── Buildings ── */
  fetchBuildings: () =>
    request<Building[]>('/buildings'),
  fetchBuildingById: (id: number) =>
    request<Building>(`/buildings/${id}`),
  createBuilding: (data: BuildingPayload) =>
    request<Building>('/buildings', { method: 'POST', body: JSON.stringify(data) }),
  updateBuilding: (id: number, data: BuildingPayload) =>
    request<Building>(`/buildings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBuilding: (id: number) =>
    request<void>(`/buildings/${id}`, { method: 'DELETE' }),

  /* ── Facilities ── */
  fetchFacilities: (buildingId?: number) =>
    request<Facility[]>(buildingId ? `/facilities?buildingId=${buildingId}` : '/facilities'),
  fetchFacilityById: (id: number) =>
    request<Facility>(`/facilities/${id}`),
  createFacility: (data: FacilityPayload) =>
    request<Facility>('/facilities', { method: 'POST', body: JSON.stringify(data) }),
  updateFacility: (id: number, data: FacilityPayload) =>
    request<Facility>(`/facilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFacility: (id: number) =>
    request<void>(`/facilities/${id}`, { method: 'DELETE' }),

  /* ── Users ── */
  fetchUsers: () =>
    request<User[]>('/users'),
  createUser: (data: UserPayload) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: UserPayload) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: number) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),

  /* ── Bookings ── */
  fetchBookings: (userId?: number) =>
    request<Booking[]>(userId ? `/bookings?userId=${userId}` : '/bookings'),
  fetchBookingById: (id: number) =>
    request<Booking>(`/bookings/${id}`),
  createBooking: (data: BookingPayload) =>
    request<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  cancelBooking: (id: number) =>
    request<Booking>(`/bookings/${id}`, { method: 'DELETE' }),

  /* ── Availability ── */
  fetchAvailability: (facilityId: number, date: string) =>
    request<AvailabilitySlot[]>(`/availability?facilityId=${facilityId}&date=${date}`),

  /* ── Auth ── */
  login: (email: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
};
