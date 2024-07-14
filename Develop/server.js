const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Define the database file path
const dbFilePath = path.join(__dirname, 'db', 'db.json');

// Helper function to read the database file
const readDB = () => {
  const data = fs.readFileSync(dbFilePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write to the database file
const writeDB = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

// API Routes
app.post('/api/notes', (req, res) => {
  const db = readDB();
  req.body.id = uuidv4(); // Generate a unique ID
  db.push(req.body);
  writeDB(db);
  res.json(db);
});

app.get('/api/notes', (req, res) => {
  const db = readDB();
  res.json(db);
});

app.delete('/api/notes/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const newDB = db.filter(note => note.id !== id);
  writeDB(newDB);
  res.json(newDB);
});

app.delete('/api/notes', (req, res) => {
  const emptyDB = [];
  writeDB(emptyDB);
  res.json(emptyDB);
});

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware for 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));
