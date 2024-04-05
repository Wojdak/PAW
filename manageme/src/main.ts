import { ProjectController } from '../src/components/controllers/ProjectController';

document.addEventListener('DOMContentLoaded', () => {
  const projectController = new ProjectController();
  projectController.renderProjects();
});
