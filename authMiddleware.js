// pages/api/authMiddleware.js

export function checkAuth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // You can later verify the token here using Firebase Admin SDK

  next(); // Allow the route to continue
}
