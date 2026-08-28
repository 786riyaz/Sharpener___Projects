// middleware/auth.js
// Blocks access to a route unless the request carries a valid, logged-in session.
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "Please log in to continue." });
};

export default isAuthenticated;
