import sequelize from "../config/db.js";
import Expanse from "../models/Expanse.js";
import User from "../models/User.js";
import { suggestCategory, getSpendingInsight } from "../services/geminiService.js";
const expanseController = {
// POST /expanse - add a new expense for the logged-in user
addExpanse: async (req, res) => {
const t = await sequelize.transaction();
try {
let { category, description, amount } = req.body;
if (!description || amount === undefined || amount === "") {
await t.rollback();
return res.status(400).json({ error: "Description and amount are required." });
}
if (isNaN(amount) || Number(amount) <= 0) {
await t.rollback();
return res.status(400).json({ error: "Amount must be a positive number." });
}
// AI brain: if the client didn't send a category (e.g. the user left
// it blank, or the frontend never called /expanse/suggest-category),
// let Gemini classify the description so every expense still gets a
// sensible category automatically.
if (!category || !category.trim()) {
category = await suggestCategory(description);
}
const numericAmount = Number(amount);
const expanse = await Expanse.create(
{
category,
description,
amount: numericAmount,
userId: req.userId,
},
{ transaction: t },
);
// Keep User.totalExpense in sync with the expanses table, in the same
// transaction as the insert above. increment() issues an atomic
// `UPDATE ... SET totalExpense = totalExpense + ?` at the DB level,
// so concurrent requests for the same user can't race/clobber each
// other the way a read-modify-write in JS would.
await User.increment({ totalExpense: numericAmount }, { where: { id: req.userId }, transaction: t });
await t.commit();
res.status(201).json(expanse);
} catch (error) {
await t.rollback();
console.error("Add expanse error:", error);
res.status(500).json({ error: "Failed to add expense." });
}
},
// POST /expanse/suggest-category - AI category suggestion for the
// description the user is currently typing, called live from the
// frontend before the expense is actually submitted.
suggestCategory: async (req, res) => {
try {
const { description } = req.body;
if (!description || !description.trim()) {
return res.status(400).json({ error: "Description is required." });
}
const category = await suggestCategory(description);
res.status(200).json({ category });
} catch (error) {
console.error("Suggest category error:", error);
res.status(500).json({ error: "Failed to suggest a category." });
}
},
// GET /expanse/insights - AI-generated observation/tip based on the
// logged-in user's recent spending. "Innovative use of AI elsewhere"
// deliverable.
getInsights: async (req, res) => {
try {
const expanses = await Expanse.findAll({
where: { userId: req.userId },
attributes: ["category", "description", "amount", "createdAt"],
order: [["createdAt", "DESC"]],
limit: 30,
});
const insight = await getSpendingInsight(expanses);
res.status(200).json({ insight });
} catch (error) {
console.error("Get insights error:", error);
res.status(500).json({ error: "Failed to generate insight." });
}
},
// GET /expanse - fetch every expense that belongs to the logged-in user
getExpanse: async (req, res) => {
try {
const expanses = await Expanse.findAll({
where: { userId: req.userId },
attributes: ["id", "category", "description", "amount", "createdAt"],
order: [["createdAt", "DESC"]],
});
res.status(200).json(expanses);
} catch (error) {
console.error("Get expanse error:", error);
res.status(500).json({ error: "Failed to fetch expenses." });
}
},
// DELETE /expanse/:id - remove one of the logged-in user's own expenses
deleteExpanse: async (req, res) => {
const t = await sequelize.transaction();
try {
const { id } = req.params;
// Need the amount before it's gone, so we know how much to subtract
// from User.totalExpense. Locked (FOR UPDATE) so a concurrent delete
// of the same row can't read a stale amount.
const expanse = await Expanse.findOne({
where: { id, userId: req.userId },
transaction: t,
lock: t.LOCK.UPDATE,
});
if (!expanse) {
await t.rollback();
return res.status(404).json({ error: "Expense not found." });
}
const amount = expanse.amount;
await expanse.destroy({ transaction: t });
await User.decrement({ totalExpense: amount }, { where: { id: req.userId }, transaction: t });
await t.commit();
res.status(200).json({ message: "Expense deleted successfully." });
} catch (error) {
await t.rollback();
console.error("Delete expanse error:", error);
res.status(500).json({ error: "Failed to delete expense." });
}
},
};
export default expanseController;
