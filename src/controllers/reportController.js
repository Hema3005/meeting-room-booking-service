const reportService = require("../services/reportService");


async function roomUtilization(request, reply) {

    const { from, to } = request.query

    if (!from || !to) {
        return reply.code(400).send({
            error: "ValidationError",
            message: "from and to are required"
        })
    }
    try {
        const report =
            await reportService.roomUtilization(from, to)

        return reply.send(report)
    }

    catch (err) {
        throw err;
    }

}

module.exports = {
 roomUtilization
};