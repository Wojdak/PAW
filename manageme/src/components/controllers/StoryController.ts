// src/controllers/StoryController.ts
import { Story } from "../models/StoryModel";
import { TaskController } from "./TaskController";
import { User } from "../models/UserModel";

export class StoryController {
  private taskController = new TaskController();

  constructor() {
    this.attachEventListeners();
    this.setupFilterChangeListener();
    this.renderStories();
  }

  public async renderStories() {
    const projectId = sessionStorage.getItem('activeProjectId');
    console.log(projectId);
    if (!projectId) return;

    const response = await fetch(`http://localhost:3000/stories?projectId=${projectId}`);
    let stories: Story[] = await response.json();

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
                    <p class="card-text"><small class="text-muted">Owner id: ${story.ownerId}</small></p>
                    <button class="btn btn-secondary select-btn">Select</button>
                    <button class="btn btn-primary edit-btn">Edit</button>
                    <button class="btn btn-danger delete-btn">Delete</button>
                </div>`;

            storiesList.appendChild(storyElement);

            // Attach event listeners to buttons
            const editBtn = storyElement.querySelector(".edit-btn") as HTMLButtonElement;
            const deleteBtn = storyElement.querySelector(".delete-btn") as HTMLButtonElement;
            const selectBtn = storyElement.querySelector(".select-btn") as HTMLButtonElement;

            if (editBtn) editBtn.onclick = () => this.editStory(story._id!.toString());
            if (deleteBtn) deleteBtn.onclick = () => this.deleteStory(story._id!.toString());
            if (selectBtn) selectBtn.onclick = () => this.setActiveStory(story._id!.toString());
        });
    }
}

public async saveStory(event: Event) {
  event.preventDefault();
  const idInput = document.getElementById("story-id") as HTMLInputElement;
  const nameInput = document.getElementById("story-name") as HTMLInputElement;
  const descriptionInput = document.getElementById("story-description") as HTMLTextAreaElement;
  const prioritySelect = document.getElementById("story-priority") as HTMLSelectElement;
  const statusSelect = document.getElementById("story-status") as HTMLSelectElement;
  const projectId = sessionStorage.getItem('activeProjectId');

  if (!projectId) {
      alert('No active project selected');
      return;
  }
  
  const story: Story = {
      name: nameInput.value,
      description: descriptionInput.value,
      priority: prioritySelect.value as "Low" | "Medium" | "High",
      projectId: projectId,
      creationDate: new Date(),
      state: statusSelect.value as "Todo" | "Doing" | "Done",
      ownerId: this.getCurrentUser()._id!
  };

  if (idInput.value) {
      await fetch(`http://localhost:3000/stories/${idInput.value}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(story),
      });
  } else {
      await fetch('http://localhost:3000/stories', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(story),
      });
  }

  this.resetForm();
  await this.renderStories();
}

public async editStory(id: string) {
  const response = await fetch(`http://localhost:3000/stories/${id}`);
  const story: Story = await response.json();

  const idInput = document.getElementById("story-id") as HTMLInputElement;
  const nameInput = document.getElementById("story-name") as HTMLInputElement;
  const descriptionInput = document.getElementById("story-description") as HTMLTextAreaElement;
  const prioritySelect = document.getElementById("story-priority") as HTMLSelectElement;
  const statusSelect = document.getElementById("story-status") as HTMLSelectElement;

  idInput.value = story._id!.toString();
  nameInput.value = story.name;
  descriptionInput.value = story.description;
  prioritySelect.value = story.priority;
  statusSelect.value = story.state;
}

public async deleteStory(id: string) {
  await fetch(`http://localhost:3000/stories/${id}`, {
    method: 'DELETE',
  });
  await this.renderStories();
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

    const backToProjectsBtn = document.getElementById("back-to-projects-btn");
    if (backToProjectsBtn) {
      backToProjectsBtn.addEventListener("click", () => this.goBackToProjects());
    }
  }

  private setupFilterChangeListener() {
    const filterDropdown = document.getElementById("story-filter") as HTMLSelectElement;
    filterDropdown.addEventListener("change", () => {
      this.renderStories();
    });
  }

  private getCurrentUser() {
    const userData = sessionStorage.getItem("userData");
    if (!userData) {
      throw new Error("User not logged in");
      
    }
    return JSON.parse(userData) as User;
  }

  // Display Tasks
  public async setActiveStory(storyId: string) {
    sessionStorage.setItem('activeStoryId', storyId);
    this.toggleStoryVisibility(false);
    await this.taskController.renderTasks();
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

  public goBackToProjects() {
    this.toggleStoryVisibility(false);
    const projectSection = document.getElementById("project-section");
    if (projectSection == null) return;
    projectSection.style.display = "block";
  }
}
