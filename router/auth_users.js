const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (username === users.username) {
    return false;
  }
  else {
    return true;
  }
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validUsers.length > 0) {
    return true;
  }
  else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" })
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in")
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.username; // Assuming you have session handling middleware
  // Check if the ISBN already has reviews
  if (books[isbn]) {
    // Check if the user already posted a review for the same ISBN
    if (books[isbn].reviews[username]) {
      // Modify the existing review
      books[isbn].reviews[username] = review;
    } else {
      // Add a new review for the same ISBN and username
      books[isbn].reviews[username] = review;
    }
    // Return a success message
    res.status(200).json({ message: "Review added/modified successfully" });
  } else {
    // ISBN not found
    res.status(404).json({ message: "Book not found" });
  }
  return res.status(300).json({ message: "Error" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username; // Assuming you have set req.session.username elsewhere

  // Check if the ISBN already has reviews
  if (books[isbn]) {
    // Check if the user has posted a review for the specified ISBN
    if (books[isbn].reviews[username]) {
      // Delete the user's review
      delete books[isbn].reviews[username];

      // Return a success message
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      // User hasn't posted a review for this ISBN
      return res.status(404).json({ message: "Review not found for the specified ISBN" });
    }
  } else {
    // ISBN not found
    return res.status(404).json({ message: "Book not found" });
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
