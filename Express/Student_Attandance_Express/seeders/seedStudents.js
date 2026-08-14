// Run with: npm run seed
require('dotenv').config();
const { sequelize, Student } = require('../models');

const names = [
  'Siva', 'Rajesh', 'Ashok', 'Sai', 'Haritha',
  'Ram', 'Krishna', 'Anu', 'Ammu', 'Adi', 'venkat',
];

(async () => {
  try {
    await sequelize.sync();
    for (const name of names) {
      await Student.findOrCreate({ where: { name } });
    }
    console.log(`Seeded ${names.length} students successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
