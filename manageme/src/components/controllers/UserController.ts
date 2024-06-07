import { User } from "../models/UserModel";
import { ProjectController } from "./ProjectController";

export class UserController {
  static projectController = new ProjectController();

  static getLoggedInUser(): User | null {
    const userData = sessionStorage.getItem("userData");
    if (userData) {
      console.log(userData);
      return JSON.parse(userData) as User;
    }
    return null;
  }

  static async getUsers(): Promise<User[]> {
    const response = await fetch("http://localhost:3000/users");
    const users: User[] = await response.json();
    return users;
  }

  static async loginUser(event: Event) {
    event.preventDefault();
    const username = (
      document.getElementById("login-username") as HTMLInputElement
    ).value;
    const password = (
      document.getElementById("login-password") as HTMLInputElement
    ).value;

    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Failed to login");
    }

    const data = await response.json();

    console.log("Login successful:", data);
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    sessionStorage.setItem("userData", JSON.stringify(data.user));
    sessionStorage.setItem("userRole", JSON.stringify(data.user.role));
    sessionStorage.setItem("userId", JSON.stringify(data.user._id));

    this.toggleLoginFormVisibility(false);
    this.toggleProjectSection(true);
    this.updateUsernameDisplay();
  }

  static async loginUserGoogle() {
    window.location.href = "http://localhost:3000/auth/google";
  }

  static processGoogleLogin(userData: string) {
    try {
      const user = JSON.parse(decodeURIComponent(userData));
      sessionStorage.setItem("userData", userData);
      sessionStorage.setItem("username", user.username);
      sessionStorage.setItem("userRole", user.role);
      sessionStorage.setItem("userId", user._id);
      sessionStorage.setItem("token", user.token);
      this.updateUsernameDisplay();
      this.toggleLoginFormVisibility(false);
      this.toggleProjectSection(true);
    } catch (error) {
      console.error("Error processing Google login:", error);
    }
  }

  static checkAuthOnLoad() {
    const token = sessionStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.valid) {
            this.toggleLoginFormVisibility(false);
            this.toggleProjectSection(true);
            this.updateUsernameDisplay();
          } else {
            this.logout();
          }
        })
        .catch(() => {
          this.logout();
        });
    }
  }

  static logout() {
    // Clear client-side session storage
    sessionStorage.clear();
  
    // Send a request to the server to clear the server-side session
    fetch('http://localhost:3000/logout', {
      method: 'GET',
      credentials: 'include' // Ensure cookies are sent with the request
    })
    .then(() => {
      this.toggleLoginFormVisibility(true);
      this.toggleProjectSection(false);
      window.location.href = "http://localhost:5173";
    })
    .catch(error => {
      console.error('Error during logout:', error);
      alert('Failed to log out properly. Please try again.');
    });
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
    const userData = sessionStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      const usernameDisplay = document.getElementById("username-display");
      if (usernameDisplay) {
        usernameDisplay.textContent = user.username;
      }

      const logoutButton = document.getElementById("logout-button");
      if (logoutButton) {
        logoutButton.style.display = "inline-block";
      }
    }
  }
}
