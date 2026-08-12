# GSRTC Bus Booking App — Sequelize Associations

This version updates the original GSRTC Bus Booking API to use Sequelize associations and foreign keys.

## 1. Associations implemented

### User → Booking

A user can make many bookings:

```js
User.hasMany(Booking, {
  foreignKey: "UserId"
});

Booking.belongsTo(User, {
  foreignKey: "UserId"
});
```

`Bookings.UserId` is a foreign key that references `Users.Id`.

### Bus → Booking

A bus can have many bookings:

```js
Bus.hasMany(Booking, {
  foreignKey: "BusId"
});

Booking.belongsTo(Bus, {
  foreignKey: "BusId"
});
```

`Bookings.BusId` is a foreign key that references `Buses.Id`.

## 2. What is a foreign key?

A foreign key is a column in one table that stores the primary-key value of a related row in another table.

In this project:

- `Users.Id` is the primary key of `Users`.
- `Buses.Id` is the primary key of `Buses`.
- `Bookings.UserId` references `Users.Id`.
- `Bookings.BusId` references `Buses.Id`.

This creates referential integrity and lets Sequelize retrieve related records using `include`.

## 3. Project structure

```text
gsrtc-associations/
├── app.js
├── server.js
├── package.json
├── .gitignore
├── README.md
├── db/
│   └── database.js
├── models/
│   ├── users.js
│   ├── buses.js
│   ├── bookings.js
│   ├── payments.js
│   └── index.js
├── controllers/
│   ├── users.js
│   ├── buses.js
│   └── bookings.js
└── routes/
    ├── users.js
    ├── buses.js
    └── bookings.js
```

## 4. Database setup

Create the MySQL database:

```sql
CREATE DATABASE gsrtc;
```

The default database configuration is:

```text
Database: gsrtc
Username: root
Password: 12345678
Host: localhost
Port: 3306
```

If your MySQL credentials are different, set these environment variables before running:

```text
DB_NAME
DB_USER
DB_PASSWORD
DB_HOST
DB_PORT
```

The application uses `sequelize.sync({ alter: true })` during development so the new foreign-key columns can be synchronized.

> If your old database contains incompatible data in `Bookings`, use a fresh `gsrtc` database or clear the old `Bookings` table before running this association version.

## 5. Install and run

```bash
npm install
npm run dev
```

or:

```bash
npm start
```

Server:

```text
http://localhost:3000
```

## 6. Postman testing

### Step 1 — Create a user

**POST**

```text
http://localhost:3000/users
```

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Step 2 — Create a bus

**POST**

```text
http://localhost:3000/buses
```

Body:

```json
{
  "busNumber": "MH12AB1234",
  "totalSeats": 40,
  "availableSeats": 30
}
```

### Step 3 — Create a booking

Assuming the created user has ID `1` and bus has ID `1`:

**POST**

```text
http://localhost:3000/bookings
```

Body:

```json
{
  "userId": 1,
  "busId": 1,
  "seatNumber": 10
}
```

The booking is stored with:

```text
UserId = 1
BusId = 1
SeatNumber = 10
```

### Step 4 — Get all bookings for a user with bus details

**GET**

```text
http://localhost:3000/users/1/bookings
```

Example response:

```json
[
  {
    "Id": 1,
    "SeatNumber": 10,
    "Bus": {
      "BusNumber": "MH12AB1234"
    }
  }
]
```

### Step 5 — Get all bookings for a bus with user details

**GET**

```text
http://localhost:3000/buses/1/bookings
```

Example response:

```json
[
  {
    "Id": 1,
    "SeatNumber": 10,
    "User": {
      "Name": "John Doe",
      "Email": "john@example.com"
    }
  }
]
```

## 7. Important Sequelize `include` concept

For the user-bookings endpoint:

```js
const bookings = await Booking.findAll({
  where: {
    UserId: userId
  },
  include: [
    {
      model: Bus,
      attributes: ["BusNumber"]
    }
  ]
});
```

For the bus-bookings endpoint:

```js
const bookings = await Booking.findAll({
  where: {
    BusId: busId
  },
  include: [
    {
      model: User,
      attributes: ["Name", "Email"]
    }
  ]
});
```

The `include` works because the relationships were defined in `models/index.js`.

## 8. GitHub submission

After testing:

```bash
git init
git add .
git commit -m "Implement Sequelize associations for bus bookings"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Get the commit ID:

```bash
git rev-parse HEAD
```

Save that commit ID for the assignment submission.

## 9. API summary

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/users` | Create user |
| GET | `/users` | Get users |
| GET | `/users/:id/bookings` | Get user's bookings with bus details |
| POST | `/buses` | Create bus |
| GET | `/buses/available/:seats` | Get buses with enough seats |
| GET | `/buses/:id/bookings` | Get bus bookings with user details |
| POST | `/bookings` | Create booking |

## 10. Main change from the previous version

Previously, `Booking` only contained `SeatNumber`.

Now it contains:

```text
Id
SeatNumber
UserId  → Users.Id
BusId   → Buses.Id
```

This is the core association requirement of the task.
