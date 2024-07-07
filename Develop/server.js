const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

const allNotes = require('./db/db.json');

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

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
