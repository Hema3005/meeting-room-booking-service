require("dotenv").config();
const Fastify = require("fastify");
const initDB = require("./db/initDb");

const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");

const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reportRoutes = require("./routes/reportRoutes");

const errorHandler = require("./errors/errorHandler");

async function build() {

  const fastify = Fastify({ logger: true });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Meeting Room Booking API",
        version: "1.0.0"
      }
    }
  });

  await fastify.register(swaggerUI, {
    routePrefix: "/docs"
  });

  fastify.register(roomRoutes);
  fastify.register(bookingRoutes);
  fastify.register(reportRoutes);

  fastify.setErrorHandler(errorHandler);

  return fastify;
}

module.exports = build;

if (require.main === module) {

  async function start() {

    await initDB();

    const fastify = await build();

    await fastify.listen({ port: process.env.PORT || 3000 });

    console.log("Server running on port 3000");

  }

  start();
}