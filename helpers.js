const getUserByEmail = (email, database) => {
  for (const userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return true;
    } else {
      return false;
    }
  }
};

module.exports = { getUserByEmail };