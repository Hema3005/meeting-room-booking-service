const bookingRepo = require("../repository/bookingRepository");
const roomRepo = require("../repository/roomRepository");
const idempotencyRepo = require("../repository/idempotencyRepository");


function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function isWithinWorkingHours(start, end) {

  const startHour = start.getHours();
  const endHour = end.getHours();

  return startHour >= 8 && endHour <= 20;
}

async function createBooking(data,idempotencyKey) {

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  // Rule 1
  if (start >= end) {
    throw {
      name: "ValidationError",
      message: "startTime must be before endTime"
    };
  }

  // Rule 2 duration
  const duration = (end - start) / (1000 * 60);

  if (duration < 15 || duration > 240) {
    throw {
      name: "ValidationError",
      message: "Booking must be between 15 minutes and 4 hours"
    };
  }

  // Rule 3 weekday
  if (!isWeekday(start)) {
    throw {
      name: "ValidationError",
      message: "Bookings allowed only Mon-Fri"
    };
  }

  // Rule 4 working hours
  if (!isWithinWorkingHours(start, end)) {
    throw {
      name: "ValidationError",
      message: "Bookings allowed only between 08:00 and 20:00"
    };
  }

  // Check room exists
  const room = await roomRepo.getRoomById(data.roomId);

  if (!room) {
    throw {
      name: "NotFoundError",
      message: "Room not found"
    };
  }

  // Check existing idempotency record
  const existing = await idempotencyRepo.getKey(
    data.organizerEmail,
    idempotencyKey
  );

  if (existing && existing.booking_id) {
    return bookingRepo.getBookingById(existing.booking_id);
  }

  if (!existing) {
    await idempotencyRepo.createKey(
      data.organizerEmail,
      idempotencyKey
    );
  }


  // Check overlap
  const overlap = await bookingRepo.checkOverlap(
    data.roomId,
    start,
    end
  );

  if (overlap) {
    throw {
      name: "ConflictError",
      message: "Room already booked for this time"
    };
  }

  const booking = await bookingRepo.createBooking({
    ...data,
    start,
    end
  });

  await idempotencyRepo.updateBooking(
    data.organizerEmail,
    idempotencyKey,
    booking.id
  );
   return booking;
}

async function cancelBooking(bookingId) {

  const booking = await bookingRepo.getBookingById(bookingId)

  if (!booking) {
    throw {
      name: "NotFoundError",
      message: "Booking not found"
    }
  }

  // already cancelled
  if (booking.status === "cancelled") {
    return booking
  }

  const now = new Date()
  const startTime = new Date(booking.start_time)

  const diffMinutes = (startTime - now) / (1000 * 60)

  if (diffMinutes < 60) {
    throw {
      name: "ValidationError",
      message: "Booking cannot be cancelled less than 1 hour before start time"
    }
  }

  return bookingRepo.cancelBooking(bookingId)
}

async function listBookings(filters) {

  return bookingRepo.listBookings(filters);

}

module.exports = { createBooking, cancelBooking,listBookings };