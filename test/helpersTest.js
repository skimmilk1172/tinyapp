const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    }
    // Write your assert statement here
    assert.deepEqual(expectedOutput, user);
  });
  it('should return false an not valid email', function() {
    const user = getUserByEmail("hello_whatsup@good.ca", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});