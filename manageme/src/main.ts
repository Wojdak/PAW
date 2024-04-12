import { ProjectController } from '../src/components/controllers/ProjectController';

document.addEventListener('DOMContentLoaded', () => {
  const projectController = new ProjectController();
  projectController.renderProjects();
});

const user = {
  username: 'jkowal',
  password: '123'
}

const response = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(user)
})

if(response.ok){
  const data = await response.json();
  console.log(data)
}

