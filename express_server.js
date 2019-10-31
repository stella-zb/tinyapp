// set up server with express library
const express = require('express');
const app = express();
const PORT = 8080;

// middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const morgan = require('morgan');
app.use(morgan('dev'));


// template engines
app.set('view engine', 'ejs');

// database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// generating functions for data
const generateRandomString = () => {
  let randomString = '';
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return randomString;
};

const emailLookup = (email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return true;
    }
  }
};

const passwordMatch = (email, password) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email && user.password === password) {
      return true;
    }
  }
  return false;
};

const urlsForUser = (id) => {
  let urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = (urlDatabase[shortURL]);
    }
  }
  return urls;
};

// GET method route
app.get('/urls', (req, res) => {
  const user = users[req.cookies['user_id']];
  const urls = urlsForUser(req.cookies['user_id']);
  let templateVars = {
    urls: urls,
    user: user
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']];
  const urls = urlsForUser(req.cookies['user_id']);
  let templateVars = {
    urls: urls,
    user: user
  };
  if (!user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/register', (req, res) => {
  const user = users[req.cookies['user_id']];
  const urls = urlsForUser(req.cookies['user_id']);
  let templateVars = {
    urls: urls,
    user: user
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.cookies['user_id']];
  const urls = urlsForUser(req.cookies['user_id']);
  let templateVars = {
    urls: urls,
    user: user
  };
  res.render('urls_login', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies['user_id']];
  const urls = urlsForUser(req.cookies['user_id']);
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== req.cookies['user_id']) {
    res.sendStatus(403);
  } else {
    let templateVars = {
      urls: urls,
      user: user,
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL
    };
    console.log(templateVars);
    res.render('urls_show', templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// POST method route
app.post("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = { longURL: req.body.longURL, userID: userID };
  res.redirect(`/urls/${randomURL}`);
});

app.post('/login', (req, res) => {
  if (!emailLookup(req.body.email)) {
    res.sendStatus(403);
  }
  if (!passwordMatch(req.body.email, req.body.password)) {
    res.sendStatus(403);
  } else {
    for (const userID in users) {
      if (users[userID].email === req.body.email) {
        res.cookie('user_id', userID);
      }
    }
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id', req.body.userID);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password || emailLookup(req.body.email)) {
    res.sendStatus(400);
  } else {
    let userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userRandomID);
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userID };
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== req.cookies['user_id']) {
    res.sendStatus(403);
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

// make server listening on pointed port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
