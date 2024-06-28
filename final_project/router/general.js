const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  res.status(201).json({ message: 'Registration successful' });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const bookList = await new Promise((resolve, reject) => {
      resolve(books);
    });
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving books' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject('Book not found');
      }
    });
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const results = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.author === author);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject('No books found by this author');
      }
    });
    res.status(200).json(results);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const results = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(book => book.title === title);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject('No books found with this title');
      }
    });
    res.status(200).json(results);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});


//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.json(books[isbn].reviews);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

module.exports.general = public_users;
