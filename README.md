# Expenso (MERN Stack)

Expenso is a full-stack expense tracker with JWT authentication and a visual analytics
dashboard (summary cards, category breakdown doughnut chart, and a monthly
income-vs-expense bar chart).

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, cors, dotenv
- **Frontend:** React (Hooks + Context API), react-router-dom v6, axios,
  Chart.js (react-chartjs-2), Tailwind CSS

## Project Structure

```
expenso/
├── server/
│   ├── config/db.js
│   ├── models/ (User.js, Expense.js)
│   ├── middleware/authMiddleware.js
│   ├── routes/ (authRoutes.js, expenseRoutes.js)
│   ├── controllers/ (authController.js, expenseController.js)
│   ├── .env.example
│   └── server.js
└── client/
    ├── public/index.html
    └── src/
        ├── context/AuthContext.js
        ├── components/ (Navbar, SummaryCard, ExpenseForm, ExpenseList, Charts/)
        ├── pages/ (Login, Register, Dashboard)
        ├── services/api.js
        ├── App.js
        └── index.js
```

## 1. Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (`mongod`) OR a free MongoDB Atlas cluster

## 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/expenso
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:3000
```

If you're using MongoDB Atlas instead of a local database, replace
`MONGO_URI` with your Atlas connection string, e.g.:
`mongodb+srv://<user>:<password>@cluster0.mongodb.net/expenso`

Start the API:

```bash
npm run dev      # with nodemon, auto-restarts on changes
# or
npm start        # plain node
```

The API will run at `http://localhost:5000`. Check `http://localhost:5000/api/health`
to confirm it's up.

## 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env` if your API isn't on the default URL:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React app:

```bash
npm start
```

The app opens at `http://localhost:3000`. Register a new account, then
you'll be redirected to `/dashboard`.

## 4. Using the App

1. **Register** with your full name, email, and password.
2. You're auto-logged-in and redirected to the dashboard.
3. Click **Add Transaction** to log income or expenses (title, amount,
   category, type, date, optional notes).
4. Summary cards (Balance / Income / Expense) and both charts update
   automatically after every add/edit/delete.
5. Use the filters above the transaction table to narrow by type,
   category, or date range; use Previous/Next to page through history.
6. Click **Edit** or **Delete** on any row to modify it.

## 5. API Reference (all `/api/expenses/*` routes require `Authorization: Bearer <token>`)

| Method | Route                              | Description                          |
|--------|-------------------------------------|---------------------------------------|
| POST   | /api/auth/register                  | Register a new user                   |
| POST   | /api/auth/login                     | Login, returns JWT                    |
| GET    | /api/auth/me                        | Get current logged-in user            |
| GET    | /api/expenses/report?month=YYYY-MM  | All transactions + totals + category breakdown for one month |
| DELETE | /api/auth/account                   | Delete account + all data (body: `{ password }`) |
| GET    | /api/expenses                       | List transactions (filters + paging)  |
| POST   | /api/expenses                       | Create a transaction                  |
| PUT    | /api/expenses/:id                   | Update a transaction                  |
| DELETE | /api/expenses/:id                   | Delete a transaction                  |
| GET    | /api/expenses/summary               | Total income/expense/balance          |
| GET    | /api/expenses/analytics/by-category | Expense totals grouped by category    |
| GET    | /api/expenses/analytics/monthly     | Income vs expense grouped by month    |

## UI Features

- **Dark / light theme** - toggle in the navbar; follows your system theme automatically
  until you pick one. Settings -> Appearance offers System / Light / Dark.
- **Transaction details** - click any row in the history to open a read-only view with
  every field (type, category, date, notes, created/updated, ID), with Edit / Delete.
- **Show/hide password** - eye button on the login, register and delete-account fields.
- **Monthly report** (`/monthly`) - pick any month/year (arrows, dropdowns, or click a bar on the
  dashboard's monthly chart) to see every transaction of that month grouped by day, with totals and a
  category chart. Click a transaction for its full details (read-only).
- **Download** the month as a **PDF** (summary, category breakdown, full transaction table) or a
  **CSV** (opens in Excel/Sheets). PDFs use "Rs." because the built-in PDF font has no rupee glyph.
- **Settings page** (`/settings`) - account info, theme, and **Delete account**
  (requires your password and typing `DELETE`; removes the user and all transactions).
- Fully responsive: modals become bottom sheets on phones, the history is a touch-friendly list.

## Notes

- Passwords are hashed with bcryptjs before being stored; the password
  field is excluded from queries by default (`select: false`).
- JWTs are stored in `localStorage` on the client and attached
  automatically to every API request via an axios interceptor. A 401
  response anywhere automatically logs the user out.
- Categories: Food, Rent, Salary, Entertainment, Utilities,
  Transportation, Healthcare, Shopping, Other.
