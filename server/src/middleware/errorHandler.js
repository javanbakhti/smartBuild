export const notFound = (req, res, next) => {
  // Don't log 404s for common browser requests
  if (req.originalUrl === '/' || req.originalUrl === '/favicon.ico') {
    return res.status(404).json({ message: 'Not Found' });
  }
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error to console for debugging
  console.error("❌ Error:", {
    message: err.message,
    name: err.name,
    code: err.code,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body ? JSON.stringify(req.body).substring(0, 200) : "no body",
  });
  
  // Don't expose stack trace in production
  const response = {
    message: err.message || "Server Error",
  };
  
  // Only include stack in development
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
    response.details = {
      name: err.name,
      code: err.code,
    };
  }
  
  res.status(statusCode).json(response);
};

