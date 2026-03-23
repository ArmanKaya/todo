const bcrypt = require("bcrypt")
const sqlite = require("sqlite3");
const db = new sqlite.Database("database.db");

db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)")

db.run("CREATE TABLE IF NOT EXISTS taskAccount (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGEr, task TEXT)")
 




async function createUser(username, password) {
    return new Promise(
        (resolve, reject) => {
            bcrypt.hash(password, 10,
                (err, hashed_password) => {
                    if (err) reject(err)
                    db.run("INSERT INTO users (name, password) VALUES (?, ?)", [username, hashed_password],
                        function (err) {
                            if (err) reject(err)
                            else resolve(this.lastID)
                        })
                })
        })
}


async function createAccount(userId) {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO taskAccount (user_id, task) VALUES (?, ?)",
            [userId, "You have no active tasks"],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

async function userExists(username) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE name = ?", [username], (err, row) => {
            if (row) resolve(true)
            else resolve(false)
        })
    })
}

module.exports = {
    createUser,
    createAccount,
    userExists
};
