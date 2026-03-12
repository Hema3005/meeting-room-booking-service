const pool = require("./dbConnect");

async function initDB() {
  try {
    // check connection
    await pool.query("SELECT 1");
    console.log("Database connected");

    // create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        capacity INTEGER NOT NULL CHECK (capacity > 0),
        floor INTEGER NOT NULL,
        amenities TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        organizer_email TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        );
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        id SERIAL PRIMARY KEY,
        organizer_email TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        booking_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (organizer_email, idempotency_key)
      );
    `)

    // create unique index if not exists
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_room_name
      ON rooms (LOWER(name));
    `);

    console.log("Rooms table ready");

  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }
}

module.exports = initDB;