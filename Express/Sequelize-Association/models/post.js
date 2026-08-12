const { DataTypes } = require("sequelize");

const sequelize = require("../utils/db-connection");

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "posts",
    timestamps: true,
  },
);

module.exports = Post;
