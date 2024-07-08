const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique IDs

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Path to the db.json file
const dbFilePath = path.resolve(__dirname, 'db', 'db.json');

// Function to read notes from db.json
const readNotesFromFile = () => {
  const data = fs.readFileSync(dbFilePath, 'utf8');
  return JSON.parse(data);
};

// Function to write notes to db.json
const writeNotesToFile = (notes) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(notes, null, 2));
};

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
  const allNotes = readNotesFromFile();
  res.json(allNotes);
});

// A route for adding a new note
app.post('/api/notes', (req, res) => {
  const newNote = {
    id: uuidv4(), // Generate unique ID
    title: req.body.title,
    text: req.body.text,
  };

  const allNotes = readNotesFromFile();
  allNotes.push(newNote);
  writeNotesToFile(allNotes);

  res.status(201).json(newNote);
});

// Route for deleting a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const allNotes = readNotesFromFile();

  const noteIndex = allNotes.findIndex((note) => note.id === id);
  if (noteIndex === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }

  allNotes.splice(noteIndex, 1);
  writeNotesToFile(allNotes);

  res.status(204).end();
});

// Start server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
