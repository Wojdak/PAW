import { UserController } from './components/controllers/UserController';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get('data');
    if (userData) {
        UserController.processGoogleLogin(userData);
    }

    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    loginForm.addEventListener('submit', (event) => UserController.loginUser(event));

    const googleLoginButton = document.getElementById('google-login-button') as HTMLButtonElement;
    googleLoginButton.addEventListener('click', (event) => {
        event.preventDefault();
        UserController.loginUserGoogle()
    });

    const themeToggle = document.getElementById('darkModeToggle') as HTMLFormElement;
    const htmlElement = document.documentElement as HTMLFormElement;

    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            htmlElement.setAttribute('data-bs-theme', 'light');
        } else {
            htmlElement.setAttribute('data-bs-theme', 'dark');
        }
    });
});

