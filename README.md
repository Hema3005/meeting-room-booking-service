# Meeting Room Booking Service

Node.js API for managing meeting rooms, bookings, cancellations, and room utilization reports. The service is built with Fastify, uses PostgreSQL for persistence, and exposes Swagger docs at `/docs`.

## Features

- Create and list meeting rooms
- Create room bookings with idempotency protection
- Prevent overlapping confirmed bookings for the same room
- Cancel bookings
- List bookings with filters and pagination
- Generate room utilization reports for a date range
- Explore the API through Swagger UI

## Tech Stack

- Node.js
- Fastify
- PostgreSQL
- Jest + Supertest

## Project Structure

```text
src/
  app.js
  server.js
  controllers/
  services/
  repository/
  routes/
  schema/
  db/
tests/
DESIGN.md
env_template
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ recommended

## Environment Variables

Create a `.env` file in the project root based on `env_template`.

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_NAME=meeting_room_booking
```

## Installation

```bash
npm install
```

## Run the Service

```bash
npm start
```

On startup, the app:

- connects to PostgreSQL
- creates the `rooms`, `bookings`, and `idempotency_keys` tables if they do not exist
- creates a case-insensitive unique index on room names

The API listens on `http://localhost:3000` by default.

Swagger UI:

```text
http://localhost:3000/docs
```

## API Overview

### Rooms

`POST /rooms`

Create a room.

Example body:

```json
{
  "name": "Orion",
  "capacity": 8,
  "floor": 3,
  "amenities": ["tv", "whiteboard"]
}
```

`GET /rooms`

Optional query params:

- `minCapacity`
- `amenity`

### Bookings

`POST /bookings`

Required header:

```text
Idempotency-Key: unique-client-key
```

Example body:

```json
{
  "roomId": 1,
  "title": "Sprint Planning",
  "organizerEmail": "owner@example.com",
  "startTime": "2026-03-16T09:00:00Z",
  "endTime": "2026-03-16T10:00:00Z"
}
```

`GET /bookings`

Optional query params:

- `roomId`
- `from`
- `to`
- `limit` (default `10`)
- `offset` (default `0`)

`POST /bookings/:id/cancel`

Cancels a booking unless it starts in less than 1 hour.

### Reports

`GET /reports/room-utilization?from=<ISO_DATE>&to=<ISO_DATE>`

Returns each room's booked hours and utilization percentage across business hours in the requested range.

## Booking Rules

- `startTime` must be before `endTime`
- booking duration must be between 15 minutes and 4 hours
- bookings are allowed only on weekdays
- bookings must fall between `08:00` and `20:00`
- overlapping confirmed bookings for the same room are rejected
- cancellation is blocked within 1 hour of the meeting start

## Database Schema

The application initializes these tables automatically:

- `rooms`
- `bookings`
- `idempotency_keys`

See [DESIGN.md](./DESIGN.md) for design notes and current implementation tradeoffs.

## Testing

Run:

```bash
npm test
```

Coverage:

```bash
npm run coverage
```

Important test caveats:

- tests use the real PostgreSQL connection from `.env`
- tests are integration-style and do not mock the database
- tests assume a room with `id = 1` already exists, so a fresh database may need a room inserted before the suite passes

Example room seed:

```sql
INSERT INTO rooms (name, capacity, floor, amenities)
VALUES ('Test Room', 6, 1, ARRAY['tv']);
```

## License

ISC

## Author

Hemamalini

---
