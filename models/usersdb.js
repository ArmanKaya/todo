const bcrypt = require("bcrypt")
const sqlite = require("sqlite3");
const db = new sqlite.Database("database.db");
var jwt = require('jsonwebtoken');

db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)")

db.run("CREATE TABLE IF NOT EXISTS taskAccount (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, task TEXT)")
 




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
    console.log(username, "fra db")
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE name = ?", [username], (err, row) => {
            if (row) resolve(true)
            else resolve(false)
        })
    })
}

async function getUserByUsername(username) {
    const username = req.body.username
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE name = ?", [username], (err, row) => {
            if (err) reject(err)
            else resolve(row)
        })
    })
}



async function login(username, password) {
    const user = (await getUserByUsername(username))
    console.log(user)
    if (!user) console.log("Brukernavn finnes ikke");
    const passwordMatch = await new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });

    if (!passwordMatch) throw new Error("Passordet er feil");

    var token = jwt.sign({id: user.id, nickname: user.name, tasks: task}, 'shhhhh', {expiresIn: "10d"});
    return token
}



module.exports = {
    createUser,
    createAccount,
    userExists,
    login,
    getUserByUsername
};
