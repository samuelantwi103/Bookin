# API Documentation — Campus Facility Booking System

> **Base URL**: `https://<your-backend-host>:8080`  
> **Interactive Docs**: Swagger UI available at `/swagger-ui/index.html`  
> **Format**: All endpoints accept and return `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Buildings](#2-buildings)
3. [Facilities](#3-facilities)
4. [Bookings](#4-bookings)
5. [Availability](#5-availability)
6. [Users](#6-users)
7. [Error Handling](#7-error-handling)

---

## 1. Authentication

### `POST /auth/login`

Authenticate a user with email and password.

**Request Body:**
```json
{
  "email": "samuel@ug.edu.gh",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Samuel Antwi",
  "email": "samuel@ug.edu.gh",
  "role": "USER"
}
```

**Error Responses:**
- `400 Bad Request` — Missing email or password
- `401 Unauthorized` — Invalid credentials

---

### `POST /auth/signup`

Register a new user account. Default role is `USER`.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@ug.edu.gh",
  "password": "securepass"
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "name": "Jane Doe",
  "email": "jane@ug.edu.gh",
  "role": "USER"
}
```

**Validation Rules:**
- `name` — Required, not blank
- `email` — Required, must be valid email format, unique
- `password` — Required, minimum 6 characters

**Error Responses:**
- `400 Bad Request` — Validation failed or email already registered

---

## 2. Buildings

### `GET /buildings`

Retrieve all campus buildings.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Balme Library",
    "code": "BL",
    "campus": "Main Campus",
    "description": "Central university library",
    "imageUrl": null
  }
]
```

---

### `GET /buildings/{id}`

Retrieve a specific building by ID.

**Parameters:**
| Param | Type | Location | Description |
|-------|------|----------|-------------|
| `id`  | Long | Path     | Building ID |

**Response (200 OK):** Single building object  
**Error:** `404 Not Found` — Building not found

---

### `POST /buildings`

Create a new building (admin).

**Request Body:**
```json
{
  "name": "New Science Block",
  "code": "NSB",
  "campus": "Main Campus",
  "description": "Science research facility"
}
```

**Response (201 Created):** Created building object

---

### `PUT /buildings/{id}`

Update an existing building.

**Request Body:** Same as POST  
**Response (200 OK):** Updated building object  
**Error:** `404 Not Found`

---

### `DELETE /buildings/{id}`

Delete a building.

**Response (204 No Content)**  
**Error:** `404 Not Found`

---

## 3. Facilities

### `GET /facilities`

Retrieve all facilities. Optionally filter by building.

**Query Parameters:**
| Param       | Type | Required | Description                  |
|-------------|------|----------|------------------------------|
| `buildingId`| Long | No       | Filter by building ID        |

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Main Reading Hall",
    "building": {
      "id": 1,
      "name": "Balme Library",
      "code": "BL",
      "campus": "Main Campus"
    },
    "type": "STUDY_ROOM",
    "location": "Ground Floor",
    "floor": 0,
    "roomNumber": "G01",
    "capacity": 200,
    "description": "Large reading hall",
    "amenities": "WiFi, Power outlets",
    "imageUrl": null
  }
]
```

---

### `GET /facilities/{id}`

Retrieve a specific facility by ID.

**Parameters:**
| Param | Type | Location | Description  |
|-------|------|----------|--------------|
| `id`  | Long | Path     | Facility ID  |

**Response (200 OK):** Single facility object  
**Error:** `404 Not Found`

---

### `POST /facilities`

Create a new facility.

**Request Body:**
```json
{
  "name": "Seminar Room A",
  "building": { "id": 1 },
  "type": "SEMINAR_ROOM",
  "location": "First Floor",
  "floor": 1,
  "roomNumber": "101",
  "capacity": 50,
  "description": "Medium seminar room",
  "amenities": "Projector, Whiteboard"
}
```

**Facility Types:** `LECTURE_HALL`, `SEMINAR_ROOM`, `STUDY_ROOM`, `COMPUTER_LAB`, `LIBRARY`, `CONFERENCE_ROOM`, `AUDITORIUM`, `SPORTS_FACILITY`, `COMMON_ROOM`, `WORKSHOP`, `LABORATORY`

**Response (201 Created):** Created facility object

---

### `PUT /facilities/{id}`

Update an existing facility.

**Request Body:** Same as POST  
**Response (200 OK):** Updated facility object  
**Error:** `404 Not Found`

---

### `DELETE /facilities/{id}`

Delete a facility.

**Response (204 No Content)**  
**Error:** `404 Not Found`

---

## 4. Bookings

### `GET /bookings`

Retrieve all bookings. Optionally filter by user.

