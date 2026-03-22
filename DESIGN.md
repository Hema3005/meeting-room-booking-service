# DESIGN.md

## 1. Overview

This project implements a **Meeting Room Booking Service** using **Node.js, Fastify, and PostgreSQL**.

The system allows:

- Creating meeting rooms

- Booking rooms with validation rules

- Preventing overlapping bookings

- Idempotent booking creation

- Cancelling bookings with a grace period

- Generating room utilization reports

The architecture follows a layered structure:

`Routes → Controllers → Services → Repository → Database`

This separation keeps business logic independent from HTTP routing and persistence.

------------------------------------------------------------------------

# 2. Data Model

## Rooms Table

| Column      | Type             | Description                                |
|-------------|------------------|--------------------------------------------|
| id          | UUID / SERIAL    | Primary key                                |
| name        | TEXT             | Unique room name (case‑insensitive)       |
| capacity    | INTEGER          | Number of people supported                 |
| floor       | INTEGER          | Floor number                               |
| amenities   | TEXT[]           | List of amenities                          |
| created_at  | TIMESTAMP        | Creation time                              |

**Constraints**

 `name` must be **unique (case‑insensitive)**.

**Example:**

    Room
    {
      id: 1,
      name: "Conference A",
      capacity: 10,
      floor: 2,
      amenities: ["projector", "whiteboard"]
    }

**Index:**

`CREATE UNIQUE INDEX unique_room_name
ON rooms (LOWER(name));`

------------------------------------------------------------------------

## Bookings Table

| Column            | Type        | Description             |
|-------------------|-------------|-------------------------|
| id                | UUID        | Primary key             |
| room_id           | FK          | Reference to room       |
| title             | TEXT        | Meeting title           |
| organizer_email   | TEXT        | Organizer               |
| start_time        | TIMESTAMP   | Meeting start           |
| end_time          | TIMESTAMP   | Meeting end             |
| created_at        | TIMESTAMP   | Booking time            |
| idempotency_key   | TEXT        | Prevent duplicate booking |
| status            | TEXT        | DEFAULT 'confirmed'.    |


**Constraints:** 

`start_time < end_time` - Duration **15 minutes -- 4
hours** - Booking allowed **Mon--Fri between 08:00--20:00**

------------------------------------------------------------------------

## Idempotency Table

| Column Name      | Data Type | Constraints / Description                     |
|------------------|-----------|-----------------------------------------------|
| id               | SERIAL    | Primary Key                                  |
| organizer_email  | TEXT      | Email of the booking organizer                |
| idempotency_key  | TEXT      | Unique key to ensure idempotent booking calls |
| booking_id       | INTEGER   | Associated booking ID                         |
| created_at       | TIMESTAMP | Timestamp when the record was created         |

**Constraints**

- `PRIMARY KEY (id)`
- `UNIQUE (organizer_email, idempotency_key)`

------------------------------------------------------------------------

# 3. Preventing Booking Overlaps

Overlap validation occurs **before inserting a booking**.

Before creating a booking, the system checks if the room already has a confirmed booking that overlaps with the requested time.

Query used:

    SELECT 1 FROM bookings
    WHERE room_id = $1
    AND start_time < $newEnd
    AND end_time > $newStart

If any record exists → booking rejected.

Overlap logic:

Two bookings overlap if:

    existing.start < new.end
    AND existing.end > new.start

If an overlap exists, the API returns:

    409 Conflict 
    Room already booked for this time

Cancelled bookings are ignored.

This prevents: - partial overlap - full overlap - same start/end overlap



------------------------------------------------------------------------

# 4. Error Handling Strategy

API follows structured error responses.

Example:

    {
      "error": "ValidationError",
      "message": "Booking cannot be cancelled less than 1 hour before start time"
    }

Types of errors handled:

### Validation Errors

-   Invalid capacity
-   startTime \>= endTime
-   Duration outside allowed range

### Business Rule Errors

-   Booking outside working hours
-   Weekend booking
-   Overlapping booking

### Database Errors

Handled using try/catch and returned as **Internal Server Error**

