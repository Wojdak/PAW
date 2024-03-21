import { Project } from "./ProjectModel";

export class ProjectService {
  static localStorageKey = "projects";

  static getAllProjects(): Project[] {
    const projects = localStorage.getItem("projects");
    return projects ? JSON.parse(projects) : [];
  }
  
  static getProjectById(projectId: string): Project | undefined {
    const projects = this.getAllProjects();
    return projects.find(project => project.id === projectId);
  }

  static addProject(project: Project): void {
    const projects = this.getAllProjects();
    projects.push(project);
    localStorage.setItem("projects", JSON.stringify(projects));
  }

  static updateProject(updatedProject: Project): void {
    let projects = this.getAllProjects();
    projects = projects.map(project => project.id === updatedProject.id ? updatedProject : project);
    localStorage.setItem("projects", JSON.stringify(projects));
  }

  static deleteProject(projectId: string): void {
    const projects = this.getAllProjects().filter(project => project.id !== projectId);
    localStorage.setItem("projects", JSON.stringify(projects));
  }
}