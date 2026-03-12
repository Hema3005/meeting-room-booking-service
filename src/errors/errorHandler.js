function errorHandler(error, request, reply) {

  if (error.name === "ConflictError") {
    return reply.status(409).send({
      error: "ConflictError",
      message: error.message
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      error: "ValidationError",
      message: error.message
    });
  }

  reply.status(500).send({
    error: "InternalServerError",
    message: "Something went wrong"
  });
}

module.exports = errorHandler;