**Query Parameters:**
| Param   | Type | Required | Description          |
|---------|------|----------|----------------------|
| `userId`| Long | No       | Filter by user ID    |

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "facility": {
      "id": 1,
      "name": "Main Reading Hall",
      "capacity": 200
    },
    "user": {
      "id": 1,
      "name": "Samuel Antwi",
      "email": "samuel@ug.edu.gh",
      "role": "USER"
    },
    "date": "2026-03-05",
    "startTime": "09:00:00",
    "endTime": "10:30:00",
    "status": "CONFIRMED",
    "purpose": "Group study session"
  }
]
```

---

### `GET /bookings/{id}`

Retrieve a specific booking by ID.

**Response (200 OK):** Single booking object  
**Error:** `404 Not Found`

---

### `POST /bookings`

Create a new booking. Automatically checks for time conflicts.

**Request Body:**
```json
{
  "facilityId": 1,
  "userId": 1,
  "date": "2026-03-05",
  "startTime": "09:00",
  "endTime": "10:30",
  "purpose": "Group study session"
}
```

**Validation:**
- All fields except `purpose` are required
- `startTime` must be before `endTime`
- No overlapping bookings with status `CONFIRMED` or `PENDING` on the same facility

**Response (201 Created):** Created booking object  
**Error Responses:**
- `400 Bad Request` — Invalid input
- `404 Not Found` — Facility or user not found
- `409 Conflict` — Time slot already booked

---

### `PUT /bookings/{id}`

Update an existing booking.

**Request Body:**
```json
{
  "facilityId": 1,
  "userId": 1,
  "date": "2026-03-05",
  "startTime": "10:00",
  "endTime": "11:00",
  "status": "CONFIRMED",
  "purpose": "Updated purpose"
}
```

**Status Values:** `CONFIRMED`, `PENDING`, `CANCELLED`

**Response (200 OK):** Updated booking object  
**Error Responses:**
- `404 Not Found` — Booking, facility, or user not found
- `409 Conflict` — Updated time conflicts with existing booking

---

### `DELETE /bookings/{id}`

Cancel a booking (soft delete — sets status to `CANCELLED`).

**Response (200 OK):**
```json
{
  "message": "Booking cancelled successfully"
}
```

**Error:** `404 Not Found`

---

## 5. Availability

### `GET /availability`

Check facility availability for a specific date. Returns 30-minute time slots from 08:00 to 20:00.

**Query Parameters:**
| Param       | Type   | Required | Description                      |
|-------------|--------|----------|----------------------------------|
| `facilityId`| Long   | Yes      | Facility to check                |
| `date`      | String | Yes      | Date in `YYYY-MM-DD` format      |

**Response (200 OK):**
```json
[
  {
    "startTime": "08:00:00",
    "endTime": "08:30:00",
    "available": true
  },
  {
    "startTime": "08:30:00",
    "endTime": "09:00:00",
    "available": true
  },
  {
    "startTime": "09:00:00",
    "endTime": "09:30:00",
    "available": false
  }
]
```

**Slot Structure:**
- 24 slots per day (08:00–20:00, 30 minutes each)
- `available: false` indicates an existing `CONFIRMED` or `PENDING` booking overlaps that slot

---

## 6. Users

### `GET /users`

Retrieve all users (admin).

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Samuel Antwi",
    "email": "samuel@ug.edu.gh",
    "role": "USER"
  }
]
```

> **Note:** Password field is never included in responses.

---

### `GET /users/{id}`

Retrieve a specific user by ID.

**Response (200 OK):** Single user object  
**Error:** `404 Not Found`

---

### `POST /users`

Create a new user (admin).

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@ug.edu.gh",
  "password": "password123",
  "role": "USER"
}
```

**Response (201 Created):** Created user object (password excluded)

---

### `PUT /users/{id}`

Update user details (name, email, role only).

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@ug.edu.gh",
  "role": "ADMIN"
}
```

**Response (200 OK):** Updated user object  
**Error:** `404 Not Found`

---

### `DELETE /users/{id}`

Delete a user.

**Response (204 No Content)**  
**Error:** `404 Not Found`

---

## 7. Error Handling

All error responses follow a consistent format:

```json
{
  "timestamp": "2026-03-02T12:00:00.000",
  "status": 404,
  "error": "User not found with id: 99"
}
```

**Validation errors** include additional field details:
```json
{
  "timestamp": "2026-03-02T12:00:00.000",
  "status": 400,
  "error": "Validation failed",
  "fieldErrors": {
    "name": "Name is required",
    "email": "Email must be valid"
  }
}
```

### HTTP Status Codes Used

| Code | Meaning                          |
|------|----------------------------------|
| 200  | Success                          |
| 201  | Created                          |
| 204  | No Content (successful deletion) |
| 400  | Bad Request / Validation Error   |
| 401  | Unauthorized                     |
| 404  | Resource Not Found               |
| 409  | Conflict (booking or integrity)  |
| 500  | Internal Server Error            |

---

## Demo Accounts

| Name | Email | Password | Role |
|------|-------|----------|------|
| Samuel Antwi | samuel@ug.edu.gh | password123 | USER |
| Admin User | admin@ug.edu.gh | password123 | ADMIN |
| Kwame Mensah | kwame@ug.edu.gh | password123 | USER |
| Ama Serwaa | ama@ug.edu.gh | password123 | USER |
