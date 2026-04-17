const bcrypt = require("bcrypt");
const sqlite = require("sqlite3");
const db = new sqlite.Database("database.db");
const jwt = require("jsonwebtoken");

db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)");

db.run("CREATE TABLE IF NOT EXISTS lists (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id))");

db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, list_id INTEGER, task_content TEXT, is_completed INTEGER DEFAULT 0, FOREIGN KEY(list_id) REFERENCES lists(id))");

db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id))");

async function createUser(username, password) {

  console.log("USERNAME: 1 ", username);
console.log("PASSWORD: 1", password);
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);

      db.run(
        "INSERT INTO users (name, password) VALUES (?, ?)",
        [username, hash],
        function (err) {
          if (err) return reject(err); // <-- add return
          resolve(this.lastID);
        }
      );
    });
  });
}
async function userExists(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE name = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
}

async function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE name = ?", [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function login(username, password) {
  const user = await getUserByUsername(username);
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Wrong password");

  return jwt.sign(
    { id: user.id, nickname: user.name },
    "shhhhh",
    { expiresIn: "10d" }
  );
}

async function createListdb(user_id, title) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO lists (user_id, title) VALUES (?, ?)",
      [user_id, title],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

async function getListsByUsername(user_id) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM lists WHERE user_id = ?",
      [user_id],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

async function getTasksByListid(listid) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM tasks WHERE list_id = ?",
      [listid],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

async function createTask(listid, task, completedStatus) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO tasks (list_id, task_content, is_completed) VALUES (?, ?, ?)",
      [listid, task, completedStatus],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
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

async function updateNote(noteId, title, content) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [title, content, noteId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}

async function deleteNote(noteId) {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM notes WHERE id = ?",
      [noteId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}

module.exports = {
  createUser,
  userExists,
  getUserByUsername,
  login,
  createListdb,
  getListsByUsername,
  getTasksByListid,
  createTask,
  updateTaskStatus,
  createNote,
  getNotesByUserId,
  updateNote,
  deleteNote
};