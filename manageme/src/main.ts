import { UserController } from './components/controllers/UserController';

document.addEventListener('DOMContentLoaded', () => {
  fetchUserInfo();
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  loginForm.addEventListener('submit', (event) => UserController.loginUser(event));
});

function fetchUserInfo() {
  fetch('http://localhost:3000/userinfo')
      .then(response => response.json())
      .then(user => {
          if (user && user.username) {
              updateUsernameDisplay(user.username);
          }
      })
      .catch(error => {
          console.error('Failed to fetch user info:', error);
      });
}

function updateUsernameDisplay(username: string | null) {
  const usernameDisplay = document.getElementById('username-display');
  if (usernameDisplay) {
      usernameDisplay.textContent = username;
  }
}