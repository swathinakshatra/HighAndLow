const randomstring = require("randomstring");
const generateId = () => {
  const randomChars = randomstring.generate({
    length: 15, 
    charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  });

  const id = randomChars + "@game";
  return id;
}



module.exports = {generateId};

