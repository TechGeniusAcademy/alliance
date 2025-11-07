const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data', 'users.json');

function readUsers() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read users.json', err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write users.json', err);
    return false;
  }
}

// GET /api/users - list users
app.get('/api/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

// POST /api/users - create user
app.post('/api/users', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const users = readUsers();
  const id = Date.now().toString();
  const newUser = {
    id,
    name,
    email,
    role,
    active: true,
    createdAt: new Date().toISOString()
  };
  users.unshift(newUser);
  writeUsers(users);
  res.status(201).json(newUser);
});

// PUT /api/users/:id - update user
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const users = readUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  users[idx] = { ...users[idx], name: name ?? users[idx].name, email: email ?? users[idx].email, role: role ?? users[idx].role };
  writeUsers(users);
  res.json(users[idx]);
});

// DELETE /api/users/:id - delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  let users = readUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  const removed = users.splice(idx, 1)[0];
  writeUsers(users);
  res.json(removed);
});

// PATCH /api/users/:id/block - toggle active state
app.patch('/api/users/:id/block', (req, res) => {
  const { id } = req.params;
  const users = readUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  users[idx].active = !users[idx].active;
  writeUsers(users);
  res.json(users[idx]);
});

// PATCH /api/users/:id/role - change role
app.patch('/api/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: 'Missing role' });
  const users = readUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  users[idx].role = role;
  writeUsers(users);
  res.json(users[idx]);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
