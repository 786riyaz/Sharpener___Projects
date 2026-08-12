const User = require("./user");
const Post = require("./post");

// One User can have many Posts
User.hasMany(Post, {
  foreignKey: "UserId",
});

// Each Post belongs to one User
Post.belongsTo(User, {
  foreignKey: "UserId",
});

module.exports = {
  User,
  Post,
};
