import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// One row per report file a premium user has generated. We store the S3
// object key (not the presigned URL itself, since presigned URLs expire) -
// a fresh URL is signed on the fly whenever this row is read back out.
const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "reports",
    timestamps: true, // createdAt doubles as "date downloaded/generated"
  },
);

export default Report;
