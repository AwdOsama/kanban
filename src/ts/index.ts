(function () {
  type TaskStatus = "todo" | "in-progress" | "completed";

  type Priority = "low" | "medium" | "high";

  type Task = {
    id: string;
    title: string;
    priority: Priority;
    dueDate: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
  };

  let tasks: Task[] = [];

  let editingTaskId: string | null = null;

  // DOM ELEMENTS

  const addTaskBtn = document.querySelector<HTMLButtonElement>("#add-task-btn");

  const modalOverlay = document.querySelector<HTMLDivElement>("#modal-overlay");

  const closeModalBtn =
    document.querySelector<HTMLButtonElement>("#close-modal-btn");

  const cancelBtn = document.querySelector<HTMLButtonElement>("#cancel-btn");

  const taskForm = document.querySelector<HTMLFormElement>("#task-form");

  const titleInput = document.querySelector<HTMLInputElement>("#task-title");

  const priorityInput =
    document.querySelector<HTMLSelectElement>("#task-priority");

  const dueDateInput =
    document.querySelector<HTMLInputElement>("#task-due-date");

  const descriptionInput =
    document.querySelector<HTMLTextAreaElement>("#task-description");

  const titleError =
    document.querySelector<HTMLParagraphElement>("#title-error");

  const dateError = document.querySelector<HTMLParagraphElement>("#date-error");

  const descriptionError =
    document.querySelector<HTMLParagraphElement>("#description-error");

  const charCount = document.querySelector<HTMLParagraphElement>("#char-count");

  const modalTitle = document.querySelector<HTMLHeadingElement>("#modal-title");

  const submitBtnText =
    document.querySelector<HTMLSpanElement>("#submit-btn-text");

  const todoTasks = document.querySelector<HTMLDivElement>("#todo-tasks");

  const progressTasks =
    document.querySelector<HTMLDivElement>("#progress-tasks");

  const completedTasks =
    document.querySelector<HTMLDivElement>("#completed-tasks");

  const todoCount = document.querySelector<HTMLParagraphElement>("#todo-count");

  const progressCount =
    document.querySelector<HTMLParagraphElement>("#progress-count");

  const completedCount =
    document.querySelector<HTMLParagraphElement>("#completed-count");

  // OPEN MODAL

  function openModal(): void {
    if (!modalOverlay) return;

    modalOverlay.classList.remove("hidden");
    titleInput?.focus();
  }

  // CLOSE MODAL

  function closeModal(): void {
    if (!modalOverlay) return;

    modalOverlay.classList.add("hidden");

    resetForm();
  }

  // RESET FORM

  function resetForm(): void {
    taskForm?.reset();

    editingTaskId = null;

    if (modalTitle) {
      modalTitle.textContent = "Create New Task";
    }

    if (submitBtnText) {
      submitBtnText.textContent = "Add Task";
    }

    clearErrors();

    if (charCount) {
      charCount.textContent = "0/500";
    }
  }

  // CLEAR ERRORS

  function clearErrors(): void {
    if (titleError) {
      titleError.textContent = "";
      titleError.classList.add("hidden");
    }

    if (dateError) {
      dateError.textContent = "";
      dateError.classList.add("hidden");
    }

    if (descriptionError) {
      descriptionError.textContent = "";
      descriptionError.classList.add("hidden");
    }
  }

  // VALIDATION

  function validateForm(): boolean {
    let isValid = true;

    clearErrors();

    const title = titleInput?.value.trim() || "";

    const dueDate = dueDateInput?.value || "";

    const description = descriptionInput?.value.trim() || "";

    if (!title) {
      if (titleError) {
        titleError.textContent = "Task title is required.";
        titleError.classList.remove("hidden");
      }

      isValid = false;
    }

    if (title.length > 20 || title.length < 3) {
      if (titleError) {
        titleError.textContent = "Title must be between 3 and 20 characters.";
        titleError.classList.remove("hidden");
      }

      isValid = false;
    }

    // Date validation

    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        if (dateError) {
          dateError.textContent = "Due date cannot be in the past.";
          dateError.classList.remove("hidden");
        }

        isValid = false;
      }
    }

    // Description validation

    if (description.length > 500) {
      if (descriptionError) {
        descriptionError.textContent =
          "Description cannot exceed 500 characters.";
        descriptionError.classList.remove("hidden");
      }

      isValid = false;
    }

    return isValid;
  }

  // ==============================
  // CREATE TASK
  // ==============================

  function createTask(): void {
    if (!validateForm()) return;

    const title = titleInput?.value.trim() || "";

    const priority = (priorityInput?.value as Priority) || "medium";

    const dueDate = dueDateInput?.value || "";

    const description = descriptionInput?.value.trim() || "";

    const newTask: Task = {
      id: `${String(tasks.length + 1).padStart(3, "0")}`,
      title,
      priority,
      dueDate,
      description,
      status: "todo",
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    saveTasks();

    renderTasks();

    closeModal();
  }

  // EDIT TASK

  function editTask(id: string): void {
    const task = tasks.find((task) => task.id === id);

    if (!task) return;

    editingTaskId = id;

    if (titleInput) {
      titleInput.value = task.title;
    }

    if (priorityInput) {
      priorityInput.value = task.priority;
    }

    if (dueDateInput) {
      dueDateInput.value = task.dueDate;
    }

    if (descriptionInput) {
      descriptionInput.value = task.description;
    }

    updateCharacterCount();

    if (modalTitle) {
      modalTitle.textContent = "Edit Task";
    }

    if (submitBtnText) {
      submitBtnText.textContent = "Update Task";
    }

    openModal();
  }

  // UPDATE TASK

  function updateTask(): void {
    if (!editingTaskId) return;

    if (!validateForm()) return;

    const task = tasks.find((task) => task.id === editingTaskId);

    if (!task) return;

    task.title = titleInput?.value.trim() || "";

    task.priority = (priorityInput?.value as Priority) || "medium";

    task.dueDate = dueDateInput?.value || "";

    task.description = descriptionInput?.value.trim() || "";

    saveTasks();

    renderTasks();

    closeModal();
  }

  // DELETE TASK

  function deleteTask(id: string): void {
    tasks = tasks.filter((task) => task.id !== id);

    saveTasks();

    renderTasks();
  }

  // UPDATE STATUS

  function updateTaskStatus(id: string, status: TaskStatus): void {
    const task = tasks.find((task) => task.id === id);

    if (!task) return;

    task.status = status;

    saveTasks();

    renderTasks();
  }

  // RENDER TASKS

  function renderTasks(): void {
    if (!todoTasks || !progressTasks || !completedTasks) {
      return;
    }

    todoTasks.innerHTML = "";
    progressTasks.innerHTML = "";
    completedTasks.innerHTML = "";

    const todo = tasks.filter((task) => task.status === "todo");

    const progress = tasks.filter((task) => task.status === "in-progress");

    const completed = tasks.filter((task) => task.status === "completed");

    todo.forEach((task) => {
      todoTasks.appendChild(createTaskElement(task));
    });

    progress.forEach((task) => {
      progressTasks.appendChild(createTaskElement(task));
    });

    completed.forEach((task) => {
      completedTasks.appendChild(createTaskElement(task));
    });

    updateCounters();

    showEmptyState(todo, todoTasks);
    showEmptyState(progress, progressTasks);
    showEmptyState(completed, completedTasks);
  }

  // CREATE TASK ELEMENT

  function createTaskElement(task: Task): HTMLDivElement {
    const card = document.createElement("div");

    const isCompleted = task.status === "completed";

    const isOverdue = isTaskOverdue(task);

    card.className =
      "group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-200 hover:shadow-md";

    if (isOverdue && !isCompleted) {
      card.classList.add("border-red-200", "ring-2", "ring-red-100");
    }

    card.dataset.taskId = task.id;

    const taskNumber = task.id.replace("#", "");
    card.innerHTML = `
    <div class="mb-3 flex items-center justify-between">

      <div class="flex items-center gap-2">

        <span
          class="h-2 w-2 rounded-full ${getStatusDot(task.status)}"
        ></span>

        <span
          class="text-[10px] font-medium uppercase tracking-wider text-slate-400"
        >
          #${taskNumber}
        </span>

      </div>

      <div
        class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
      >

        <button
          type="button"
          class="edit-btn flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-500"
          data-task-id="${task.id}"
          title="Edit task"
        >
          <i class="fa-solid fa-pen text-xs"></i>
        </button>

        <button
          type="button"
          class="delete-btn flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          data-task-id="${task.id}"
          title="Delete task"
        >
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>

      </div>

    </div>

    <!-- Title -->

    <h3
      class="mb-2 font-semibold leading-snug ${
        isCompleted ? "text-slate-500 line-through" : "text-slate-800"
      }"
    >
      ${task.title}
    </h3>

    <!-- Tags -->

    <div class="mb-4 flex flex-wrap items-center gap-2">

      ${getPriorityHTML(task.priority)}

      ${
        isCompleted
          ? `
            <span
              class="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600"
            >
              <i class="fa-solid fa-check"></i>
              Done
            </span>
          `
          : isOverdue
            ? `
              <span
                class="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-600"
              >
                <i class="fa-solid fa-triangle-exclamation"></i>
                Overdue
              </span>
            `
            : ""
      }

    </div>

    <!-- Meta -->

    <div
      class="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3 text-xs text-slate-400"
    >

      ${
        task.dueDate
          ? `
            <div
              class="flex items-center gap-1.5 ${
                isOverdue && !isCompleted ? "text-red-500" : ""
              }"
            >
              <i class="fa-regular fa-calendar"></i>

              <span>
                ${formatDate(task.dueDate)}
              </span>

            </div>
          `
          : ""
      }

      <div class="flex items-center gap-1.5">

        <i class="fa-regular fa-clock"></i>

        <span>
          ${getTimeAgo(task.createdAt)}
        </span>

      </div>

    </div>

    <!-- Actions -->

    <div class="flex flex-wrap gap-2">

      ${getStatusButtons(task)}

    </div>
  `;

    return card;
  }

  // PRIORITY HTML

  function getPriorityHTML(priority: Priority): string {
    const styles = {
      low: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        dot: "bg-emerald-500",
      },

      medium: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        dot: "bg-amber-500",
      },

      high: {
        bg: "bg-red-50",
        text: "text-red-600",
        dot: "bg-red-500",
      },
    };

    const style = styles[priority];

    return `
    <span
      class="flex items-center gap-1.5 rounded-full ${style.bg} px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${style.text}"
    >
      <span
        class="h-1.5 w-1.5 rounded-full ${style.dot}"
      ></span>

      ${priority}
    </span>
  `;
  }

  // STATUS BUTTONS

  function getStatusButtons(task: Task): string {
    if (task.status === "todo") {
      return `
      <button
        type="button"
        class="status-btn flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-[11px] font-semibold text-amber-700 transition-all duration-200 hover:scale-105 hover:bg-amber-200 active:scale-95"
        data-task-id="${task.id}"
        data-status="in-progress"
      >
        <i class="fa-solid fa-play"></i>
        <span>Start</span>
      </button>

      <button
        type="button"
        class="status-btn flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-[11px] font-semibold text-emerald-700 transition-all duration-200 hover:scale-105 hover:bg-emerald-200 active:scale-95"
        data-task-id="${task.id}"
        data-status="completed"
      >
        <i class="fa-solid fa-check"></i>
        <span>Complete</span>
      </button>
    `;
    }

    if (task.status === "in-progress") {
      return `
      <button
        type="button"
        class="status-btn flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-600 transition-all duration-200 hover:scale-105 hover:bg-slate-200 active:scale-95"
        data-task-id="${task.id}"
        data-status="todo"
      >
        <i class="fa-solid fa-arrow-rotate-left"></i>
        <span>To Do</span>
      </button>

      <button
        type="button"
        class="status-btn flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-[11px] font-semibold text-emerald-700 transition-all duration-200 hover:scale-105 hover:bg-emerald-200 active:scale-95"
        data-task-id="${task.id}"
        data-status="completed"
      >
        <i class="fa-solid fa-check"></i>
        <span>Complete</span>
      </button>
    `;
    }

    return `
    <button
      type="button"
      class="status-btn flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-600 transition-all duration-200 hover:scale-105 hover:bg-slate-200 active:scale-95"
      data-task-id="${task.id}"
      data-status="todo"
    >
      <i class="fa-solid fa-arrow-rotate-left"></i>
      <span>To Do</span>
    </button>

    <button
      type="button"
      class="status-btn flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-[11px] font-semibold text-amber-700 transition-all duration-200 hover:scale-105 hover:bg-amber-200 active:scale-95"
      data-task-id="${task.id}"
      data-status="in-progress"
    >
      <i class="fa-solid fa-play"></i>
      <span>Start</span>
    </button>
  `;
  }

  // STATUS DOT

  function getStatusDot(status: TaskStatus): string {
    if (status === "todo") {
      return "bg-slate-300";
    }

    if (status === "in-progress") {
      return "bg-amber-400";
    }

    return "bg-emerald-500";
  }

  // EMPTY STATE

  function showEmptyState(taskList: Task[], container: HTMLDivElement): void {
    if (taskList.length > 0) return;

    container.innerHTML = `
    <div
      class="flex flex-1 flex-col items-center justify-center py-12 text-center"
    >
      <div
        class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100"
      >
        <i class="fa-solid fa-clipboard-list text-xl text-slate-400"></i>
      </div>

      <p class="text-sm font-medium text-slate-500">
        No tasks yet
      </p>

      <span class="mt-1 text-xs text-slate-400">
        Click + to add one
      </span>
    </div>
  `;
  }

  // COUNTERS

  function updateCounters(): void {
    const todo = tasks.filter((task) => task.status === "todo").length;

    const progress = tasks.filter(
      (task) => task.status === "in-progress",
    ).length;

    const completed = tasks.filter(
      (task) => task.status === "completed",
    ).length;

    if (todoCount) {
      todoCount.textContent = `${todo} ${todo === 1 ? "task" : "tasks"}`;
    }

    if (progressCount) {
      progressCount.textContent = `${progress} ${
        progress === 1 ? "task" : "tasks"
      }`;
    }

    if (completedCount) {
      completedCount.textContent = `${completed} ${
        completed === 1 ? "task" : "tasks"
      }`;
    }
  }

  // DATE

  function formatDate(date: string): string {
    const taskDate = new Date(date);

    return taskDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // OVERDUE

  function isTaskOverdue(task: Task): boolean {
    if (!task.dueDate) return false;

    if (task.status === "completed") {
      return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);

    dueDate.setHours(0, 0, 0, 0);

    return dueDate <= today;
  }

  // TIME AGO

  function getTimeAgo(date: string): string {
    const createdAt = new Date(date).getTime();

    const now = Date.now();

    const difference = now - createdAt;

    const seconds = Math.floor(difference / 1000);

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days}d ago`;
  }

  //
  // CHARACTER COUNT

  function updateCharacterCount(): void {
    if (!descriptionInput || !charCount) {
      return;
    }

    charCount.textContent = `${descriptionInput.value.length}/500`;
  }

  // LOCAL STORAGE

  function saveTasks(): void {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }

  // LOAD TASKS

  function loadTasks(): void {
    const savedTasks = localStorage.getItem("kanban-tasks");

    if (!savedTasks) return;

    try {
      tasks = JSON.parse(savedTasks);
    } catch {
      tasks = [];
    }
  }

  // EVENTS

  addTaskBtn?.addEventListener("click", () => {
    resetForm();
    openModal();
  });

  closeModalBtn?.addEventListener("click", closeModal);

  cancelBtn?.addEventListener("click", closeModal);

  modalOverlay?.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  taskForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (editingTaskId) {
      updateTask();
    } else {
      createTask();
    }
  });

  // Character counter

  descriptionInput?.addEventListener("input", updateCharacterCount);

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    // Edit

    const editButton = target.closest<HTMLButtonElement>(".edit-btn");

    if (editButton) {
      const id = editButton.dataset.taskId;

      if (id) {
        editTask(id);
      }

      return;
    }

    // Delete

    const deleteButton = target.closest<HTMLButtonElement>(".delete-btn");

    if (deleteButton) {
      const id = deleteButton.dataset.taskId;

      if (id) {
        deleteTask(id);
      }

      return;
    }

    // Status

    const statusButton = target.closest<HTMLButtonElement>(".status-btn");

    if (statusButton) {
      const id = statusButton.dataset.taskId;

      const status = statusButton.dataset.status as TaskStatus;

      if (id && status) {
        updateTaskStatus(id, status);
      }
    }
  });

  loadTasks();

  renderTasks();
})();
