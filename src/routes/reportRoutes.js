const reportSchema = require("../schema/reportSchema");
const reportController = require("../controllers/reportController");

async function reportRoutes(fastify) {

  fastify.get("/reports/room-utilization",{ schema: reportSchema.roomUtilizationSchema },reportController.roomUtilization);

}

module.exports = reportRoutes;