const teleg = require("../helpers/telegram");

const asyncMiddleware = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      await teleg.alert_Developers(error);
      return res.status(400).send(`error in route -->${error.message}`);
    }
  };
};

module.exports = asyncMiddleware;
