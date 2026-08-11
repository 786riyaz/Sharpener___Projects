const getAllUsers = (req, res) => {
  res.send("Fetching all users");
};

const getUserById = (req, res) => {
  const userId = req.params.id;
  res.send(`Fetching user with ID: ${userId}`);
};

const addUser = (req, res) => {
  res.send("Adding a new user");
};

export { getAllUsers, getUserById, addUser };