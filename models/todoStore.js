// models/todoStore.js　データ保存担当

// models/todoStore.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.join(__dirname, "../todo.db");
const db = new sqlite3.Database(dbPath);
const bcrypt = require("bcrypt");

// テーブル作成（なければ）
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
});

function getTodos(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM todos WHERE user_id = ? ORDER BY id DESC",
      [userId],
      (err, rows) => {
        if (err) reject(err);
        else {
          const formatted = rows.map(row => ({
            ...row,
            done: !!row.done
          }));
          resolve(formatted);
        }
      }
    );
  });
}


function addTodo(userId, text) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO todos (user_id, text, done) VALUES (?, ?, 0)",
      [userId, text],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function deleteTodoById(userId, id) {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM todos WHERE id = ? AND user_id = ?",
      [id, userId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
}


function toggleTodoById(userId, id) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE todos
      SET done = CASE WHEN done = 1 THEN 0 ELSE 1 END
      WHERE id = ? AND user_id = ?
      `,
      [id, userId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
}


function createUser(username, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);  //ログインパスワードの暗号化

      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}


function findUserByName(username) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}


module.exports = {
  getTodos,
  addTodo,
  deleteTodoById,
  toggleTodoById,
  createUser,
  findUserByName
};
