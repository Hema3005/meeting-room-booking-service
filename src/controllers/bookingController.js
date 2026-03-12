const bookingService = require("../services/bookingService");

async function createBooking(request, reply) {
    const idempotencyKey = request.headers["idempotency-key"];

  if (!idempotencyKey) {
    return reply.code(400).send({
      error: "ValidationError",
      message: "Idempotency-Key header required"
    });
  }

  try {

    const booking = await bookingService.createBooking(request.body,idempotencyKey);

    reply.code(201).send(booking);

  } catch (err) {

    if (err.name === "NotFoundError") {
      return reply.code(404).send({
        error: "NotFoundError",
        message: err.message
      });
    }

    if (err.name === "ConflictError") {
      return reply.code(409).send({
        error: "ConflictError",
        message: err.message
      });
    }

    if (err.name === "ValidationError") {
      return reply.code(400).send({
        error: "ValidationError",
        message: err.message
      });
    }

    throw err;
  }
}

async function cancelBooking(request, reply) {
  try{

  const bookingId = request.params.id

  const booking = await bookingService.cancelBooking(bookingId)

  return reply.send(booking)
  }
  catch (err) {

    if (err.name === "NotFoundError") {
      return reply.code(404).send({
        error: "NotFoundError",
        message: err.message
      });
    }

    if (err.name === "ValidationError") {
      return reply.code(400).send({
        error: "ValidationError",
        message: err.message
      });
    }

    throw err;
  }
}

async function listBookings(request, reply) {
  const {
    roomId,
    from,
    to,
    limit = 10,
    offset = 0
  } = request.query;

  const result = await bookingService.listBookings({
    roomId,
    from,
    to,
    limit,
    offset
  });

  return reply.send(result);
}

module.exports = { createBooking, cancelBooking,listBookings };