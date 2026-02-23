//サーバーの立ち上げファイル（起動担当）

const app = require("./app");

//外部公開版
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

/*ローカル利用版
app.listen(3000, "0.0.0.0", () => {         //3000はポート番号（イメージ：PCの3000番の部屋にアクセス）　Node.jsの開発では3000、3001、8080がよく使われる。3000という数字に特に意味はない。
  console.log("👉 http://localhost:3000"); 
});*/





