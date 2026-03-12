const pool = require("../db/dbConnect");

async function checkOverlap(roomId, start, end) {

  const query = `
    SELECT * FROM bookings
    WHERE room_id = $1
    AND status='confirmed'
    AND (
        start_time < $3
        AND end_time > $2
    )
  `;

  const result = await pool.query(query, [
    roomId,
    start,
    end
  ]);

  return result.rowCount > 0;
}

async function createBooking(data) {

  const query = `
    INSERT INTO bookings
    (room_id, title, organizer_email, start_time, end_time)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
  `;

  const result = await pool.query(query, [
    data.roomId,
    data.title,
    data.organizerEmail,
    data.start,
    data.end
  ]);

  return result.rows[0];
}

async function getBookingById(id) {

  const result = await pool.query(
    `SELECT * FROM bookings WHERE id=$1`,
    [id]
  );

  return result.rows[0];
}

async function cancelBooking(id) {

  const result = await pool.query(
    `
    UPDATE bookings
    SET status='cancelled'
    WHERE id=$1
    RETURNING *
    `,
    [id]
  )

  return result.rows[0]
}

async function listBookings(filters) {

  let query = `
    SELECT *
    FROM bookings
    WHERE 1=1
  `;

  const values = [];
  let index = 1;

  if (filters.roomId) {
    query += ` AND room_id = $${index++}`;
    values.push(filters.roomId);
  }

  if (filters.from) {
    query += ` AND start_time >= $${index++}`;
    values.push(filters.from);
  }

  if (filters.to) {
    query += ` AND end_time <= $${index++}`;
    values.push(filters.to);
  }

  const countQuery = `
    SELECT COUNT(*) FROM (${query}) AS total
  `;

  query += `
    ORDER BY start_time
    LIMIT $${index++}
    OFFSET $${index++}
  `;

  const total = await pool.query(countQuery,values);


  values.push(filters.limit);
  values.push(filters.offset);

  const data = await pool.query(query, values);

  return {
    items: data.rows,
    total: parseInt(total.rows[0].count),
    limit: filters.limit,
    offset: filters.offset
  };
}

module.exports = {
  createBooking,
  checkOverlap,
  getBookingById,
  cancelBooking,
  listBookings
};