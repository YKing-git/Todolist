//アプリ本体　express設定ファイル

const express = require("express");
const session = require("express-session"); // ← session
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//sessionを使用する（サーバー側でユーザーIDの保存するため,誰が現在ログイン中かを一時保存）
app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false
}));

app.use("/", require("./routes/todo"));

module.exports = app;
