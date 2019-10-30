// set up server with express library
const express = require('express');
const app = express();
const PORT = 8080;

// middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser());

// template engines
app.set('view engine', 'ejs');

// database
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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

// GET method route
app.get('/urls', (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies['username']
  };
  console.log(templateVars);
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// POST method route
app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);
});

app.post('/login', (req,res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req,res) => {
  res.clearCookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  let editURL = req.params.shortURL;
  urlDatabase[editURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// make server listening on pointed port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
