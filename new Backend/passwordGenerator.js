const secureRandomPassword = require('secure-random-password');

const generatePassword = () => {
  return secureRandomPassword.randomPassword({
    length: 6,
    characters: [
      secureRandomPassword.lower, // Include lowercase letters
      secureRandomPassword.upper, // Include uppercase letters
      secureRandomPassword.digits, // Include digits
      secureRandomPassword.symbols, // Include symbols
    ],
  });
};

module.exports = { generatePassword };