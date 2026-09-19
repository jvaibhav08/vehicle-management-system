require("dotenv").config();

const db = require("./src/config/db");

const check = async () => {
  const [columns] = await db.query("SHOW COLUMNS FROM puc");
  const [documents] = await db.query(
    "SELECT id, vehicle_id, certificate_number, expiry_date FROM puc ORDER BY id DESC LIMIT 10"
  );

  console.log(JSON.stringify({ columns, documents }, null, 2));
  await db.end();
};

check().catch(async (error) => {
  console.error(error.code || error.message);
  await db.end().catch(() => undefined);
  process.exitCode = 1;
});
