In SQL, **`CHECK`** and **`DEFAULT`** are constraints used to control the data that can be stored in a table.

### 1. `CHECK` Constraint

`CHECK` ensures that a column value satisfies a specific **condition**.

Example:

```sql
CREATE TABLE Employees (
    emp_id INT,
    emp_name VARCHAR(50),
    age INT CHECK (age >= 18),
    salary INT CHECK (salary >= 0)
);
```

Here:

```sql
age INT CHECK (age >= 18)
```

means an employee's age **cannot be less than 18**.

```sql
INSERT INTO Employees VALUES (1, 'Alice', 25, 50000); -- ✅
INSERT INTO Employees VALUES (2, 'Bob', 16, 40000);   -- ❌
```

The second `INSERT` fails because `16 >= 18` is false.

You can also use `CHECK` with multiple columns:

```sql
CHECK (salary >= 30000 AND salary <= 200000)
```

---

### 2. `DEFAULT` Constraint

`DEFAULT` automatically provides a value when you **don't specify a value** during insertion.

Example:

```sql
CREATE TABLE Employees (
    emp_id INT,
    emp_name VARCHAR(50),
    department VARCHAR(50) DEFAULT 'IT',
    salary INT DEFAULT 50000
);
```

Now:

```sql
INSERT INTO Employees (emp_id, emp_name)
VALUES (1, 'Alice');
```

The database automatically uses the default values:

```text
emp_id | emp_name | department | salary
1      | Alice    | IT         | 50000
```

### `CHECK` vs `DEFAULT`

| Constraint | Purpose                               | Example             |
| ---------- | ------------------------------------- | ------------------- |
| `CHECK`    | **Restricts** what values are allowed | `CHECK (age >= 18)` |
| `DEFAULT`  | **Provides** a value if none is given | `DEFAULT 50000`     |

A simple way to remember:

> **CHECK = "Is this value allowed?"**
> **DEFAULT = "What value should I use if you don't provide one?"**

They can also be used together:

```sql
CREATE TABLE Employees (
    emp_id INT,
    age INT CHECK (age >= 18),
    salary INT DEFAULT 50000 CHECK (salary >= 0)
);
```

Here, `salary` gets **50000 automatically** if omitted, but whatever salary is ultimately stored must satisfy **`salary >= 0`**.
