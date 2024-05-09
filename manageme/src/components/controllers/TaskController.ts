import { v4 as uuidv4 } from "uuid";
import { Task } from "../models/TaskModel";
import { UserController } from "./UserController";
import { ApiService } from "../api/ApiService";
import * as bootstrap from "bootstrap";

export class TaskController {
  private taskService: ApiService<Task>;

  constructor() {
    this.taskService = new ApiService<Task>("tasks");
    this.attachEventListeners();
  }

  public renderTasks() {
    const storyId = this.taskService.getActiveStoryId();
    const tasks = this.taskService
      .getAllItems()
      .filter((task) => task.storyId === storyId);
    const todoList = document.getElementById("tasks-todo");
    const doingList = document.getElementById("tasks-doing");
    const doneList = document.getElementById("tasks-done");

    if (todoList) todoList.innerHTML = "";
    if (doingList) doingList.innerHTML = "";
    if (doneList) doneList.innerHTML = "";

    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "card mb-2";
      taskElement.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${task.name}</h5>
          <p class="card-text">${task.description}</p>
          <p class="card-text"><small class="text-muted">Priority: ${task.priority}</small></p>
          <button type="button" class="btn btn-primary edit-btn">Edit</button>
          <button type="button" class="btn btn-danger delete-btn">Delete</button>
          <button type="button" class="btn btn-info details-btn">Details</button>
        </div>`;

      taskElement
        .querySelector(".edit-btn")
        ?.addEventListener("click", () => this.editTask(task.id));
      taskElement
        .querySelector(".delete-btn")
        ?.addEventListener("click", () => this.deleteTask(task.id));
      taskElement
        .querySelector(".details-btn")
        ?.addEventListener("click", () => this.showTaskDetails(task.id));

      // Append to the correct column based on task state
      if (task.state === "Todo" && todoList) {
        todoList.appendChild(taskElement);
      } else if (task.state === "Doing" && doingList) {
        doingList.appendChild(taskElement);
      } else if (task.state === "Done" && doneList) {
        doneList.appendChild(taskElement);
      }
    });
  }

  public saveTask(event: Event) {
    event.preventDefault();
    const idInput = document.getElementById("task-id") as HTMLInputElement;
    const nameInput = document.getElementById("task-name") as HTMLInputElement;
    const descriptionInput = document.getElementById(
      "task-description"
    ) as HTMLTextAreaElement;
    const prioritySelect = document.getElementById(
      "task-priority"
    ) as HTMLSelectElement;
    const statusSelect = document.getElementById(
      "task-status"
    ) as HTMLSelectElement;
    const estimatedTimeInput = document.getElementById(
      "task-estimated-time"
    ) as HTMLSelectElement;
    const storyId = this.taskService.getActiveStoryId() || "";

    const task: Task = {
      id: idInput.value || uuidv4(),
      name: nameInput.value,
      description: descriptionInput.value,
      priority: prioritySelect.value as "Low" | "Medium" | "High",
      storyId: storyId,
      estimatedTime: estimatedTimeInput.value,
      state: statusSelect.value as "Todo" | "Doing" | "Done",
      creationDate: new Date(),
    };

    if (idInput.value) {
      this.taskService.updateItem(task);
    } else {
      this.taskService.addItem(task);
    }

    this.resetForm();
    this.renderTasks();
  }

  public editTask(id: string) {
    const task = this.taskService.getItemById(id);
    if (task) {
      const idInput = document.getElementById("task-id") as HTMLInputElement;
      const nameInput = document.getElementById(
        "task-name"
      ) as HTMLInputElement;
      const descriptionInput = document.getElementById(
        "task-description"
      ) as HTMLTextAreaElement;
      const prioritySelect = document.getElementById(
        "task-priority"
      ) as HTMLSelectElement;
      const statusSelect = document.getElementById(
        "task-status"
      ) as HTMLSelectElement;
      const estimatedTimeInput = document.getElementById(
        "task-estimated-time"
      ) as HTMLSelectElement;

      idInput.value = task.id;
      nameInput.value = task.name;
      descriptionInput.value = task.description;
      prioritySelect.value = task.priority;
      statusSelect.value = task.state;
      estimatedTimeInput.value = task.estimatedTime;
    }
  }

  public deleteTask(id: string) {
    const task = this.taskService.getItemById(id);
    if (task) {
      this.taskService.deleteItem(id);
      this.renderTasks();
    }
  }

  public showTaskDetails(taskId: string) {
    const task = this.taskService.getItemById(taskId);
    if (!task) return;

    const modalElement = document.getElementById("taskDetailsModal");
    const detailsContainer = modalElement?.querySelector(".modal-body");
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
      <h2>Task Details: ${task.name}</h2>
      <p>Description: ${task.description}</p>
      <p>Priority: ${task.priority}</p>
      <p>Status: ${task.state}</p>
      <p>Estimated Time: ${task.estimatedTime} hours</p>
      <p>Assigned to: ${task.userId || "None"}</p>
      <p>Start date: ${
        task.startDate ? new Date(task.startDate).toLocaleDateString() : "None"
      }</p>
      <p>End date: ${
        task.endDate ? new Date(task.endDate).toLocaleDateString() : "None"
      }</p>
    `;

    if (task.state === "Todo") {
      const selectElement = document.createElement("select");
      selectElement.id = "user-select";
      selectElement.innerHTML = `<option value="">Select a user</option>`;
      this.populateUserDropdown(selectElement);

      const assignUserButton = document.createElement("button");
      assignUserButton.className = "btn btn-primary";
      assignUserButton.textContent = "Assign User";
      assignUserButton.onclick = () => this.assignUser(task.id);

      detailsContainer.appendChild(selectElement);
      detailsContainer.appendChild(assignUserButton);
    }

    if (task.state != "Done") {
      const changeStateButton = document.createElement("button");
      changeStateButton.className = "btn btn-success";
      changeStateButton.textContent = "Mark as done";
      changeStateButton.onclick = () => {
        this.changeTaskState(task.id);
      };
      detailsContainer.appendChild(changeStateButton);
    }

    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Helper methods
  public changeTaskDetailsVisibility() {
    const modalElement = document.getElementById("taskDetailsModal");
    if (!modalElement) return;

    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }

  private populateUserDropdown(selectElement: HTMLSelectElement) {
    const users = UserController.getUsers();
    users.forEach((user) => {
      if (user.role !== "Admin") {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName} (${user.role})`;
        selectElement.appendChild(option);
      }
    });
  }

  public assignUser(taskId: string) {
    const task = this.taskService.getItemById(taskId);
    const userSelect = document.getElementById(
      "user-select"
    ) as HTMLSelectElement;

    if (task && userSelect) {
      task.userId = userSelect.value;
      task.state = "Doing";
      task.startDate = new Date();
      this.taskService.updateItem(task);
      this.renderTasks();
      this.changeTaskDetailsVisibility();
    }
  }

  public changeTaskState(taskId: string) {
    const task = this.taskService.getItemById(taskId);
    if (!task) return;

    task.state = "Done";
    task.endDate = new Date();

    this.taskService.updateItem(task);
    this.renderTasks();
    this.changeTaskDetailsVisibility();
  }

  private attachEventListeners() {
    const taskForm = document.getElementById("task-form");
    if (taskForm) {
      taskForm.addEventListener("submit", (event) => this.saveTask(event));
    }
  }

  private resetForm() {
    const idInput = document.getElementById("task-id") as HTMLInputElement;
    const nameInput = document.getElementById("task-name") as HTMLInputElement;
    const descriptionInput = document.getElementById(
      "task-description"
    ) as HTMLTextAreaElement;
    const prioritySelect = document.getElementById(
      "task-priority"
    ) as HTMLSelectElement;
    const statusSelect = document.getElementById(
      "task-status"
    ) as HTMLSelectElement;
    const estimatedTimeInput = document.getElementById(
      "task-estimated-time"
    ) as HTMLSelectElement;

    idInput.value = "";
    nameInput.value = "";
    descriptionInput.value = "";
    prioritySelect.value = "Low";
    statusSelect.value = "Todo";
    estimatedTimeInput.value = "";
  }
}
