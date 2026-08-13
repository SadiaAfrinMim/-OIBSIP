const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(session({
  secret: 'randomsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const dataFile = path.join(__dirname, 'users.json');
let users = [];
try {
  const data = fs.readFileSync(dataFile, 'utf8');
  users = JSON.parse(data);
} catch (e) {
  users = [];
}

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing fields');
  if (users.some(u => u.username === username)) return res.status(409).send('Username exists');
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, password: hash });
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
  res.sendStatus(200);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).send('Invalid credentials');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send('Invalid credentials');
  req.session.user = user;
  res.sendStatus(200);
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, () => console.log('Server running on http://localhost:8080'));