const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Use express.json() to parse JSON request bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Simple Bookstore Backend');
});

app.get('/api/books', (req, res) => {
  const books = [
    { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', price: 25.00 },
    { id: '2', title: 'Pride and Prejudice', author: 'Jane Austen', price: 15.00 },
    { id: '3', title: '1984', author: 'George Orwell', price: 20.00 },
  ];
  res.json(books);
});

const port = 5001; // Or any desired port
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
