const roomRepo = require("../repository/roomRepository");

async function createRoom(data) {
  try {
    const room = await roomRepo.createRoom(data);
    return room;
  } catch (err) {

    if (err.code === "23505") {
      const error = new Error("Room name already exists");
      error.name = "ConflictError";
      throw error;
    }

    throw err;
  }
}
async function listRooms(filters) {
  return await roomRepo.getRooms(filters);
}

module.exports = {
  createRoom,
  listRooms
};