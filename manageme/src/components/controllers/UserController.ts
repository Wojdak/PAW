import { ProjectController } from "./ProjectController";

export class UserController {
  private projectController = new ProjectController();

  public async loginUser(event: Event) {
    event.preventDefault();
    const username = (
      document.getElementById("login-username") as HTMLInputElement
    ).value;
    const password = (
      document.getElementById("login-password") as HTMLInputElement
    ).value;

    const response = await fetch("http://localhost:3000/auth/login", {
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

  public async loginUserGoogle() {
    window.location.href = "http://localhost:3000/auth/google";
  }

  public processGoogleLogin(userData: string) {
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

  public checkAuthOnLoad() {
    const token = sessionStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/auth/validate-token", {
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

  public logout() {
    // Clear client-side session storage
    sessionStorage.clear();
  
    // Send a request to the server to clear the server-side session
    fetch('http://localhost:3000/auth/logout', {
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

  private toggleLoginFormVisibility(show: boolean) {
    const loginSection = document.getElementById("login-section");
    if (loginSection === null) return;

    if (show) {
      loginSection.classList.remove("d-none");
    } else {
      loginSection.classList.add("d-none");
    }
  }

  private toggleProjectSection(show: boolean) {
    const projectSection = document.getElementById("project-section");
    if (projectSection == null) return;
    projectSection.style.display = show ? "block" : "none";
    this.projectController.renderProjects();
  }

  public updateUsernameDisplay() {
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
