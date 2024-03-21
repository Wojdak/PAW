import { ProjectService } from './components/ProjectService';
import { Project } from './components/ProjectModel';
import { v4 as uuidv4 } from 'uuid';

//CRUD methods
function renderProjects() {
  const projects = ProjectService.getAllProjects();
  const projectsList = document.getElementById('projects-list');

  if (projectsList) {
    projectsList.innerHTML = '';

    projects.forEach((project) => {
      const projectElement = document.createElement('div');
      projectElement.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description}</p>`;

      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.onclick = () => editProject(project.id);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = () => deleteProject(project.id);

      projectElement.appendChild(editButton);
      projectElement.appendChild(deleteButton);

      projectsList.appendChild(projectElement);
    });
  }
}

function saveProject(event: Event) {
  event.preventDefault();
  
  const idInput = document.getElementById('project-id') as HTMLInputElement;
  const nameInput = document.getElementById('project-name') as HTMLInputElement;
  const descriptionInput = document.getElementById('project-description') as HTMLTextAreaElement;
  
  const project: Project = {
    id: idInput.value || createUniqueId(),
    name: nameInput.value,
    description: descriptionInput.value,
  };

  if(idInput.value) {
    ProjectService.updateProject(project);
  } else {
    ProjectService.addProject(project);
  }

  resetForm();
  renderProjects();
}

function editProject(id: string): any {
  const project = ProjectService.getAllProjects().find(p => p.id === id);
  if(project) {
    const idInput = document.getElementById('project-id') as HTMLInputElement;
    const nameInput = document.getElementById('project-name') as HTMLInputElement;
    const descriptionInput = document.getElementById('project-description') as HTMLTextAreaElement;

    idInput.value = project.id;
    nameInput.value = project.name;
    descriptionInput.value = project.description;
  }
}

function deleteProject(id: string): any {
  ProjectService.deleteProject(id);
  renderProjects();
}

//Helper methods
function createUniqueId(): string {
  return uuidv4(); 
}

function resetForm() {
  const idInput = document.getElementById('project-id') as HTMLInputElement;
  const nameInput = document.getElementById('project-name') as HTMLInputElement;
  const descriptionInput = document.getElementById('project-description') as HTMLTextAreaElement;

  idInput.value = '';
  nameInput.value = '';
  descriptionInput.value = '';
}

const projectForm = document.getElementById('project-form') as HTMLFormElement;
projectForm.addEventListener('submit', saveProject);


renderProjects();

