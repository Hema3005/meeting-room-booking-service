const roomUtilizationSchema = {
  description: `
  Returns utilization metrics for each room within a time range.

  Business Logic:
  - Only confirmed bookings are considered.
  - Booking time overlapping with the range [from, to] is counted.
  - Business hours are Monday–Friday, 08:00–20:00 (12 hours per day).
  - Utilization = totalBookingHours / totalBusinessHours.
  `,
  tags: ["Reports"],

  querystring: {
    type: "object",
    required: ["from", "to"],
    properties: {
      from: {
        type: "string",
        format: "date-time",
        description: "Start of reporting window (ISO-8601)"
      },
      to: {
        type: "string",
        format: "date-time",
        description: "End of reporting window (ISO-8601)"
      }
    }
  },

  response: {
    200: {
      description: "Room utilization report",
      type: "array",
      items: {
        type: "object",
        properties: {
          roomId: {
            type: "number",
            description: "Unique identifier of the room"
          },
          roomName: {
            type: "string",
            description: "Room name"
          },
          totalBookingHours: {
            type: "number",
            description:
              "Total confirmed booking hours overlapping with the report range"
          },
          utilizationPercent: {
            type: "number",
            description:
              "totalBookingHours divided by total business hours within the range"
          }
        }
      }
    },

    400: {
      description: "Invalid query parameters",
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" }
      }
    }
  }
};

module.exports = { roomUtilizationSchema };