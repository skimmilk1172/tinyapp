const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  let results = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let charLength = char.length
  for (let i = 0; i < 6; i ++) {
    results += char.charAt(Math.floor(Math.random() * charLength))
  }
  return results;
}

const addNewUser = (email, password) => {
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email,
    password
  }
  users[userID] = newUser;
  return userID;
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

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] =  req.body.longURL
    console.log(urlDatabase[shortURL])
    res.redirect(`/urls/${shortURL}`);

});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.set('view engine', 'ejs');

app.get('/urls', (req, res) => {
  let cookieID = req.cookies["user_id"];
  let userObject = users[cookieID];
  console.log(cookieID);
  const templateVars = { 
  urls: urlDatabase, 
  user: userObject};
  res.render('urls_index', templateVars);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
  user: null
  };
  res.render("urls_register", templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: null
    };
    res.render("urls_login", templateVars);
})

app.post("/register", (req, res) => {
  const {id, email, password} = req.body;
  if (email === '' || password === '') {
    return res.redirect("/400")
  } 
  let foundUser; 
  for (let id in users){
    if (users[id].email === email) {
    foundUser = usersDataBase[id]; 
    break
    }
  }
  if (foundUser) {
    return res.redirect("/400")
  }
  let userID = generateRandomString(5);
  users[userID] = { 
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', userID);
  return res.redirect("/urls")
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  console.log(req.body.username);
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('urls')
});
