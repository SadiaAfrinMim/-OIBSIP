/* script.js - Client-side application that interacts with the Express server API */
const registerContainer = document.getElementById('register-container');
const loginContainer = document.getElementById('login-container');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
let loginError, registerError, passwordStrength, strengthFill, strengthText, confirmPasswordField, passwordField;

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
    loginError = document.getElementById('login-error');
    registerError = document.getElementById('register-error');

    // Show login form by default
    loginContainer.classList.add('active');
    registerContainer.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');

    // Tab click handlers
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });

    // Password strength meter
    passwordField = document.getElementById('password');
    passwordStrength = document.getElementById('password-strength');
    strengthFill = document.getElementById('strength-fill');
    strengthText = document.getElementById('strength-text');
    if (passwordField) {
        passwordField.addEventListener('input', updatePasswordStrength);
    }

    // Confirm password validation
    confirmPasswordField = document.getElementById('confirm-password');
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', validateConfirmPassword);
    }

    // Form submission handlers
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Switch between login and register tabs
function switchTab(tab) {
    if (tab === 'login') {
        loginContainer.classList.add('active');
        registerContainer.classList.remove('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginError.textContent = '';
        registerError.textContent = '';
    } else {
        registerContainer.classList.add('active');
        loginContainer.classList.remove('active');
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerError.textContent = '';
        loginError.textContent = '';
    }
}

// Toggle password visibility
function togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const wrapper = button.parentElement;
    const input = wrapper.querySelector('input');
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    const eyeOpen = button.querySelector('.eye-open');
    const eyeClosed = button.querySelector('.eye-closed');
    if (eyeOpen) eyeOpen.style.display = type === 'password' ? 'block' : 'none';
    if (eyeClosed) eyeClosed.style.display = type === 'password' ? 'none' : 'block';
}

// Password strength meter
function updatePasswordStrength() {
    const password = passwordField.value;
    passwordStrength = document.getElementById('password-strength');
    strengthFill = document.getElementById('strength-fill');
    strengthText = document.getElementById('strength-text');

    if (!password) {
        if (passwordStrength) passwordStrength.hidden = true;
        return;
    }
    if (passwordStrength) passwordStrength.hidden = false;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[!@#$%^&*(),.?":{}|<>;]/.test(password)) strength += 25;

    if (strengthFill) strengthFill.style.width = strength + '%';
    if (strengthText) {
        strengthText.textContent = strength < 25 ? 'Weak' : strength < 50 ? 'Fair' : strength < 75 ? 'Good' : 'Strong';
    }
}

// Confirm password validation
function validateConfirmPassword() {
    const password = passwordField ? passwordField.value : '';
    if (confirmPasswordField && confirmPasswordField.value !== password) {
        confirmPasswordField.setCustomValidity('Passwords do not match');
    } else if (confirmPasswordField) {
        confirmPasswordField.setCustomValidity('');
    }
}

// Login form handler
async function handleLogin(e) {
    e.preventDefault();
    if (!loginError) loginError = document.getElementById('login-error');
    loginError.textContent = '';

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        loginError.textContent = 'Please fill in all fields.';
        return;
    }

    try {
        if (loginBtn) {
            loginBtn.disabled = true;
            const btnText = loginBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Signing In...';
        }

        const response = await fetch('/api/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            window.location.href = '/dashboard';
        } else {
            loginError.textContent = data.error || 'Login failed.';
        }
    } catch (error) {
        loginError.textContent = 'Network error. Please try again.';
        console.error('Login error:', error);
    } finally {
        if (loginBtn) {
            loginBtn.disabled = false;
            const btnText = loginBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Sign In';
        }
    }
}

// Registration form handler
async function handleRegister(e) {
    e.preventDefault();
    if (!registerError) registerError = document.getElementById('register-error');
    registerError.textContent = '';

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms');

    if (!username || !email || !password || !confirmPassword) {
        registerError.textContent = 'Please fill in all fields.';
        return;
    }
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match.';
        return;
    }
    if (password.length < 8) {
        registerError.textContent = 'Password must be at least 8 characters.';
        return;
    }
    if (!/\d/.test(password)) {
        registerError.textContent = 'Password must contain at least one number.';
        return;
    }
    if (terms && !terms.checked) {
        registerError.textContent = 'You must agree to the terms.';
        return;
    }

    try {
        if (registerBtn) {
            registerBtn.disabled = true;
            const btnText = registerBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Creating Account...';
        }

        const response = await fetch('/api/register', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            registerError.textContent = 'Registration successful! Please login.';
            registerError.style.color = 'green';
            switchTab('login');
        } else {
            registerError.textContent = data.error || 'Registration failed.';
        }
    } catch (error) {
        registerError.textContent = 'Network error. Please try again.';
        console.error('Registration error:', error);
    } finally {
        if (registerBtn) {
            registerBtn.disabled = false;
            const btnText = registerBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Create Account';
        }
    }
}

// Logout handler
async function handleLogout() {
    try {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
        console.error('Logout error:', error);
    }
    window.location.href = '/';
}

// Expose functions globally for the dashboard page
window.handleLogout = handleLogout;
window.switchTab = switchTab;