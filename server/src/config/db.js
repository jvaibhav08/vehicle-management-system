const mysql = require("mysql2");
const fs = require("fs");

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true
};

// Enable SSL only when DB_SSL is set to "true"
if (process.env.DB_SSL === "true") {
    dbConfig.ssl = {
        ca: fs.readFileSync(process.env.DB_SSL_CA),
        rejectUnauthorized: true
    };
}

const db = mysql.createConnection(dbConfig).promise();

db.connect()
    .then(() => {
        console.log("✅ Connected to MySQL Database");
    })
    .catch((err) => {
        console.error("Database connection failed", err);
    });

module.exports = db;