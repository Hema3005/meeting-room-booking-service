const createBookingSchema = {
  description: `
Create a new room booking.

Booking Rules:
- startTime must be before endTime.
- Booking duration must be between 15 minutes and 4 hours.
- Bookings allowed only Monday–Friday between 08:00 and 20:00.
- Overlapping confirmed bookings for the same room are not allowed.

Idempotency:
- Clients must send the 'Idempotency-Key' header.
- If the same request is sent again with the same key, the API returns the existing booking.
- If the same key is reused with different booking data, the API returns a conflict error.
- Different keys create new bookings (if no overlap exists).
`,
  tags: ["Bookings"],

  headers: {
    type: "object",
    properties: {
      "Idempotency-Key": {
        type: "string",
        description: "Unique key to ensure idempotent booking creation"
      }
    },
    required: ["Idempotency-Key"]
  },

  body: {
    type: "object",
    required: [
      "roomId",
      "title",
      "organizerEmail",
      "startTime",
      "endTime"
    ],
    properties: {
      roomId: {
        type: "integer",
        description: "Room identifier"
      },
      title: {
        type: "string",
        minLength: 1,
        description: "Meeting title"
      },
      organizerEmail: {
        type: "string",
        format: "email",
        description: "Email of meeting organizer"
      },
      startTime: {
        type: "string",
        format: "date-time",
        description: "Booking start time (ISO-8601)"
      },
      endTime: {
        type: "string",
        format: "date-time",
        description: "Booking end time (ISO-8601)"
      }
    }
  },

  response: {
    201: {
      description: "Booking successfully created",
      type: "object",
      properties: {
        id: { type: "integer" },
        room_id: { type: "integer" },
        title: { type: "string" },
        organizer_email: { type: "string" },
        start_time: { type: "string", format: "date-time" },
        end_time: { type: "string", format: "date-time" },
        status: { type: "string" }
      }
    },

    400: {
      description: "Validation error",
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" }
      }
    },

    404: {
      description: "Room not found",
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" }
      }
    },

    409: {
      description: "Booking conflict or idempotency key reuse",
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" }
      }
    }
  }
};

const listBookingsSchema = {
  description: "List bookings with optional filters and pagination",
  tags: ["Bookings"],

  querystring: {
    type: "object",
    properties: {
      roomId: { type: "integer" },

      from: {
        type: "string",
        format: "date-time"
      },

      to: {
        type: "string",
        format: "date-time"
      },

      limit: {
        type: "integer",
        default: 10,
        minimum: 1
      },

      offset: {
        type: "integer",
        default: 0,
        minimum: 0
      }
    }
  },

  response: {
    200: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              room_id: { type: "integer" },
              title: { type: "string" },
              organizer_email: { type: "string" },
              start_time: { type: "string", format: "date-time" },
              end_time: { type: "string", format: "date-time" },
              status: { type: "string" }
            }
          }
        },
        total: { type: "integer" },
        limit: { type: "integer" },
        offset: { type: "integer" }
      }
    }
  }
};

const cancelBookingSchema = {
  description: "Cancel a booking",
  tags: ["Bookings"],

  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "integer" }
    }
  },

  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "integer" },
        room_id: { type: "integer" },
        title: { type: "string" },
        organizer_email: { type: "string" },
        start_time: { type: "string", format: "date-time" },
        end_time: { type: "string", format: "date-time" },
        status: { type: "string" }
      }
    },

    400: {
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" }
      }
    },

    404: {
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" }
      }
    }
  }
};

module.exports = { createBookingSchema,listBookingsSchema,cancelBookingSchema };