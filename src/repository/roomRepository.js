const pool = require("../db/dbConnect");

async function createRoom(room) {
  const query = `
    INSERT INTO rooms (name, capacity, floor, amenities)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    room.name,
    room.capacity,
    room.floor,
    room.amenities
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}

async function getRooms(filters) {

  let query = `
    SELECT id, name, capacity, floor, amenities
    FROM rooms
    WHERE 1=1
  `;

  const values = [];
  let index = 1;

  if (filters.minCapacity) {
    query += ` AND capacity >= $${index}`;
    values.push(filters.minCapacity);
    index++;
  }

  if (filters.amenity) {
    query += ` AND $${index} = ANY(amenities)`;
    values.push(filters.amenity);
    index++;
  }

  const result = await pool.query(query, values);

  return result.rows;
}

async function getRoomById(roomId) {

  const query = `
    SELECT id, name, capacity, floor, amenities
    FROM rooms
    WHERE id = $1
  `;

  const result = await pool.query(query, [roomId]);

  return result.rows[0]; // undefined if not found
}


module.exports = {
  createRoom,
  getRooms,
  getRoomById
};