const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');

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

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  };
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.set('view engine', 'ejs');

app.get("/urls", (req, res) => {
  let urlForUser = {};
  for (const url in urlDatabase) {
    if (req.cookies["user_id"] === urlDatabase[url].userID) {
      urlForUser[url] = urlDatabase[url];
    }
  }
  const templateVars = {urls: urlForUser, user: users[req.cookies["user_id"]]};
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies['user_id'] };
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
  res.cookie('user_id', userID);
  console.log(users)
  return res.redirect("/urls")
});

app.post('/urls/:id/delete', (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id]; 
    res.redirect("/urls") 
  } else {
    res.redirect("/login")
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.newURL; 
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
  urlDatabase[id] =  {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  console.log(urlDatabase[id])
  res.redirect(`/urls/${id}`);
});

app.post('/login', (req, res) => {
 if (req.body.email === '' || req.body.password === '') {
   res.status(403).send("Email and/or Password Required");
 }
 for (const user in users) {
   if (users[user].email === req.body.email) {
     if(bcrypt.compareSync(req.body.password, users[user].password))
    res.cookie('user_id', users[user].id);
    return res.redirect('/urls');
   } 
 }
  return res.status(403).send("Email not found");
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});
