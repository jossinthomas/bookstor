const Admin = require('./Admin');
const Member = require('./Member');

class UserFactory {
  static createUser(role, credentials) {
    switch (role) {
      case 'admin':
        return new Admin(credentials);
      case 'member':
        return new Member(credentials);
      default:
        throw new Error('Invalid user role');
    }
  }
}

module.exports = UserFactory;