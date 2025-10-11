/**
 * Basic validation middleware for API endpoints
 */

export const validateRegister = (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email'
    });
  }
  
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }
  
  next();
};

export const validateTrade = (req, res, next) => {
  const { symbol, amount } = req.body;
  
  if (!symbol || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Please provide symbol and amount'
    });
  }
  
  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0'
    });
  }
  
  next();
};

export const validateFundsOperation = (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0'
    });
  }
  
  next();
};