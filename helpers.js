function generateRandomString() {
  let results = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let charLength = char.length
  for (let i = 0; i < 6; i ++) {
    results += char.charAt(Math.floor(Math.random() * charLength))
  }
  return results;
}

const findMyUrls = (user_id, database) => {
  let urlForUser = {};
  for (const url in database) {
    if ( user_id === database[url].userID) {
      urlForUser[url] = database[url];
    }
  } 
  return urlForUser;
}

const findUser = (user_id, database) => {
  for (let user in database) {  
    if(user_id === database[user].id) {
      return database[user];
    }
  } 
  return false;
}

const getUserByEmail = (email, database) => {
  for (const user in database) { 
    if(email === database[user].email) {
      return database[user];
    }
  } 
  return false;
}

module.exports = {
  generateRandomString,
  findMyUrls,
  findUser,
  getUserByEmail,
}