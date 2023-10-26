const tiger = require("tiger-balm");
var password = process.env.TIGER_PASSWORD;
var salt = process.env.TIGER_SALT;
module.exports = {
  encrypt: (text) => {
    try {
      console.log("Encrypting:", text);
      const encryptedData = tiger.encrypt(password, salt, text);
      console.log("Encrypted Data:", encryptedData);
      return encryptedData;
    } catch (error) {
      console.error("Encryption error:", error);
      throw error;
    }
  },
  decrypt: (text) => {
    try {
      console.log("Decrypting:", text);
      const decryptedData = tiger.decrypt(password, salt, text);
      console.log("Decrypted Data:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.error("Decryption error:", error);
      throw error;
    }
  },
};