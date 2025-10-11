/**
 * 404 Not Found middleware
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      auth: '/api/auth',
      user: '/api/user',
      market: '/api/market',
      ml: '/api/ml',
      health: '/health'
    }
  });
};