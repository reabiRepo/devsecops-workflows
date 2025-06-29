const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Initialisation SQLite in-memory
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'supersecret')");
});
// Injection SQL via paramètre GET
app.get('/user', (req, res) => {
    const username = req.query.username;
    const sql = `SELECT * FROM users WHERE username = '${username}'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).send('Internal error');
        res.json(rows);
    });
});
// Path traversal via paramètre GET
app.get('/readfile', (req, res) => {
    const file = req.query.file;
    const filePath = path.join(__dirname, 'files', file);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('File not found or error');
        res.send(data);
    });
});
// Sert le frontend
app.use(express.static('public'));
app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
});