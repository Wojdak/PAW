import { UserController } from './components/controllers/UserController';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    UserController.checkAuthOnLoad();

    // Check if user is logging in with Google
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get('data');
    if (userData) {
        UserController.processGoogleLogin(userData);
    }

    // BUTTON EVENT LISTENERS
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    loginForm.addEventListener('submit', (event) => UserController.loginUser(event));

    const googleLoginButton = document.getElementById('google-login-button') as HTMLButtonElement;
    googleLoginButton.addEventListener('click', (event) => {
        event.preventDefault();
        UserController.loginUserGoogle()
    });

    document.getElementById('logout-button')?.addEventListener('click', () => {
        UserController.logout();
    });

    // THEME TOGGLE
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

