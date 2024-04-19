import { UserController } from './components/controllers/UserController';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  loginForm.addEventListener('submit', (event) => UserController.loginUser(event));
});

