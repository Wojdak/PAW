import { v4 as uuidv4 } from "uuid";
import { Task } from "../models/TaskModel";
import { UserController } from "./UserController";
import { ApiService } from "../api/ApiService";

export class TaskController {
  private taskService: ApiService<Task>;

  constructor() {
    this.taskService = new ApiService<Task>("tasks");
    this.attachEventListeners();
  }

  public renderTasks() {
    const storyId = this.taskService.getActiveStoryId();
    const tasks = this.taskService.getAllItems().filter((task) => task.storyId === storyId);
    const todoList = document.getElementById("tasks-todo")?.querySelector(".tasks-list");
    const doingList = document.getElementById("tasks-doing")?.querySelector(".tasks-list");
    const doneList = document.getElementById("tasks-done")?.querySelector(".tasks-list");

    if (todoList) {
      todoList.innerHTML = "";
    }
    if (doingList) {
      doingList.innerHTML = "";
    }
    if (doneList) {
      doneList.innerHTML = "";
    }

    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task-card";
      taskElement.innerHTML = `
            <h4>${task.name}</h4>
            <p>${task.description}</p>
            <p>Priority: ${task.priority}</p>`;

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.onclick = () => this.editTask(task.id);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => this.deleteTask(task.id);

      const detailsButton = document.createElement("button");
      detailsButton.textContent = "See details";
      detailsButton.onclick = () => this.showTaskDetails(task.id);

      taskElement.appendChild(editButton);
      taskElement.appendChild(deleteButton);
      taskElement.appendChild(detailsButton);

      // Append to the correct column based on task status
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
    const descriptionInput = document.getElementById("task-description") as HTMLTextAreaElement;
    const prioritySelect = document.getElementById("task-priority") as HTMLSelectElement;
    const statusSelect = document.getElementById("task-status") as HTMLSelectElement;
    const estimatedTimeInput = document.getElementById("task-estimated-time") as HTMLSelectElement;
    const storyId = this.taskService.getActiveStoryId() || ""; // Assuming you have a story ID

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
      const nameInput = document.getElementById("task-name") as HTMLInputElement;
      const descriptionInput = document.getElementById("task-description") as HTMLTextAreaElement;
      const prioritySelect = document.getElementById("task-priority") as HTMLSelectElement;
      const statusSelect = document.getElementById("task-status") as HTMLSelectElement;
      const estimatedTimeInput = document.getElementById("task-estimated-time") as HTMLSelectElement;

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

    const detailsContainer = document.getElementById("task-details-container");
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
        <h2>Task Details: ${task.name}</h2>
        <p>Description: ${task.description}</p>
        <p>Priority: ${task.priority}</p>
        <p>Status: ${task.state}</p>
        <p>Estimated Time: ${task.estimatedTime} hours</p>
        <p>Assigned to: ${task.userId || "None"}</p>
        <p>Start date: ${task.startDate || "None"}</p>
        <p>End date: ${task.endDate || "None"}</p>
    `;

    //Create a dropdown to assign a user to the task
    if (task.state == "Todo") {
      const selectElement = document.createElement("select");
      selectElement.id = "user-select";
      const optionElement = document.createElement("option");
      optionElement.value = "";
      optionElement.textContent = "Select a user";
      selectElement.appendChild(optionElement);
      detailsContainer.appendChild(selectElement);

      const assignUserButton = document.createElement("button");
      assignUserButton.textContent = "Assign User";
      assignUserButton.onclick = () => this.assignUser(task.id);

      detailsContainer.appendChild(assignUserButton);
    }
    const changeStateButton = document.createElement("button");
    changeStateButton.textContent = "Mark as done";
    changeStateButton.onclick = () => this.changeTaskState(task.id);

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.onclick = () => this.changeTaskDetailsVisibility();

    
    detailsContainer.appendChild(changeStateButton);
    detailsContainer.appendChild(closeButton);

    this.populateUserDropdown();
    this.changeTaskDetailsVisibility();
  }

  public assignUser(taskId: string) {
    const task = this.taskService.getItemById(taskId);
    const userSelect = document.getElementById("user-select") as HTMLSelectElement;

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

  // Helper methods
  private changeTaskDetailsVisibility() {
    const detailsContainer = document.getElementById("task-details-container");
    if (detailsContainer) {
      if (detailsContainer.style.display == "block") {
        detailsContainer.style.display = "none";
      } else {
        detailsContainer.style.display = "block";
      }
    }
  }

  public populateUserDropdown() {
    const userSelect = document.getElementById("user-select");
    if (!userSelect) return;

    const users = UserController.getUsers();
    users.forEach((user) => {
      if (user.role != "Admin") {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName} (${user.role})`;
        userSelect.appendChild(option);
      }
    });
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
    const descriptionInput = document.getElementById("task-description") as HTMLTextAreaElement;
    const prioritySelect = document.getElementById("task-priority") as HTMLSelectElement;
    const statusSelect = document.getElementById("task-status") as HTMLSelectElement;
    const estimatedTimeInput = document.getElementById("task-estimated-time") as HTMLSelectElement;

    idInput.value = "";
    nameInput.value = "";
    descriptionInput.value = "";
    prioritySelect.value = "Low";
    statusSelect.value = "Todo";
    estimatedTimeInput.value = "";
  }
}
