import { v4 as uuidv4 } from "uuid";
import { Project } from "../models/ProjectModel";
import { ApiService } from "../api/ApiService";
import { StoryController } from "./StoryController";

export class ProjectController {
  private storageService: ApiService<Project>;
  private storyController = new StoryController();

  constructor() {
    this.storageService = new ApiService<Project>("projects");
    this.attachEventListeners();
  }

  public renderProjects() {
    const projects = this.storageService.getAllItems();
    const projectsList = document.getElementById("projects-list");

    if (projectsList) {
        projectsList.innerHTML = "";

        projects.forEach((project) => {
            const projectElement = document.createElement("div");
            projectElement.className = "card mb-3";
            projectElement.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${project.name}</h5>
                    <p class="card-text">${project.description}</p>
                    <button class="btn btn-secondary select-btn">Select</button>
                    <button class="btn btn-primary edit-btn">Edit</button>
                    <button class="btn btn-danger delete-btn">Delete</button>
                </div>`;

            const editBtn = projectElement.querySelector(".edit-btn") as HTMLButtonElement;
            const deleteBtn = projectElement.querySelector(".delete-btn") as HTMLButtonElement;
            const selectBtn = projectElement.querySelector(".select-btn") as HTMLButtonElement;

            if (editBtn) editBtn.onclick = () => this.editProject(project.id);
            if (deleteBtn) deleteBtn.onclick = () => this.deleteProject(project.id);
            if (selectBtn) selectBtn.onclick = () => this.setActiveProject(project.id);

            projectsList.appendChild(projectElement);
        });
    }
}
  public saveProject(event: Event) {
    console.log("Saving project");
    event.preventDefault();

    const idInput = document.getElementById("project-id") as HTMLInputElement;
    const nameInput = document.getElementById("project-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("project-description") as HTMLTextAreaElement;

    const project: Project = {
      id: idInput.value || uuidv4(),
      name: nameInput.value,
      description: descriptionInput.value,
    };

    if (idInput.value) {
      this.storageService.updateItem(project);
    } else {
      this.storageService.addItem(project);
    }

    this.resetForm();
    this.renderProjects();
  }

  public editProject(id: string) {
    const project = this.storageService.getItemById(id);
    if (project) {
      const idInput = document.getElementById("project-id") as HTMLInputElement;
      const nameInput = document.getElementById("project-name") as HTMLInputElement;
      const descriptionInput = document.getElementById("project-description") as HTMLTextAreaElement;

      idInput.value = project.id;
      nameInput.value = project.name;
      descriptionInput.value = project.description;
    }
  }

  public deleteProject(id: string) {
    this.storageService.deleteItem(id);
    this.renderProjects();
  }

  // Helper methods
  private resetForm() {
    const idInput = document.getElementById("project-id") as HTMLInputElement;
    const nameInput = document.getElementById("project-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("project-description") as HTMLTextAreaElement;

    idInput.value = "";
    nameInput.value = "";
    descriptionInput.value = "";
  }

  private attachEventListeners() {
    const projectForm = document.getElementById("project-form");
    console.log("Attaching event listener to project form");
    if (projectForm) {
      projectForm.addEventListener("submit", (event) => {
        console.log("Form submission triggered");
        this.saveProject(event);
    });
    }
  }

  // Seting active project and changing the UI
  public setActiveProject(id: string): void {
    this.storageService.setActiveProjectId(id);
    this.toggleProjectVisibility(false);
    this.storyController.renderStories();
    this.toggleStorySection(true);
  }

  public toggleProjectVisibility(show: boolean) {
    const projectSection = document.getElementById("project-section");
    if (projectSection == null) return;
    projectSection.style.display = show ? "block" : "none";
  }

  public toggleStorySection(show: boolean) {
    const storySection = document.getElementById("story-section");
    if (storySection == null) return;
    storySection.style.display = show ? "block" : "none";
  }
}
