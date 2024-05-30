import { Project } from "../models/ProjectModel";
import { StoryController } from "./StoryController";

export class ProjectController {
  private storyController = new StoryController();

  constructor() {
      this.attachEventListeners();
  }

  public async renderProjects() {
      const response = await fetch('http://localhost:3000/projects');
      const projects: Project[] = await response.json();
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

              if (editBtn) editBtn.onclick = () => this.editProject(project._id!.toString());
              if (deleteBtn) deleteBtn.onclick = () => this.deleteProject(project._id!.toString());
              if (selectBtn) selectBtn.onclick = () => this.setActiveProject(project._id!.toString());

              projectsList.appendChild(projectElement);
          });
      }
  }

  private async editProject(id: string) {
    const response = await fetch(`http://localhost:3000/projects/${id}`);
    const project: Project = await response.json();

    const idInput = document.getElementById("project-id") as HTMLInputElement;
    const nameInput = document.getElementById("project-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("project-description") as HTMLTextAreaElement;

    idInput.value = project._id!.toString();
    nameInput.value = project.name;
    descriptionInput.value = project.description;
}

  private async deleteProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
        await fetch(`http://localhost:3000/projects/${id}`, {
            method: 'DELETE',
        });
        await this.renderProjects();
    }
}

  public async saveProject(event: Event) {
    event.preventDefault();

    const idInput = document.getElementById("project-id") as HTMLInputElement;
    const nameInput = document.getElementById("project-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("project-description") as HTMLTextAreaElement;

    const project: Project = {
        name: nameInput.value,
        description: descriptionInput.value,
    };

    if (idInput.value) {
        await fetch(`http://localhost:3000/projects/${idInput.value}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        });
    } else {
        await fetch('http://localhost:3000/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        });
    }

    this.resetForm();
    await this.renderProjects();
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

  public async setActiveProject(id: string) {
    sessionStorage.setItem('activeProjectId', id);
    this.toggleProjectVisibility(false);
    await this.storyController.renderStories();
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
