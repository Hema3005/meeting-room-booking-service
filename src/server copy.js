require("dotenv").config()
const fastify = require("fastify")({logger:true})
const initDB = require("./db/initDb");

const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");

fastify.register(swagger, {
  openapi: {
    info: {
      title: "Meeting Room Booking API",
      description: "API documentation for meeting room booking system",
      version: "1.0.0"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  }
});

fastify.register(swaggerUI, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false
  }
});

const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reportRoutes = require("./routes/reportRoutes");


const errorHandler = require("./errors/errorHandler");

fastify.register(roomRoutes);
fastify.register(bookingRoutes);
fastify.register(reportRoutes);


fastify.setErrorHandler(errorHandler);

module.exports = fastify;

async function start() {
  try {
    // initialize database
    await initDB();
    // start server
    await fastify.listen({ port: process.env.PORT });
    console.log("Server running on port 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();