// backfill-total-expense.js
// Run this ONCE after deploying the new User.totalExpense column, to
// populate it from existing expense records. Safe to run multiple times
// (it always recalculates from source-of-truth `expanses`, never adds on
// top of itself).
//
// Usage:  node backfill-total-expense.js

import sequelize from "./config/db.js";
import { User, Expanse } from "./models/index.js";

async function backfill() {
  await sequelize.authenticate();

  const totals = await Expanse.findAll({
    attributes: [
      "userId",
      [sequelize.fn("SUM", sequelize.col("amount")), "total"],
    ],
    group: ["userId"],
    raw: true,
  });

  const totalsByUserId = new Map(totals.map((row) => [row.userId, Number(row.total)]));

  const users = await User.findAll({ attributes: ["id"] });

  for (const user of users) {
    const total = totalsByUserId.get(user.id) || 0;
    await User.update({ totalExpense: total }, { where: { id: user.id } });
    console.log(`User ${user.id}: totalExpense = ${total}`);
  }

  console.log("Backfill complete.");
  await sequelize.close();
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
