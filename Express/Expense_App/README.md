# Full Stack Expense Tracker

A complete Expense Tracker built with:

- Node.js
- Express
- Sequelize
- MySQL
- HTML/CSS
- Axios
- MVC-style controllers/routes

The application replaces the old crudcrud backend with your own Express + MySQL backend.

## Requirements implemented

### 1. Expense table

The Sequelize `Expense` model creates an `Expenses` table containing:

- `Id`
- `Description`
- `Amount`
- `Category`
- `ExpenseDate`
- `createdAt`
- `updatedAt`

### 2. Create expense

```http
POST /expenses
```

Example:

```json
{
  "description": "Dinner",
  "amount": 500,
  "category": "Food",
  "expenseDate": "2026-08-12"
}
```

### 3. Persist expenses

The frontend calls:

```http
GET /expenses
```

when the page loads. Therefore refreshing the browser loads the records from MySQL instead of losing them.

### 4. Delete expense

```http
DELETE /expenses/:id
```

### 5. Expense route + controller

Routes are in:

```text
routes/expenses.js
```

Business/API logic is in:

```text
controllers/expenses.js
```

### 6. Bonus — Edit expense

```http
PUT /expenses/:id
```

The UI has an Edit button. Clicking it loads the expense into the form and changes the form into update mode.

## Database

Create the database in MySQL:

```sql
CREATE DATABASE expense;
```

Default credentials in this project:

```text
Database: expense
Username: root
Password: 12345678
Host: localhost
Port: 3306
```

If your MySQL password is different, edit `db/database.js` or set:

```text
DB_NAME
DB_USER
DB_PASSWORD
DB_HOST
DB_PORT
```

## Run

From the project folder:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The HTML UI is served from:

```text
public/index.html
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/expenses` | Create expense |
| GET | `/expenses` | Get all expenses |
| GET | `/expenses/:id` | Get one expense |
| PUT | `/expenses/:id` | Edit expense |
| DELETE | `/expenses/:id` | Delete expense |
| GET | `/api/health` | Check API |

## Axios

The frontend uses Axios for all API operations:

```js
axios.get("/expenses");
axios.post("/expenses", payload);
axios.put(`/expenses/${id}`, payload);
axios.delete(`/expenses/${id}`);
```

## Pure functions / static functions

The task's wording says "pure or static functions".

These are different concepts.

### Pure function

A pure function:

1. Gives the same output for the same input.
2. Does not modify external state.

Example:

```js
const add = (a, b) => a + b;
```

`add(2, 3)` always returns `5`, and the function does not modify anything outside itself.

Another example in this project is:

```js
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(Number(amount));
};
```

It takes an amount and returns a formatted value without modifying the database or DOM.

### Static function

"Static" normally refers to a static method on a class.

Example:

```js
class ExpenseHelper {
  static calculateTotal(expenses) {
    return expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
  }
}
```

It is called on the class:

```js
ExpenseHelper.calculateTotal(expenses);
```

rather than on an instance:

```js
const helper = new ExpenseHelper();
```

The Expense Tracker does not need static class methods to satisfy the CRUD requirements.

## GitHub submission

After testing the application:

```bash
git init
git add .
git commit -m "Build full stack expense tracker"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Then get the commit ID:

```bash
git rev-parse HEAD
```

Use that commit ID for the assignment submission.

## Important

Do not commit database passwords or `.env` files to GitHub in a real project. The included `.gitignore` excludes `.env`.
