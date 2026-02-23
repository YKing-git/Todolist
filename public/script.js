// ブラウザ側の「操作係」ファイル
console.log("script.js 読み込まれた");

document.addEventListener("DOMContentLoaded", () => {
  const todoList = document.getElementById("todoList");
  const addForm = document.getElementById("addForm");

// 初期表示
(async () => {
  const response = await fetch("/todos");
  const result = await response.json();
  if (!result.success) return;

  result.todos.forEach(todo => {
    const li = document.createElement("li");
    li.dataset.id = todo.id;

    if (todo.done) li.classList.add("done");

    li.innerHTML = `
      ${todo.text}
      <input
        type="checkbox"
        class="toggleCheckbox"
        ${todo.done ? "checked" : ""}
      >
      <button class="deleteBtn">削除</button>
    `;

    todoList.appendChild(li);

  });
  updateRemainingCount();
})();

function updateRemainingCount() {
  const allTodos = document.querySelectorAll("#todoList li");
  const remaining = Array.from(allTodos).filter(
    li => !li.classList.contains("done")
  ).length;

  const counter = document.getElementById("remainingCount");

  if (remaining === 0) {
    counter.textContent = "🎉 すべて完了！";
  } else {
    counter.textContent = `残り ${remaining} 件`;
  }
}

  // ====================
  // 追加
  // ====================
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const input = addForm.querySelector("input[name='todo']");
    const todo = input.value.trim();
    if (!todo) return;

    const response = await fetch("/add", {
      method: "POST",
      body: new URLSearchParams({ todo })
    });

    const result = await response.json();
    if (!result.success) return;

    const li = document.createElement("li");
    li.dataset.id = result.todo.id;

    li.innerHTML = `
  ${result.todo.text}

  <input type="checkbox" class="toggleCheckbox">

  <button class="deleteBtn">削除</button>
`;


    todoList.appendChild(li);
    input.value = "";

    updateRemainingCount();

  });

  // ====================
  // 削除（click）
  // ====================
  todoList.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("deleteBtn")) return;

    const li = e.target.closest("li");
    if (!li) return;

    const id = li.dataset.id;

    const response = await fetch("/delete", {
      method: "POST",
      body: new URLSearchParams({ id })
    });

    const result = await response.json();
    if (result.success) {
      li.remove();
    }

    updateRemainingCount();

  });

  // ====================
  // 完了 / 未完了（checkbox）
  // ====================
  todoList.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("toggleCheckbox")) return;

    const li = e.target.closest("li");
    if (!li) return;

    const id = li.dataset.id;

    const response = await fetch(`/toggle/${id}`, {
      method: "POST"
    });

    const result = await response.json();
    if (!result.success) return;

    li.classList.toggle("done");

    updateRemainingCount();

  });
});

// ====================
// フィルター
// ====================
document.getElementById("filters").addEventListener("click", (e) => {
  if (!e.target.dataset.filter) return;

  const filter = e.target.dataset.filter;
  const allTodos = document.querySelectorAll("#todoList li");

  allTodos.forEach(li => {
    const isDone = li.classList.contains("done");

    if (filter === "all") {
      li.style.display = "";
    } else if (filter === "active") {
      li.style.display = isDone ? "none" : "";
    } else if (filter === "done") {
      li.style.display = isDone ? "" : "none";
    }
  });
});

