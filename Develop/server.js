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
let db = require(dbFilePath);

// API Routes
app.post('/api/notes', function (req, res) {
  req.body.id = uuidv4(); // Generate a unique ID

  db.push(req.body);

  fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save note' });
    }
    res.json(db);
  });
});

app.get('/api/notes', function (req, res) {
  res.json(db);
});

app.delete('/api/notes/:id', function (req, res) {
  const id = req.params.id;
  const noteIndex = db.findIndex(note => note.id === id);

  if (noteIndex !== -1) {
    db.splice(noteIndex, 1);
  }
  
  fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete note' });
    }
    res.json(db);
  });
});

// New route to clear the db.json file
app.delete('/api/notes', function (req, res) {
  db = [];

  fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear notes' });
    }
    res.json(db);
  });
});

// HTML Routes
const NOTES_HTML_PATH = path.join(__dirname, 'public', 'notes.html');
const INDEX_HTML_PATH = path.join(__dirname, 'public', 'index.html');

app.get('/notes', (req, res) => {
  res.sendFile(NOTES_HTML_PATH, (err) => {
    if (err) {
      res.status(500).send('Failed to load the notes page.');
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(INDEX_HTML_PATH, (err) => {
    if (err) {
      res.status(500).send('Failed to load the index page.');
    }
  });
});

// Error handling middleware for 404 errors
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// API route for fetching all notes
app.get('/api/notes', (req, res) => {
  res.json(allNotes);
});

// API route for adding a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  allNotes.push(newNote);
  fs.writeFile('./db/db.json', JSON.stringify(allNotes, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to save note' });
    }
    res.status(201).json(newNote);
  });
});

// API route for deleting a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const noteIndex = allNotes.findIndex(note => note.id === id);

  if (noteIndex === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }

  allNotes.splice(noteIndex, 1);

  fs.writeFile('./db/db.json', JSON.stringify(allNotes, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete note' });
    }
    res.status(204).end();
  });
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
