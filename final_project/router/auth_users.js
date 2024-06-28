const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const SECRET_KEY = '12345678'

const isValid = (username)=>{
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  req.session.token = token;

  res.json({ message: 'Login successful', token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const username = req.user.username;
  books[isbn].reviews[username] = review;

  res.json({ message: 'Review added/updated successfully' });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const username = req.user.username;

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: 'Review not found' });
  }

  delete books[isbn].reviews[username];

  res.json({ message: 'Review deleted successfully' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
