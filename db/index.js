const sqlite3 = require("sqlite3").verbose();

const client = new sqlite3.Database("./db/customers.sqlite", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
    console.log("Connected to the database");
})

module.exports = client;