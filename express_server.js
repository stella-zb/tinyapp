const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString() {
  let randomString = '';
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++)
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  return randomString;
};

// app.get('/', (req, res) => {
//   res.send('Hello!');
// });

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
app.post("/urls", (req, res) => {
  console.log(req.body); 
  let randomURL = generateRandomString(); 
  urlDatabase[randomURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randomURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  console.log(templateVars);
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
