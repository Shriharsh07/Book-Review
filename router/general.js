const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const { resolve } = require('path');
const fs = require('fs').promises;


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" })
    }
  }
  return res.status(300).json({ message: "Enter Username and Password" });
});


const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

// Get the book list available in the shop
function fetchBooks() {
  return new Promise((resolve) => {
    // Simulate a delay to mimic an asynchronous operation
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
}
public_users.get('/', async (req, res) => {
  try {
    const booksData = await fetchBooks();
    res.status(200).json({ books: booksData });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get book details based on ISBN
function fetchByIsbn(isbn) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(books[isbn])
    }, 1000)
  })
}
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn
    const booksData = await fetchByIsbn(isbn);
    res.status(200).json({ books: booksData });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  Object.keys(books).forEach((key) => {
    const book = books[key];
    if (book.author === author) {
      matchingBooks.push(book);
    }
  });
  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  }
  return res.status(300).json({ message: "Author does not existt" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  Object.keys(books).forEach((key) => {
    const book = books[key];
    if (book.title === title) {
      matchingBooks.push(book);
    }
  });
  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  }
  return res.status(300).json({ message: "No books with such title" });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const review = books[isbn].reviews;
  res.status(200).json(review)
  return res.status(300).json({ message: "No books with such ISBN" });
});

module.exports.general = public_users;
