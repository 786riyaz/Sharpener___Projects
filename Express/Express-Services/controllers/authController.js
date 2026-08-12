const authController = {
  login: (req, res, next) => {
    // res.send(`Logging in user: ${username}`);
    console.log(`Logging in user!, Valid User!`);
    next();
  },

  register: (req, res, next) => {
    const { username, password } = req.body;
    res.send(`Registering user: ${username}`);
    next();
  },
};

export default authController;
