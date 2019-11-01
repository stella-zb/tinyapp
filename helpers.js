const bcrypt = require('bcrypt');

// generate the random string
const generateRandomString = () => {
  let randomString = '';
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return randomString;
};

// check if email exist in users database
const getUserByEmail = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    } else {
      return undefined;
    }
  }
};

// check if email password match in users database
const passwordMatch = (email, password, database) => {
  for (const userID in database) {
    const user = database[userID];
    if (user.email === email && bcrypt.compareSync(password, user.password)) {
      return true;
    }
  }
  return false;
};

// find the urls that have same user id
const urlsForUser = (id, database) => {
  let urls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      urls[shortURL] = (database[shortURL]);
    }
  }
  return urls;
};

module.exports = { generateRandomString, getUserByEmail, passwordMatch, urlsForUser };