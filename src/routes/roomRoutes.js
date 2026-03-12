
const RoomSchema = require("../schema/roomSchema")
const roomController = require("../controllers/roomController");
async function roomRoutes(fastify) {
    fastify.post("/rooms", { schema: RoomSchema.createRoomSchema },roomController.createRoom)
    fastify.get("/rooms", { schema: RoomSchema.listRoomsSchema },roomController.listRooms)
}

module.exports = roomRoutes