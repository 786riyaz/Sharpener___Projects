const authController = {
  login: (req, res, next) => {
    // Implement your login logic here
    // res.send(`Logging in user: ${username}`);
    console.log(`Logging in user!, Valid User!`);
    next();
  },

  register: (req, res, next) => {
    const { username, password } = req.body;
    // Implement your registration logic here
    res.send(`Registering user: ${username}`);
    next();
  },
};

export default authController;
