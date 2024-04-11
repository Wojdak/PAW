import { v4 as uuidv4 } from "uuid";
import { Project } from "../models/ProjectModel";
import { ApiService } from "../api/ApiService";
import { ActiveProjectService } from "../api/ActiveProjectService";
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
        projectElement.innerHTML = `
          <h3>${project.name}</h3>
          <p>${project.description}</p>`;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => this.editProject(project.id);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => this.deleteProject(project.id);

        const selectButton = document.createElement("button");
        selectButton.textContent = "Select";
        selectButton.onclick = () => this.setActiveProject(project.id);

        projectElement.appendChild(selectButton);
        projectElement.appendChild(editButton);
        projectElement.appendChild(deleteButton);

        projectsList.appendChild(projectElement);
      });
    }
  }

  public saveProject(event: Event) {
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
    if (projectForm) {
      projectForm.addEventListener("submit", (event) =>
        this.saveProject(event)
      );
    }
  }

  // Seting active project and changing the UI
  public setActiveProject(id: string): void {
    ActiveProjectService.setActiveProjectId(id);
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
