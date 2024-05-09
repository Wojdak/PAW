import { User } from "../models/UserModel";
import { ProjectController } from "./ProjectController";

export class UserController {
  static projectController = new ProjectController();

  static users: User[] = [
    { id: "1", firstName: "Jan", lastName: "Kowalski", role: "Admin" },
    { id: "2", firstName: "Anna", lastName: "Nowak", role: "Developer" },
    { id: "3", firstName: "Paweł", lastName: "Wiśniewski", role: "DevOps" },
  ];

  static getLoggedInUser(): User {
    return this.users.find((user) => user.role === "Admin") as User;
  }

  static getUsers(): User[] {
    return this.users;
  }

  static async loginUser(event: Event) {
    event.preventDefault();
    const username = (document.getElementById('login-username') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;


    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const data = await response.json();

    console.log('Login successful:', data);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('userData', JSON.stringify({ username}));

    this.toggleLoginFormVisibility(false);
    this.toggleProjectSection(true);
    this.updateUsernameDisplay();
  }

  static async loginUserGoogle(event: Event){
    event.preventDefault();
    const response = await fetch('http://localhost:3000/auth/google', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const data = await response.json();
    console.log('Login successful:', data);
  }

  static toggleLoginFormVisibility(show: boolean) {
    const loginSection = document.getElementById("login-section");
    if (loginSection === null) return;
    
    if (show) {
      loginSection.classList.remove("d-none"); 
    } else {
      loginSection.classList.add("d-none"); 
    }
  }

  static toggleProjectSection(show: boolean) {
    const projectSection = document.getElementById("project-section");
    if (projectSection == null) return;
    projectSection.style.display = show ? "block" : "none";
    this.projectController.renderProjects();
  }

  static updateUsernameDisplay() {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.username; 
        }
    }
  }


}

