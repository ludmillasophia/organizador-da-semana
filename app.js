const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const storageKey = "organizador-semana-tarefas";
const themeKey = "organizador-semana-tema";

const weekGrid = document.querySelector("#weekGrid");
const taskInput = document.querySelector("#taskInput");
const dayInput = document.querySelector("#dayInput");
const priorityInput = document.querySelector("#priorityInput");
const addTaskButton = document.querySelector("#addTask");
const doneCount = document.querySelector("#doneCount");
const dayTemplate = document.querySelector("#dayTemplate");
const filterButtons = document.querySelectorAll(".filter");
const themeToggle = document.querySelector("#themeToggle");

let activeFilter = "todas";
let tasks = loadTasks();

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
  let saved = null;

  try {
    saved = localStorage.getItem(storageKey);
  } catch {
    saved = null;
  }

  if (!saved) {
    return [
      { id: makeId(), title: "Planejar prioridades da semana", day: "Segunda", priority: "alta", done: false },
      { id: makeId(), title: "Separar um horário para estudar", day: "Quarta", priority: "media", done: false },
      { id: makeId(), title: "Revisar tarefas concluídas", day: "Sexta", priority: "baixa", done: true },
    ];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch {}
}

function getTodayName() {
  const today = new Date().getDay();
  const map = {
    0: "Domingo",
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
  };

  return map[today];
}

function visibleTasksFor(day) {
  return tasks.filter((task) => {
    if (task.day !== day) return false;
    if (activeFilter === "hoje") return day === getTodayName();
    if (activeFilter === "pendentes") return !task.done;
    if (activeFilter === "concluidas") return task.done;
    return true;
  });
}

function render() {
  weekGrid.innerHTML = "";
  doneCount.textContent = tasks.filter((task) => task.done).length;

  days.forEach((day) => {
    const column = dayTemplate.content.cloneNode(true);
    const article = column.querySelector(".day-column");
    const title = column.querySelector("h2");
    const total = column.querySelector(".task-total");
    const list = column.querySelector(".task-list");
    const dayTasks = visibleTasksFor(day);

    title.textContent = day;
    total.textContent = `${dayTasks.length} tarefa${dayTasks.length === 1 ? "" : "s"}`;

    if (activeFilter === "hoje" && day !== getTodayName()) {
      article.hidden = true;
    }

    if (dayTasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Nada por aqui.";
      list.append(empty);
    }

    dayTasks.forEach((task) => {
      list.append(createTaskElement(task));
    });

    weekGrid.append(column);
  });
}

function createTaskElement(task) {
  const item = document.createElement("div");
  item.className = `task${task.done ? " done" : ""}`;

  const check = document.createElement("button");
  check.className = "check";
  check.type = "button";
  check.title = task.done ? "Marcar como pendente" : "Marcar como concluída";
  check.textContent = task.done ? "✓" : "";
  check.addEventListener("click", () => toggleTask(task.id));

  const content = document.createElement("div");

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const priority = document.createElement("span");
  priority.className = `priority ${task.priority}`;
  priority.textContent = task.priority === "media" ? "média" : task.priority;

  content.append(title, priority);

  const remove = document.createElement("button");
  remove.className = "delete";
  remove.type = "button";
  remove.title = "Remover tarefa";
  remove.textContent = "×";
  remove.addEventListener("click", () => deleteTask(task.id));

  item.append(check, content, remove);
  return item;
}

function addTask() {
  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: makeId(),
    title,
    day: dayInput.value,
    priority: priorityInput.value,
    done: false,
  });

  taskInput.value = "";
  saveTasks();
  render();
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.textContent = isDark ? "Modo claro" : "Modo escuro";
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function loadTheme() {
  try {
    return localStorage.getItem(themeKey) || "light";
  } catch {
    return "light";
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(themeKey, theme);
  } catch {}
}

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
  applyTheme(nextTheme);
  saveTheme(nextTheme);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    render();
  });
});

applyTheme(loadTheme());
render();