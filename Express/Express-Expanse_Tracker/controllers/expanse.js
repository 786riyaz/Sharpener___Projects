import logger from "../utils/logger.js";
import sequelize from "../config/db.js";
import Expanse from "../models/Expanse.js";
import User from "../models/User.js";
import { suggestCategory, getSpendingInsight } from "../services/geminiService.js";
const expanseController = {
  // POST /expanse - add a new expense for the logged-in user
  addExpanse: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      let { category, description, amount, note } = req.body;
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
          // Optional - trim it down to null so blank input doesn't get stored
          // as an empty string.
          note: note && note.trim() ? note.trim() : null,
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
      logger.error("Add expanse error:", { error: error?.message || error, stack: error?.stack });
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
      logger.error("Suggest category error:", { error: error?.message || error, stack: error?.stack });
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
      logger.error("Get insights error:", { error: error?.message || error, stack: error?.stack });
      res.status(500).json({ error: "Failed to generate insight." });
    }
  },
  // GET /expanse - fetch expenses belonging to the logged-in user.
  // Pagination (opt-in via ?page=&limit=): pass ?page=1&limit=10 to get a
  // page of results back as { expenses, currentPage, totalPages, totalCount,
  // limit }. Called with no query params at all, this keeps returning the
  // full plain array like before, so any existing caller that never sends
  // page/limit (e.g. the Reports page's aggregate views, which need every
  // expense to compute totals) keeps working unchanged.
  getExpanse: async (req, res) => {
    try {
      const { page, limit } = req.query;
      const isPaginated = page !== undefined || limit !== undefined;
      if (!isPaginated) {
        const expanses = await Expanse.findAll({
          where: { userId: req.userId },
          attributes: ["id", "category", "description", "amount", "note", "createdAt"],
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json(expanses);
      }
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
      const { count, rows } = await Expanse.findAndCountAll({
        where: { userId: req.userId },
        attributes: ["id", "category", "description", "amount", "note", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
      });
      const totalPages = Math.max(1, Math.ceil(count / pageSize));
      // Summary total (e.g. a "Total spent" card) needs the sum across ALL
      // of the user's expenses, not just the 10 on this page - read it from
      // the denormalized User.totalExpense instead of summing rows client-side.
      const user = await User.findByPk(req.userId, { attributes: ["totalExpense"] });
      res.status(200).json({
        expenses: rows,
        currentPage: pageNum,
        totalPages,
        totalCount: count,
        limit: pageSize,
        totalAmount: user?.totalExpense || 0,
      });
    } catch (error) {
      logger.error("Get expanse error:", { error: error?.message || error, stack: error?.stack });
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
      logger.error("Delete expanse error:", { error: error?.message || error, stack: error?.stack });
      res.status(500).json({ error: "Failed to delete expense." });
    }
  },
};
export default expanseController;
