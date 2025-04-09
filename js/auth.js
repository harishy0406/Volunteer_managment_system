/**
 * AUTHENTICATION MODULE FOR VOLUNTEER HUB
 * Handles user authentication, session management, and storage initialization
 */

// Initialize application storage with sample data if empty
function initializeStorage() {
    try {
        // Initialize users if not exists
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 'org1',
                    name: 'Community Org',
                    email: 'org@example.com',
                    password: 'org123',
                    role: 'organizer'
                },
                {
                    id: 'vol1',
                    name: 'John Volunteer',
                    email: 'vol@example.com',
                    password: 'vol123',
                    role: 'volunteer'
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Initialize events if not exists
        if (!localStorage.getItem('events')) {
            const defaultEvents = [
                {
                    id: 'evt' + Date.now(),
                    title: 'BLOOD DONATION CAMP',
                    description: 'The Youth Red Cross Association, VIT Vellore',
                    date: '2025-04-10',
                    time: '09:00',
                    location: 'Vellore Institute of Technology',
                    volunteersNeeded: 100,
                    volunteers: ['vol1'],
                    organizerId: 'org1',  // Changed to match the organizer ID
                    image: 'https://ibb.co/mCdHRwMr',
                    status: 'active'
                }
            ];
            localStorage.setItem('events', JSON.stringify(defaultEvents));
        }
    } catch (error) {
        console.error('Storage initialization failed:', error);
    }
}

// Setup authentication event listeners
function setupAuthForms() {
    // Tab switching
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginTab && signupTab && loginForm && signupForm) {
        loginTab.addEventListener('click', switchToLogin);
        signupTab.addEventListener('click', switchToSignup);
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Switch to login tab
function switchToLogin() {
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('signup-tab').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
    document.getElementById('signup-form').classList.remove('active');
}

// Switch to signup tab
function switchToSignup() {
    document.getElementById('signup-tab').classList.add('active');
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;
    
    if (!email || !password || !role) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => 
            u.email === email && 
            u.password === password && 
            u.role === role
        );
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            redirectAfterLogin(user.role);
        } else {
            alert('Invalid credentials or role. Please try again.');
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert('An error occurred during login. Please try again.');
    }
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    if (!name || !email || !password || !role) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Validate email format
        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Check if email exists
        if (users.some(u => u.email === email)) {
            alert('Email already registered. Please login instead.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'user' + Date.now(),
            name,
            email,
            password, // In a real app, you should hash the password
            role
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        alert('Account created successfully!');
        redirectAfterLogin(role);
    } catch (error) {
        console.error('Signup failed:', error);
        alert('An error occurred during signup. Please try again.');
    }
}

// Redirect user after successful login/signup
function redirectAfterLogin(role) {
    const redirectPage = role === 'organizer' 
        ? 'organizer-dash.html' 
        : 'volunteer-dash.html';
    window.location.href = redirectPage;
}

// Simple email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }
}

// Check if user is authenticated
function checkAuth() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentPath = window.location.pathname.split('/').pop();
        
        // Allow access to index.html when not authenticated
        if (currentPath === 'index.html') {
            if (currentUser) {
                redirectAfterLogin(currentUser.role);
            }
            return;
        }
        
        // Redirect to login if not authenticated
        if (!currentUser) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = 'index.html';
    }
}

// Check user role for authorization
function checkRole(allowedRoles) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !allowedRoles.includes(currentUser.role)) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Role check failed:', error);
        window.location.href = 'index.html';
    }
}

// Initialize the authentication module
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    setupAuthForms();
    setupLogout();
    checkAuth();
});