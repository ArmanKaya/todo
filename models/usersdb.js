const bcrypt = require("bcrypt")
const sqlite = require("sqlite3");
const db = new sqlite.Database("database.db");
var jwt = require('jsonwebtoken');

//  users table
db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)");

// list table (lists hold groups of tasks, sort of like a category)
db.run("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id ))");

//  task table (The actual to-do tasks)
db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, list_id INTEGER, task_content TEXT, is_completed INTEGER DEFAULT 0, FOREIGN KEY(list_id) REFERENCES lists(id))");

// notes table (plain text notes)
db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id))");



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
            "INSERT INTO lists (user_id) VALUES (?)",[userId],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}


/* 
async function completedTasksInit(userId) {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO completedTasks (user_id, task) VALUES (?, ?)",
            [userId, "You have not completed any tasks"],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}
*/

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
    console.log("passes user")
    console.log(username)
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE name = ?", [username], (err, row) => {
            if (err) reject(err)
            else resolve(row)
        })
    })
}


async function createListdb(user_id, title) {
    return new Promise((resolve, reject) => {
        db.get("INSERT INTO lists (user_id, title) VALUES (?, ?)", [user_id, title], (err, row) => {
            if (err) reject(err)
            else resolve(row)
        })
    })
}

async function getListsByUsername(userid) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM lists WHERE user_id = ?", [userid], (err, rows) => {
            if (err) reject(err)
            else resolve(rows) 
        })
    })
}

async function getTasksByListid(listid) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM tasks WHERE list_id = ?", [listid], (err, rows) => {
            if (err) reject(err)
            else resolve(rows) 
        })
    })
}

async function createTask(listid, task, completedStatus) {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO tasks (list_id, task_content, is_completed) VALUES (?,?,?)",
            [listid, task, completedStatus],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

async function createNote(userId, title, content) {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
            [userId, title, content],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

async function getNotesByUserId(userId) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM notes WHERE user_id = ? ORDER BY id DESC",
            [userId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

async function updateTaskStatus(taskId, completedStatus) {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE tasks SET is_completed = ? WHERE id = ?",
            [completedStatus, taskId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
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

    var token = jwt.sign({id: user.id, nickname: user.name}, 'shhhhh', {expiresIn: "10d"});
    return token;
}


module.exports = {
    createUser,
    createAccount,
    userExists,
    login,
    getListsByUsername,
    createListdb,
    getTasksByListid,
    createTask,
    updateTaskStatus,
    createNote,
    getNotesByUserId
};
