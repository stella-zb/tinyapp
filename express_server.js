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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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

// GET method route
app.get('/urls', (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies['username'],
    user: user
  };
  console.log(templateVars);
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies['username'],
    user: user
  };
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies['username'],
    user: user
  };
  res.render('urls_register', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies['user_id']];
  let templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username'],
    user: user
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

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password || emailLookup(req.body.email)) {
    res.sendStatus(400);
  } else {
    let userRandomID = generateRandomString();
    users[userRandomID] = { 
      id: userRandomID, 
      email: req.body.email, 
      passport: req.body.password
    };

    res.cookie('user_id', userRandomID);
    res.redirect('/urls');
  }
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
