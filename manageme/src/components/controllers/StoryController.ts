// src/controllers/StoryController.ts
import { v4 as uuidv4 } from "uuid";
import { Story } from "../models/StoryModel";
import { ApiService } from "../api/ApiService";
import { ActiveProjectService } from "../api/ActiveProjectService";
import { UserController } from "./UserController";

export class StoryController {
  private storyService: ApiService<Story>;

  constructor() {
    this.storyService = new ApiService<Story>("stories");
    this.attachEventListeners();
    this.setupFilterChangeListener();
  }

  public renderStories() {
    const projectId = ActiveProjectService.getActiveProjectId();
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
        storyElement.innerHTML = `
                    <h4>${story.name}</h4>
                    <p>${story.description}</p>
                    <p>Priority: ${story.priority}</p>
                    <p>Status: ${story.state}</p>
                    <p>Created: ${story.creationDate}</p>
                `;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => this.editStory(story.id);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => this.deleteStory(story.id);

        storyElement.appendChild(editButton);
        storyElement.appendChild(deleteButton);

        storiesList.appendChild(storyElement);
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
    const projectId = ActiveProjectService.getActiveProjectId() || "";

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

  //Helper methods
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
}