### HTTP status codes:

| Status | Reason |
|---------|------------------------------|
| 400     | validation failure           |
| 404     | room or booking not found   |
| 409     | booking overlap or idempotency conflict |
| 500     | Internal server error       |

Centralized error handling ensures consistent API responses.

------------------------------------------------------------------------

# 5. Idempotency Implementation

Clients must send an Idempotency-Key header when creating bookings.

    Idempotency-Key: <unique value>

To prevent duplicate booking requests (for example due to retries)

### Workflow

 1. The system checks the **idempotency_keys** table.
      
2. If the key already exists and the request matches:

    - Return the previously created booking.

3. If the key exists but the request differs:

    - Return a conflict error.

4. If the key is new:

    - The key is stored in `bookings.idempotency_key`.

    - Before creating a booking:

        `SELECT * FROM bookings WHERE idempotency_key = $key`

This ensures **safe retries**.

------------------------------------------------------------------------

# 6. Handling Concurrency Issues


Concurrent booking requests may attempt to book the same room simultaneously.

The system handles this using:

## Database constraints

Unique idempotency keys

Transactional booking creation

## Validation checks

Before inserting a booking, the overlap query ensures no conflicting bookings exist.

If two requests race:

    one succeeds
    one fails with conflict

This ensures consistency.

This ensures **no overlapping ranges at the database level**.

------------------------------------------------------------------------

# 7. Room Utilization Calculation

Room utilization measures how much time a room is used.

Formula:

    Utilization % =
    (Total booked time / Total available time) * 100

Where:

Total available time per day:

    12 hours
    (08:00 – 20:00)

Example:

Room booked for **6 hours** in a day:

    Utilization = (6 / 12) * 100
                = 50%

Assumptions: - Weekdays only - Available window: 08:00--20:00 -
Calculated per room

------------------------------------------------------------------------

# 8. Test Suite

Testing is implemented using **Jest + Fastify inject**.

Test categories:

### Room Tests

-   create room
-   duplicate room name
-   invalid capacity

### Booking Tests

-   valid booking
-   overlapping booking rejection
-   duration validation
-   weekday validation
-   cancellation rules

### API Tests

-   HTTP status codes
-   validation errors
-   response structure

------------------------------------------------------------------------

# 9. Running the Tests

Install dependencies:

    npm install

Run tests:

    npm test

------------------------------------------------------------------------

# 10. Project Structure & Layers


```plaintext

├── tests
│   ├── test.js
│   └── config
│       └── testdatas.js
│
├── src
│   ├── server.js
│
│   ├── controllers
│   │   ├── bookingController.js
│   │   ├── reportController.js
│   │   └── roomController.js
│
│   ├── services
│   │   ├── bookingService.js
│   │   ├── reportService.js
│   │   └── roomService.js
│
│   ├── repository
│   │   ├── bookingRepository.js
│   │   ├── idempotencyRepository.js
│   │   ├── reportRepository.js
│   │   └── roomRepository.js
│
│   ├── routes
│   │    ├── bookingRoutes.js
│   │    ├── reportRoutes.js
|   |    └─ roomRoutes.js 
| 
|  ├──  schema 
|  |    ├── bookingSchema.js 
|  |    ├── reportSchema.js 
|  |    ├── roomSchema.js 
|  | 
|  ├──  db 
|  |    ├── dbConnect.js 
|  |    ├── initDB.js 
|  | 
|  ├──  errors 
|       ├── errorHandler.js 
```

##  Layer Explanation

| Layer         | Responsibility                                              |
|---------------|--------------------------------------------------------------|
| Routes        | Define API endpoints and attach validation schemas          |
| Controllers   | Handle HTTP request/response                                |
| Services      | Core business logic (overlap checks, idempotency, cancellation rules) |
| Repository    | Database queries                                              |
| Schema        | Request validation schemas                                    |
| DB            | Database connection and initialization                        |
| Errors        | Centralized error handling                                    |
| Tests         | Integration/API tests                                         |

------------------------------------------------------------------------
