const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const {generateRandomString, getUserByEmail, findMyUrls, findUser, } = require('./helpers');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['d4f15ecce3f38543a442e6065f7684a3','27dd33fb0c817d2f3cb8b3405f7684b7'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase,
    user: findUser(req.session.user_id, users)}; 
templateVars.user ? res.render("urls_new", templateVars) : res.redirect("/login")
});

app.set('view engine', 'ejs');

app.get("/urls", (req, res) => {
  const urlForUser = findMyUrls(req.session.user_id, urlDatabase)
  const templateVars = {urls: urlForUser, user: findUser(req.session.user_id, users)};
  console.log(templateVars.urls);
  templateVars.user ? res.render("urls_index", templateVars) : res.redirect("/login");
});

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: 'userRandomID'},
  "9sm5xK": {longURL: "http://www.google.com", userID: 'user2RandomID'}
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

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL.longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: findUser(req.session.user_id, users)};
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const user = req.session.user_id ? users[req.session.user_id] : null;
  templateVars = { user }
  res.render("urls_register", templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {urls: urlDatabase,
    user: findUser(req.session.user_id, users)};
res.render("urls_login", templateVars);
});

app.post("/register", (req, res) => {
  const {id, email, password} = req.body;
  if (email === '' || password === '') {
    return res.status(400).send("Please enter a valid email and/or password")
  } 
  let foundUser; 
  for (let id in users){
    if (users[id].email === email) {
    foundUser = users[id]; 
    break
    }
  }
  if (foundUser) {
    return res.status(400).send("Email is already in use")
  }
  const passkey = req.body.password;
  const hash = bcrypt.hashSync(passkey, 10);
  const userID = generateRandomString();
  users[userID] = { 
    id: userID,
    email: req.body.email,
    password: hash
  }
  req.session.user_id = userID;
  // console.log(users)
  return res.redirect("/urls")
});

app.post('/urls/:id/delete', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id]; 
    res.redirect("/urls") 
  } else {
    res.redirect("/login")
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    console.log(req.body.id, 'req param', req.session.id, 'session')
    urlDatabase[req.body.id] = req.body.newURL; 
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }    
}); 
// const urlDatabase = {
//   "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: 'userRandomID'},
//   "9sm5xK": {longURL: "http://www.google.com", userID: 'user2RandomID'}
// };

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] =  {longURL: req.body.longURL, userID: req.session.user_id};
  console.log(urlDatabase[id])
  res.redirect(`/urls/${id}`);
});

app.post('/login', (req, res) => {
  if (!getUserByEmail(req.body.email, users)) {
    res.redirect("/register");
 }
 for (const user in users) {
   if (users[user].email === req.body.email) {
    if (bcrypt.compareSync(req.body.password, getUserByEmail(req.body.email, users).password)) {
      req.session.user_id = users[user].id; 
    return res.redirect('/urls');
    }
   return res.status(403).send("Email and/or Password Incorrect");
    }
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls')
});
