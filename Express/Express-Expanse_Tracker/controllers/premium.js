// controllers/premium.js
import { User } from "../models/index.js";
const premiumController = {
// GET /premium/leaderboard
// Every user, with their total expense, ranked highest spender first.
// Users with no expenses at all still show up with a total of 0
// (totalExpense defaults to 0 on the User model).
//
// No JOIN or SUM anymore - User.totalExpense is kept in sync by
// expanseController.addExpanse / deleteExpanse on every write, so this
// is just a plain indexed read + sort.
getLeaderBoard: async (req, res) => {
try {
const rows = await User.findAll({
// attributes: ["id", "name", "totalExpense"],
attributes: ["name", "totalExpense"],
order: [["totalExpense", "DESC"]],
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
