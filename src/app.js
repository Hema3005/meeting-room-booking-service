const build = require("./server");
const initDB = require("./db/initDb");

async function start() {
  try {

    await initDB();

    const app = await build();

    await app.listen({ port: process.env.PORT || 3000 });

    console.log("Server running on port 3000");

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();