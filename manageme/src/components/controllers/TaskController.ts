import { Task } from "../models/TaskModel";
import { UserController } from "./UserController";
import * as bootstrap from "bootstrap";
import { NotificationService } from "../services/NotificationService";

export class TaskController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
    this.attachEventListeners();
  }

  public async renderTasks() {
    const storyId = sessionStorage.getItem('activeStoryId');
    if (!storyId) return;

    const userRole = this.getUserRole();
    const userId = this.getUserId();

    const isDeveloper = userRole === "Developer";
    console.log(isDeveloper);

    let url;
    if (isDeveloper) {
      url = `http://localhost:3000/tasks?userId=${userId}&storyId=${storyId}`;
    } else {
      url = `http://localhost:3000/tasks?storyId=${storyId}`;
    }
  
    const response = await fetch(url);
    const tasks: Task[] = await response.json();

    console.log(tasks);

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

        taskElement.querySelector(".edit-btn")?.addEventListener("click", () => this.editTask(task._id!.toString()));
        taskElement.querySelector(".delete-btn")?.addEventListener("click", () => this.deleteTask(task._id!.toString()));
        taskElement.querySelector(".details-btn")?.addEventListener("click", () => this.showTaskDetails(task._id!.toString()));

        if (task.state === "Todo" && todoList) {
            todoList.appendChild(taskElement);
        } else if (task.state === "Doing" && doingList) {
            doingList.appendChild(taskElement);
        } else if (task.state === "Done" && doneList) {
            doneList.appendChild(taskElement);
        }
    });
}

public async saveTask(event: Event) {
  event.preventDefault();

  // Check if user has permission to add tasks
  const userRole = this.getUserRole();
  if (userRole !== "Admin") {
      alert('You do not have permission to add tasks');
      return;
  }
  
  const idInput = document.getElementById("task-id") as HTMLInputElement;
  const nameInput = document.getElementById("task-name") as HTMLInputElement;
  const descriptionInput = document.getElementById("task-description") as HTMLTextAreaElement;
  const prioritySelect = document.getElementById("task-priority") as HTMLSelectElement;
  const statusSelect = document.getElementById("task-status") as HTMLSelectElement;
  const estimatedTimeInput = document.getElementById("task-estimated-time") as HTMLSelectElement;
  const storyId = sessionStorage.getItem('activeStoryId');

  if (!storyId) {
      alert('No active story selected');
      return;
  }

  
  const task: Task = {
      name: nameInput.value,
      description: descriptionInput.value,
      priority: prioritySelect.value as "Low" | "Medium" | "High",
      storyId: storyId,
      estimatedTime: estimatedTimeInput.value,
      state: statusSelect.value as "Todo" | "Doing" | "Done",
      creationDate: new Date(),
  };

  if (idInput.value) {
      await fetch(`http://localhost:3000/tasks/${idInput.value}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
      });
  } else {
      await fetch('http://localhost:3000/tasks', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
      });
  }

  this.resetForm();
  await this.renderTasks();
}

public async editTask(id: string) {
  const response = await fetch(`http://localhost:3000/tasks/${id}`);
  const task: Task = await response.json();

  const idInput = document.getElementById("task-id") as HTMLInputElement;
  const nameInput = document.getElementById("task-name") as HTMLInputElement;
  const descriptionInput = document.getElementById("task-description") as HTMLTextAreaElement;
  const prioritySelect = document.getElementById("task-priority") as HTMLSelectElement;
  const statusSelect = document.getElementById("task-status") as HTMLSelectElement;
  const estimatedTimeInput = document.getElementById("task-estimated-time") as HTMLSelectElement;

  idInput.value = task._id!.toString();
  nameInput.value = task.name;
  descriptionInput.value = task.description;
  prioritySelect.value = task.priority;
  statusSelect.value = task.state;
  estimatedTimeInput.value = task.estimatedTime;
}

public async deleteTask(id: string) {
  await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'DELETE',
  });
  await this.renderTasks();
}

