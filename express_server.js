// set up server with express library
const express = require('express');
const app = express();
const PORT = 8080;

// middleware
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

// generating functions for data
const { generateRandomString, getUserByEmail, passwordMatch, urlsForUser } = require('./helpers.js');

// database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

// template engines
app.set('view engine', 'ejs');

// use middleware
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['tinyApp']
}));

app.use(morgan('dev'));

app.use((req, res, next) => {
  req.user = users[req.session.userID];

  next();
});

// GET method route
app.get('/', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  return res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const urls = urlsForUser(req.session.userID, urlDatabase);

  let templateVars = {
    urls: urls,
    user: req.user
  };

  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const urls = urlsForUser(req.session.userID, urlDatabase);

  let templateVars = {
    urls: urls,
    user: req.user
  };

  if (!req.user) {
    return res.redirect('/login');
  }

  return res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  const urls = urlsForUser(req.session.userID, urlDatabase);

  let templateVars = {
    urls: urls,
    user: req.user
  };

  return res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const urls = urlsForUser(req.session.userID, urlDatabase);

  let templateVars = {
    urls: urls,
    user: req.user
  };

  return res.render('urls_login', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const urls = urlsForUser(req.session.userID, urlDatabase);

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send('Huh? Bad Request - Error 400');
  }

  if (urlDatabase[req.params.shortURL].userID !== req.session.userID) {
    return res.status(403).send('Access Denied! You don\'t have permission to access - Error 403');
  }
  
  let templateVars = {
    urls: urls,
    user: req.user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  
  return res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  
  return res.redirect(longURL);
});

// POST method route
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  let randomURL = generateRandomString();

  urlDatabase[randomURL] = {
    longURL: req.body.longURL,
    userID: userID
  };

  return res.redirect(`/urls/${randomURL}`);
});

app.post('/login', (req, res) => {
  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send('Access Denied! Double check your email or passport - Error 403');
  }
  
  if (!passwordMatch(req.body.email, req.body.password, users)) {
    return res.status(403).send('Access Denied! Double check your email or passport - Error 403');
  }

  for (const userID in users) {
    if (users[userID].email === req.body.email) {
      req.session.userID = userID;
    }
  }

  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session.userID = null;

  return res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password || getUserByEmail(req.body.email, users)) {
    return res.status(400).send('Huh? Bad Request - Error 400');
  }
  
  let userRandomID = generateRandomString();
  
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.userID = userRandomID;
  
  return res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  let shortURL = req.params.shortURL;

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID
  };
  
  return res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID !== req.session.userID) {
    return res.status(403).send('Access Denied! You don\'t have permission to access - Error 403');
  }

  delete urlDatabase[shortURL];
  return res.redirect('/urls');
});

// make server listening on pointed port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
