let requestCount = {};
export function rateLimiter(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  requestCount[ip] = (requestCount[ip] || 0) + 1;
  if (requestCount[ip] > 100) {
    return res.status(429).json({ error: "Too many requests" });
  }
  setTimeout(() => delete requestCount[ip], 60000);
  next();
}