import Expense from "../models/expense.js";

const createExpense = async (req, res) => {
  try {
    const { description, amount, category, expenseDate } = req.body;

    if (!description || amount === undefined || !category || !expenseDate) {
      return res.status(400).json({
        message: "description, amount, category and expenseDate are required"
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "amount must be a number greater than 0"
      });
    }

    const expense = await Expense.create({
      Description: description.trim(),
      Amount: numericAmount,
      Category: category,
      ExpenseDate: expenseDate
    });

    return res.status(201).json({
      message: "Expense created successfully",
      expense
    });
  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      message: "Failed to create expense",
      error: error.message
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [["ExpenseDate", "DESC"], ["Id", "DESC"]]
    });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);

    return res.status(500).json({
      message: "Failed to retrieve expenses",
      error: error.message
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid expense id"
      });
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    return res.status(200).json(expense);
  } catch (error) {
    console.error("Get expense error:", error);

    return res.status(500).json({
      message: "Failed to retrieve expense",
      error: error.message
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid expense id"
      });
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    const { description, amount, category, expenseDate } = req.body;

    if (!description || amount === undefined || !category || !expenseDate) {
      return res.status(400).json({
        message: "description, amount, category and expenseDate are required"
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "amount must be a number greater than 0"
      });
    }

    await expense.update({
      Description: description.trim(),
      Amount: numericAmount,
      Category: category,
      ExpenseDate: expenseDate
    });

    return res.status(200).json({
      message: "Expense updated successfully",
      expense
    });
  } catch (error) {
    console.error("Update expense error:", error);

    return res.status(500).json({
      message: "Failed to update expense",
      error: error.message
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid expense id"
      });
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    await expense.destroy();

    return res.status(200).json({
      message: "Expense deleted successfully"
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    return res.status(500).json({
      message: "Failed to delete expense",
      error: error.message
    });
  }
};

export {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};
