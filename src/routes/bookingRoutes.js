const bookingSchema = require("../schema/bookingSchema");
const bookingController = require("../controllers/bookingController");

async function bookingRoutes(fastify) {
  fastify.post("/bookings",{ schema: bookingSchema.createBookingSchema },bookingController.createBooking);
  fastify.get("/bookings",{schema:bookingSchema.listBookingsSchema}, bookingController.listBookings);
  fastify.post("/bookings/:id/cancel",{schema: bookingSchema.cancelBookingSchema},bookingController.cancelBooking)
}

module.exports = bookingRoutes;