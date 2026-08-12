import sendErrorResponse from "../utils/response.js";

const getAllUsers = (req, res) => {
  res.send("Fetching all users");
};

const getUserById = (req, res) => {
  const userId = req.params.id;
  if(userId <= 99){
    res.send(`Fetching user with ID: ${userId}`);
  } else {
    // Simulating error for userId
    sendErrorResponse(res,{statusCode:404, message:"User Not Found"})
  }
};

const addUser = (req, res) => {
  res.send("Adding a new user");
};

export { getAllUsers, getUserById, addUser };