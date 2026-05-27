const translations = {
  pt: {
    lang: "pt-BR",
    eyebrow: "Minha semana",
    title: "Organizador da Semana",
    subtitle: "Planeje tarefas, acompanhe prioridades e veja seu progresso em um só lugar.",
    darkMode: "Modo escuro",
    lightMode: "Modo claro",
    doneLabel: "concluídas",
    taskPlaceholder: "Adicionar tarefa...",
    dayLabel: "Dia da semana",
    priorityLabel: "Prioridade",
    addButton: "Adicionar",
    filterAll: "Todas",
    filterToday: "Hoje",
    filterPending: "Pendentes",
    filterDone: "Concluídas",
    empty: "Nada por aqui.",
    taskSingular: "tarefa",
    taskPlural: "tarefas",
    markPending: "Marcar como pendente",
    markDone: "Marcar como concluída",
    removeTask: "Remover tarefa",
    days: {
      Segunda: "Segunda",
      "Terça": "Terça",
      Quarta: "Quarta",
      Quinta: "Quinta",
      Sexta: "Sexta",
      "Sábado": "Sábado",
      Domingo: "Domingo",
    },
    priorities: {
      baixa: "baixa",
      media: "média",
      alta: "alta",
    },
  },
  en: {
    lang: "en",
    eyebrow: "My week",
    title: "Weekly Planner",
    subtitle: "Plan tasks, track priorities, and follow your progress in one clear place.",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    doneLabel: "completed",
    taskPlaceholder: "Add a task...",
    dayLabel: "Day of the week",
    priorityLabel: "Priority",
    addButton: "Add",
    filterAll: "All",
    filterToday: "Today",
    filterPending: "Pending",
    filterDone: "Completed",
    empty: "Nothing here yet.",
    taskSingular: "task",
    taskPlural: "tasks",
    markPending: "Mark as pending",
    markDone: "Mark as completed",
    removeTask: "Remove task",
    days: {
      Segunda: "Monday",
      "Terça": "Tuesday",
      Quarta: "Wednesday",
      Quinta: "Thursday",
      Sexta: "Friday",
      "Sábado": "Saturday",
      Domingo: "Sunday",
    },
    priorities: {
      baixa: "low",
      media: "medium",
      alta: "high",
    },
  },
};

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const priorities = ["media", "alta", "baixa"];
const storageKey = "organizador-semana-tarefas";
const themeKey = "organizador-semana-tema";
const languageKey = "organizador-semana-idioma";

const weekGrid = document.querySelector("#weekGrid");
const taskInput = document.querySelector("#taskInput");
const dayInput = document.querySelector("#dayInput");
const priorityInput = document.querySelector("#priorityInput");
const addTaskButton = document.querySelector("#addTask");
const doneCount = document.querySelector("#doneCount");
const dayTemplate = document.querySelector("#dayTemplate");
const filterButtons = document.querySelectorAll(".filter");
const themeToggle = document.querySelector("#themeToggle");
const languageSelect = document.querySelector("#languageSelect");

let activeFilter = "todas";
let currentLanguage = loadLanguage();
let tasks = loadTasks();

function t(key) {
  return translations[currentLanguage][key];
}

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeDay(day) {
  const names = {
    Terca: "Terça",
    "TerÃ§a": "Terça",
    Sabado: "Sábado",
    "SÃ¡bado": "Sábado",
  };

  return names[day] || day;
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
    return Array.isArray(parsed)
      ? parsed.map((task) => ({ ...task, day: normalizeDay(task.day) }))
      : [];
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
    const sameDay = normalizeDay(task.day) === day;

    if (!sameDay) return false;
    if (activeFilter === "hoje") return day === getTodayName();
    if (activeFilter === "pendentes") return !task.done;
    if (activeFilter === "concluidas") return task.done;
    return true;
  });
}

function renderOptions() {
  dayInput.innerHTML = "";
  priorityInput.innerHTML = "";

  days.forEach((day) => {
    const option = document.createElement("option");
    option.value = day;
    option.textContent = t("days")[day];
    dayInput.append(option);
  });

  priorities.forEach((priority) => {
    const option = document.createElement("option");
    option.value = priority;
    option.textContent = t("priorities")[priority];
    priorityInput.append(option);
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

    title.textContent = t("days")[day];
    total.textContent = `${dayTasks.length} ${dayTasks.length === 1 ? t("taskSingular") : t("taskPlural")}`;

    if (activeFilter === "hoje" && day !== getTodayName()) {
      article.hidden = true;
    }

    if (dayTasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = t("empty");
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
  check.title = task.done ? t("markPending") : t("markDone");
  check.textContent = task.done ? "\u2713" : "";
  check.addEventListener("click", () => toggleTask(task.id));

  const content = document.createElement("div");

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const priority = document.createElement("span");
  priority.className = `priority ${task.priority}`;
  priority.textContent = t("priorities")[task.priority] || task.priority;

  content.append(title, priority);

  const remove = document.createElement("button");
  remove.className = "delete";
  remove.type = "button";
  remove.title = t("removeTask");
  remove.textContent = "\u00d7";
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
  tasks = tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

function applyLanguage() {
  document.documentElement.lang = t("lang");
  languageSelect.value = currentLanguage;
  taskInput.placeholder = t("taskPlaceholder");
  dayInput.setAttribute("aria-label", t("dayLabel"));
  priorityInput.setAttribute("aria-label", t("priorityLabel"));

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  const selectedDay = dayInput.value || "Segunda";
  const selectedPriority = priorityInput.value || "media";

  renderOptions();

  dayInput.value = selectedDay;
  priorityInput.value = selectedPriority;

  applyTheme(loadTheme());
  render();
}

function loadLanguage() {
  try {
    return localStorage.getItem(languageKey) || "pt";
  } catch {
    return "pt";
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem(languageKey, language);
  } catch {}
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.textContent = isDark ? t("lightMode") : t("darkMode");
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

languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  saveLanguage(currentLanguage);
  applyLanguage();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    render();
  });
});

applyLanguage(); 