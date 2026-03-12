const roomService = require("../services/roomService");

async function createRoom(request, reply) {
  const room = await roomService.createRoom(request.body);

  reply.code(201).send({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    floor: room.floor,
    amenities: room.amenities
  });
}

async function listRooms(request, reply) {

  const { minCapacity, amenity } = request.query;

  const rooms = await roomService.listRooms({
    minCapacity,
    amenity
  });

  return rooms;
}

module.exports = {
  createRoom,
  listRooms
};