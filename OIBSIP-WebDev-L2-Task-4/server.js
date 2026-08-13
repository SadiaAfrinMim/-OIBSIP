const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Database file
const DB_FILE = path.join(__dirname, 'users.json');

// Initialize users database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Helper function to read users
function getUsers() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

// Helper function to write users
function saveUsers(users) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users));
}

// Helper function to hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Helper function to compare password
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Password validation: minimum 8 characters, at least 1 number
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  
  if (!/\d/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one number' });
  }
  
  const users = getUsers();
  const existingUser = users.find(user => user.username === username || user.email === email);
  
  if (existingUser) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Add new user
  users.push({
    id: Date.now(),
    username,
    email,
    password: hashedPassword
  });
  
  saveUsers(users);
  
  res.status(201).json({ message: 'Registration successful' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // Compare password
  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // Create session cookie
  res.cookie('user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
  
  res.json({ message: 'Login successful' });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('user');
  res.json({ message: 'Logout successful' });
});

// Protected route
app.get('/api/dashboard', (req, res) => {
  const userCookie = req.cookies.user;

  if (!userCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = JSON.parse(userCookie);
  res.json({ 
    message: `Welcome, ${user.username}!`,
    user
  });
});

// Dashboard page route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Export the app for Vercel
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}