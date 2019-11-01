const getUserByEmail = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    } else {
      return undefined;
    }
  }
};

module.exports = { getUserByEmail };