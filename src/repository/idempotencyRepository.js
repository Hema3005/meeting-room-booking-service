const pool = require("../db/dbConnect");

async function getKey(email, key) {

  const result = await pool.query(
    `SELECT * FROM idempotency_keys
     WHERE organizer_email=$1
     AND idempotency_key=$2`,
    [email, key]
  );

  return result.rows[0];
}

async function createKey(email, key) {

  await pool.query(
    `INSERT INTO idempotency_keys
     (organizer_email, idempotency_key)
     VALUES ($1,$2)`,
    [email, key]
  );
}

async function updateBooking(email, key, bookingId) {

  await pool.query(
    `UPDATE idempotency_keys
     SET booking_id=$1
     WHERE organizer_email=$2
     AND idempotency_key=$3`,
    [bookingId, email, key]
  );
}

module.exports = {
  getKey,
  createKey,
  updateBooking
};