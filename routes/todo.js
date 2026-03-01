//ToDo機能専用の「サーバー側ロジック」ファイル（データ担当）

const express = require("express");
const router = express.Router();
const store = require("../models/todoStore");
const bcrypt = require("bcrypt");


// ログイン画面
router.get("/login", (req, res) => {
  res.send(`
    <h1>ログイン</h1>
    <form method="POST" action="/login">
      <input name="username" placeholder="ユーザー名" required>
      <input type="password" name="password" placeholder="パスワード" required>
      <button>ログイン</button>
    </form>
    <a href="/register">新規登録</a>
  `);
});


// 新規登録画面
router.get("/register", (req, res) => {
  const error = req.query.error || "";

  res.send(`
    <div class="login-register"> 
    <h1>新規登録</h1>

    ${error ? `<p style="color:red;">${error}</p>` : ""}
    
    <form method="POST" action="/register">
      <input name="username" placeholder="ユーザー名" required>
      <input type="password" name="password" placeholder="パスワード" required>
      <button>登録</button>
    </form>
    <a href="/login">ログインへ戻る</a>
    </div>
  `);
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send("ユーザー名とパスワードを入力してください");
  }

  try {
    await store.createUser(username, password);
    res.redirect("/login");
  } catch (err) {
    // 👇 UNIQUE制約エラーを判定
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.redirect("/register?error=そのユーザー名は既に使われています");
    }

    console.log("登録エラー:", err);
    res.redirect("/register?error=登録に失敗しました");
  }
});



// ログイン処理
router.post("/login", async (req, res) => {
 const { username, password } = req.body;

  console.log("入力されたusername:", username);

  const user = await store.findUserByName(username);

  console.log("DBから取得したuser:", user);

  if (!user) {
    return res.send("ユーザーが存在しません");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.send("パスワードが違います");
  }

  // ✅ ここが重要
  req.session.userId = user.id;

  console.log("session保存:", req.session.userId);

  res.redirect("/");   // ← 成功したらトップへ
});


// トップページ
router.get("/", async (req, res) => {

  if (!req.session.userId) {
    return res.redirect("/login");
  }
  const todos = await store.getTodos(req.session.userId);

  const list = todos.map(todo => `
    <li data-id="${todo.id}">
      ${todo.text}
      <small>${todo.created_at}</small>
      <input type="checkbox"
        class="toggleCheckbox"
        ${todo.done ? "checked" : ""}>
      <button class="deleteBtn">削除</button>
    </li>
  `).join("");

  res.send(`
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>ToDoアプリ</title>

  <link rel="stylesheet" href="/style.css">

  <!-- PWA manifest -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#4CAF50">

  <!-- iOS PWA対応 -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  
  <!-- iOSアイコン（複数サイズ推奨） -->

  <!-- テスト用 <link rel="apple-touch-icon" sizes="180x180" href="https://todolist-j8f3.onrender.com/apple-icon-180.png"> -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180.png">
</head>
<body>
  <div class="app">
    <h1>ToDoアプリ</h1>
    <a href="/logout">ログアウト</a>
    <p id="remainingCount"></p>

    <form id="addForm">
      <input name="todo" placeholder="やること">
      <button>追加</button>
    </form>

    <div id="filters">
      <button data-filter="all">すべて</button>
      <button data-filter="active">未完了</button>
      <button data-filter="done">完了</button>
    </div>

    <ul id="todoList"></ul>
  </div>

  <script src="/script.js"></script>
  <script>
    // Service Worker登録
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-workers.js")
        .then(() => console.log("Service Worker登録成功"))
        .catch((err) => console.log("Service Worker登録失敗:", err));
    }
  </script>
</body>
</html>
  `);
});

// ログアウト
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("ログアウト失敗");
    }
    res.redirect("/login");
  });
});


router.get("/todos", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false });
  }
  const todos = await store.getTodos(req.session.userId);
  res.json({ success: true, todos });
});

// 追加（fetch 用）
router.post("/add", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false });
  }

     console.log("🔥 /add に来た");

  if (!req.body.todo) {
    return res.json({ success: false });   
  }

  const id = await store.addTodo(req.session.userId, req.body.todo);

  res.json({
    success: true,
    todo: { id, text: req.body.todo, done: false }
  });
});

//削除
router.post("/delete", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false });
  }

  console.log("🔥 /delete に来た");

  const id = Number(req.body.id);
  const success = await store.deleteTodoById(req.session.userId,id);

  res.json({ success });
});

//チェックBoxを押したら完了<=>未完了を切り替える
router.post("/toggle/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false });
  }
  const id = Number(req.params.id);

 const success = await store.toggleTodoById(req.session.userId,id); // ← await追加！

  res.json({ success });

});

module.exports = router;
