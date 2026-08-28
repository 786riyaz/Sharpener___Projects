// controllers/premium.js
import sequelize from "../config/db.js";
import { User, Expanse } from "../models/index.js";

const premiumController = {
  // GET /premium/leaderboard
  // Every user, with their total expense, ranked highest spender first.
  // Users with no expenses at all still show up with a total of 0.
  getLeaderBoard: async (req, res) => {
    try {
      const rows = await User.findAll({
        attributes: [
          "id",
          "name",
          [
            sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.col("expanses.amount")), 0),
            "totalExpense",
          ],
        ],
        include: [
          {
            model: Expanse,
            as: "expanses",
            attributes: [],
          },
        ],
        group: ["User.id", "User.name"],
        order: [[sequelize.literal("totalExpense"), "DESC"]],
        raw: true,
      });

      const leaderboard = rows.map((row) => ({
        id: row.id,
        name: row.name,
        totalExpense: Number(row.totalExpense),
      }));

      res.status(200).json(leaderboard);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to load leaderboard." });
    }
  },
};

export default premiumController;
