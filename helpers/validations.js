const Joi = require("joi");

const registrationValidation = (data) => {
    const schema = Joi.object({
    name: Joi.string().pattern(/^[a-zA-Z]+$/).min(3).max(30).required(),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
      'string.pattern.base': 'Password should contain at least one uppercase letter, one lowercase letter, one number and one special character',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().pattern(/^[6789]\d{9}$/).required().messages({
      'string.pattern.base': 'Phone number should start with 6, 7, 8 or 9 and have 10 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),
    
  
 });
  
    return schema.validate(data);
  };
  const adminValidation = (data) => {
    const schema = Joi.object({
    name: Joi.string().pattern(/^[a-zA-Z]+$/).min(3).max(30).required(),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
      'string.pattern.base': 'Password should contain at least one uppercase letter, one lowercase letter, one number and one special character',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().pattern(/^[6789]\d{9}$/).required().messages({
      'string.pattern.base': 'Phone number should start with 6, 7, 8 or 9 and have 10 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),
    adminType:Joi.string().required()
    
  
 });
  
    return schema.validate(data);
  };
  
  const loginValidation = (data) => {
    const schema = Joi.object({
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
      'string.pattern.base': 'Password should contain at least one uppercase letter, one lowercase letter, one number and one special character',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().pattern(/^[6789]\d{9}$/).required().messages({
      'string.pattern.base': 'Phone number should start with 6, 7, 8 or 9 and have 10 digits',
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),
    
    });
return schema.validate(data);
  };
  const validateenc=(data) => {
    const schema = Joi.object({
      enc: Joi.string().required(),
    });
    return schema.validate(data);
  };
  const validateGame = (data) => {
    const schema = Joi.object({
        userGuess: Joi.string().valid('high', 'low', 'equal').required(),
        gameId: Joi.string().min(1).required(),
       // betAmount:Joi.string().required()
   });

    return schema.validate(data);
};
const validateGames = (data) => {
  const schema = Joi.object({
    userGuess: Joi.string().valid('high', 'low', 'equal').required(),
    gameId: Joi.string().min(1).required(),
      
   
    betAmount: Joi.number().integer().min(1).max(3000).required().messages({
      'number.base': 'betAmount must be a number',
      'number.empty': 'betAmount is required',
      'number.integer': 'betAmount must be an integer',
      'number.min': 'betAmount must be at least 1',
      'number.max': 'betAmount must be at most 3000',
      'any.required': 'betAmount is required'
    })
  
 });

  return schema.validate(data);
};

  const validatedelete=(data) => {
    const schema = Joi.object({
     gameId:Joi.string().required()
    });
    return schema.validate(data);
  };
  const validatedata=(data) => {
    const schema = Joi.object({
     userid:Joi.string(),
     betid:Joi.string().required()
    });
    return schema.validate(data);
  };
  const validatehistory=(data) => {
    const schema = Joi.object({
     userid:Joi.string(),
     
    });
    return schema.validate(data);
  };
  




module.exports = {
 
  registrationValidation,
  validatedelete,
  loginValidation,
  validateenc,
  validateGame,
  adminValidation,
  validateGames,
  validatehistory,
  validateenc,
  validatedata
  

};
