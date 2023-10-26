const teleg = require("../helpers/telegram");

module.exports = function (handler, routeName) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (ex) {
      const errorMessage = `Error in ${routeName} route --> ${ex.message}`;
      await teleg.alert_Developers(errorMessage);
      next(new Error(errorMessage));
    }
  };
};