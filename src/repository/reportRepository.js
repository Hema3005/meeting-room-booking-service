const pool = require("../db/dbConnect");

async function getRoomUtilization(from, to){

const result = await pool.query(
`
SELECT
r.id AS "roomId",
r.name AS "roomName",
COALESCE(
SUM(
EXTRACT(
EPOCH FROM (
LEAST(b.end_time,$2)
-
GREATEST(b.start_time,$1)
)
)/3600
),0) AS "totalBookingHours"
FROM rooms r
LEFT JOIN bookings b
ON r.id = b.room_id
AND b.status='confirmed'
AND b.end_time>$1
AND b.start_time<$2
GROUP BY r.id,r.name
`,
[from,to]
)

return result.rows

}

module.exports={getRoomUtilization}