public async showTaskDetails(taskId: string) {
  const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
  const task: Task = await response.json();

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
      <p>Start date: ${task.startDate ? new Date(task.startDate).toLocaleDateString() : "None"}</p>
      <p>End date: ${task.endDate ? new Date(task.endDate).toLocaleDateString() : "None"}</p>
  `;

  if (task.state === "Todo") {
      const selectElement = document.createElement("select");
      selectElement.id = "user-select";
      selectElement.innerHTML = `<option value="">Select a user</option>`;
      this.populateUserDropdown(selectElement);

      const assignUserButton = document.createElement("button");
      assignUserButton.className = "btn btn-primary";
      assignUserButton.textContent = "Assign User";
      assignUserButton.onclick = () => this.assignUser(task._id!.toString());

      detailsContainer.appendChild(selectElement);
      detailsContainer.appendChild(assignUserButton);
  }

  if (task.state != "Done") {
      const changeStateButton = document.createElement("button");
      changeStateButton.className = "btn btn-success";
      changeStateButton.textContent = "Mark as done";
      changeStateButton.onclick = () => {
          this.changeTaskState(task._id!.toString());

          this.notificationService.send({
              title: "Task finished",
              message: "Task has been finished and marked as closed",
              date: new Date().toDateString(),
              priority: "medium",
              read: false
          });
          this.updateNotificationCounter();
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

  private async populateUserDropdown(selectElement: HTMLSelectElement) {
    const users = await UserController.getUsers();
    users.forEach((user) => {
        if (user.role !== "Admin") {
            const option = document.createElement("option");
            option.value = user._id!.toString();
            option.textContent = `${user.firstName} ${user.lastName} (${user.role})`;
            selectElement.appendChild(option);
        }
    });
}

  public async assignUser(taskId: string) {
    // Check if user has permission to assign tasks
    const userRole = this.getUserRole();
    if (userRole !== "DevOps") {
        alert("You do not have permission to assign tasks");
        return;
    }

    const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
    const task: Task = await response.json();
    const userSelect = document.getElementById("user-select") as HTMLSelectElement;

    if (task && userSelect) {
            task.userId = userSelect.value;
            task.state = "Doing";
            task.startDate = new Date();

            await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            });
            await this.renderTasks();
            this.changeTaskDetailsVisibility();
        }

    this.notificationService.send({title: "Task assigned", message: "Task has been assigned to a user", date: new Date().toDateString(), priority: "low", read: false})
    this.updateNotificationCounter();
  }

  public async changeTaskState(taskId: string) {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`);
    const task: Task = await response.json();
    if (!task) return;

    task.state = "Done";
    task.endDate = new Date();

     await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });
      await this.renderTasks();
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

  private getUserRole() {
    const userRole = sessionStorage.getItem("userRole");
    if (userRole) {
      return userRole.replace(/"/g, '').trim(); // Remove quotes
    }
    return "";
  }

  private getUserId() {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      return userId.replace(/"/g, '').trim(); // Remove quotes
    }
    return "";
  }

  // Notification counter
  private updateNotificationCounter() {
    const counterElement = document.getElementById("notification-container");
    if (counterElement) {
      this.notificationService.unreadCount().subscribe((count) => {
        counterElement.textContent = `Notifications: ${count.toString()}`;
      });
    }

    counterElement?.addEventListener("click", () => this.showNotifications());
  }

  public showNotifications() {
    const notificationList = document.getElementById("notification-list");
    if (!notificationList) return;
  
    this.notificationService.list().subscribe((notifications) => {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      notificationList.innerHTML = "";
      
      unreadNotifications.forEach((notification) => {
        const notificationElement = document.createElement("div");
        notificationElement.setAttribute("role", "button");

        notificationElement.className = "alert alert-info notification-item";
        notificationElement.textContent = `${notification.title}: ${notification.message} - Click to mark as read`;
        notificationElement.onclick = () => {
          this.notificationService.markAsRead(notification);
        };
  
        notificationList.appendChild(notificationElement);
      });
    });
  }
}
