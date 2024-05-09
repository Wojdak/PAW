// src/controllers/StoryController.ts
import { v4 as uuidv4 } from "uuid";
import { Story } from "../models/StoryModel";
import { ApiService } from "../api/ApiService";
import { UserController } from "./UserController";
import { TaskController } from "./TaskController";


export class StoryController {
  private storyService: ApiService<Story>;
  private taskController = new TaskController();

  constructor() {
    this.storyService = new ApiService<Story>("stories");
    this.attachEventListeners();
    this.setupFilterChangeListener();
  }

  public renderStories() {
    const projectId = this.storyService.getActiveProjectId();
    if (!projectId) return;

    let stories = this.storyService.getAllItems().filter((story) => story.projectId === projectId);

    // Filter stories by status
    const filter = (document.getElementById("story-filter") as HTMLSelectElement)?.value;
    if (filter) {
        stories = stories.filter((story) => story.state === filter);
    }

    const storiesList = document.getElementById("stories-list");
    if (storiesList) {
        storiesList.innerHTML = "";

        stories.forEach((story) => {
            const storyElement = document.createElement("div");
            storyElement.className = "card mb-3";
            storyElement.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${story.name}</h5>
                    <p class="card-text">${story.description}</p>
                    <p class="card-text"><small class="text-muted">Priority: ${story.priority}</small></p>
                    <p class="card-text"><small class="text-muted">Status: ${story.state}</small></p>
                    <p class="card-text"><small class="text-muted">Created: ${new Date(story.creationDate).toLocaleDateString()}</small></p>
                    <button class="btn btn-secondary select-btn">Select</button>
                    <button class="btn btn-primary edit-btn">Edit</button>
                    <button class="btn btn-danger delete-btn">Delete</button>
                </div>`;

            storiesList.appendChild(storyElement);

            // Attach event listeners to buttons
            const editBtn = storyElement.querySelector(".edit-btn") as HTMLButtonElement;
            const deleteBtn = storyElement.querySelector(".delete-btn") as HTMLButtonElement;
            const selectBtn = storyElement.querySelector(".select-btn") as HTMLButtonElement;

            if (editBtn) editBtn.onclick = () => this.editStory(story.id);
            if (deleteBtn) deleteBtn.onclick = () => this.deleteStory(story.id);
            if (selectBtn) selectBtn.onclick = () => this.setActiveStory(story.id);
        });
    }
}

  public saveStory(event: Event) {
    event.preventDefault();
    const idInput = document.getElementById("story-id") as HTMLInputElement;
    const nameInput = document.getElementById("story-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("story-description") as HTMLTextAreaElement;
    const prioritySelect = document.getElementById("story-priority") as HTMLSelectElement;
    const statusSelect = document.getElementById("story-status") as HTMLSelectElement;
    const projectId = this.storyService.getActiveProjectId() || "";

    const story: Story = {
      id: idInput.value || uuidv4(),
      name: nameInput.value,
      description: descriptionInput.value,
      priority: prioritySelect.value as "Low" | "Medium" | "High",
      projectId: projectId,
      creationDate: new Date(),
      state: statusSelect.value as "Todo" | "Doing" | "Done",
      ownerId: this.getCurrentUser().id,
    };

    if (idInput.value) {
      this.storyService.updateItem(story);
    } else {
      this.storyService.addItem(story);
    }

    this.resetForm();
    this.renderStories();
  }

  public editStory(id: string) {
    const story = this.storyService.getItemById(id);
    if (story) {
      const idInput = document.getElementById("story-id") as HTMLInputElement;
      const nameInput = document.getElementById("story-name") as HTMLInputElement;
      const descriptionInput = document.getElementById("story-description") as HTMLTextAreaElement;
      const prioritySelect = document.getElementById("story-priority") as HTMLSelectElement;
      const statusSelect = document.getElementById("story-status") as HTMLSelectElement;

      idInput.value = story.id;
      nameInput.value = story.name;
      descriptionInput.value = story.description;
      prioritySelect.value = story.priority;
      statusSelect.value = story.state;
    }
  }

  public deleteStory(id: string) {
    this.storyService.deleteItem(id);
    this.renderStories();
  }

  // Helper methods
  private resetForm() {
    const idInput = document.getElementById("story-id") as HTMLInputElement;
    const nameInput = document.getElementById("story-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("story-description") as HTMLTextAreaElement;
    const prioritySelect = document.getElementById("story-priority") as HTMLSelectElement;
    const statusSelect = document.getElementById("story-status") as HTMLSelectElement;

    idInput.value = "";
    nameInput.value = "";
    descriptionInput.value = "";
    prioritySelect.value = "Low";
    statusSelect.value = "Todo";
  }

  private attachEventListeners() {
    const storyForm = document.getElementById("story-form");
    if (storyForm) {
      storyForm.addEventListener("submit", (event) => this.saveStory(event));
    }
  }

  private setupFilterChangeListener() {
    const filterDropdown = document.getElementById("story-filter") as HTMLSelectElement;
    filterDropdown.addEventListener("change", () => {
      this.renderStories();
    });
  }

  private getCurrentUser() {
    return UserController.getLoggedInUser();
  }

  // Display Tasks
  public setActiveStory(storyId: string): void {
    this.storyService.setActiveStoryId(storyId);
    this.toggleStoryVisibility(false);
    this.taskController.renderTasks();
    this.toggleTaskSection(true); 
    
  }

  public toggleStoryVisibility(show: boolean) {
    const storySection = document.getElementById("story-section");
    if (storySection == null) return;
    storySection.style.display = show ? "block" : "none";
  }

  public toggleTaskSection(show: boolean) {
    const taskSection = document.getElementById("task-section");
    if (taskSection == null) return;
    taskSection.style.display = show ? "block" : "none";
  }

}
