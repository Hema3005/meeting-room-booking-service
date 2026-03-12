const reportRepo = require("../repository/reportRepository");

function calculateBusinessHours(from, to) {

    const start = new Date(from);
    const end = new Date(to);
    let totalHours = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day >= 1 && day <= 5) {
            totalHours += 12;
        }

    }

    return totalHours;
}
async function roomUtilization(from, to) {
    const rows = await reportRepo.getRoomUtilization(from, to)
    const totalBusinessHours =calculateBusinessHours(from, to)
    return rows.map(r => ({
        roomId: r.roomId,
        roomName: r.roomName,
        totalBookingHours: Number(r.totalBookingHours),
        utilizationPercent:
            totalBusinessHours === 0
                ? 0
                : Number(r.totalBookingHours) / totalBusinessHours
    }))

}

module.exports = { roomUtilization }