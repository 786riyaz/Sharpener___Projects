// controllers/expanse.js
import Expanse from "../models/Expanse.js";

const expanseController = {
  // POST /expanse - add a new expense for the logged-in user
  addExpanse: async (req, res) => {
    try {
      const { category, description, amount } = req.body;

      if (!category || !description || amount === undefined || amount === "") {
        return res.status(400).json({ error: "Category, description and amount are required." });
      }
      if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number." });
      }

      const expanse = await Expanse.create({
        category,
        description,
        amount: Number(amount),
        userId: req.session.userId,
      });

      res.status(201).json(expanse);
    } catch (error) {
      console.error("Add expanse error:", error);
      res.status(500).json({ error: "Failed to add expense." });
    }
  },

  // GET /expanse - fetch every expense that belongs to the logged-in user
  getExpanse: async (req, res) => {
    try {
      const expanses = await Expanse.findAll({
        where: { userId: req.session.userId },
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
    try {
      const { id } = req.params;
      const deletedCount = await Expanse.destroy({
        where: { id, userId: req.session.userId },
      });
      if (deletedCount === 0) {
        return res.status(404).json({ error: "Expense not found." });
      }
      res.status(200).json({ message: "Expense deleted successfully." });
    } catch (error) {
      console.error("Delete expanse error:", error);
      res.status(500).json({ error: "Failed to delete expense." });
    }
  },
};

export default expanseController;
