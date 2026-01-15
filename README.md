# Grocery Price Tracker

A family grocery price tracking app with a React frontend and .NET backend.

## Prerequisites

- **Node.js 18+** (current version is v15.2.1 - you'll need to upgrade)
- **.NET 8 SDK** (installed)
- **SQL Server** (local instance)

## Quick Start

### 1. Database Setup

The app uses SQL Server. Update the connection string in `backend/GroceryTracker.Api/appsettings.json` if needed:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=GroceryTracker;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

The database will be created automatically when you first run the backend.

### 2. Start the Backend

```bash
cd backend/GroceryTracker.Api
dotnet run
```

The API will be available at `http://localhost:5000`. Swagger UI is at `http://localhost:5000/swagger`.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. Access the App

- Open `http://localhost:3000` in your browser
- Enter password: `2975`

## Local Network Access (for family devices)

To access from other devices on your network:

1. Find your computer's local IP:
   ```bash
   ipconfig
   ```
   Look for your IPv4 Address (e.g., `192.168.1.100`)

2. The backend is configured to listen on all interfaces (`0.0.0.0:5000`)

3. For the frontend in dev mode, it also listens on `0.0.0.0:3000`

4. You may need to allow these ports through Windows Firewall:
   - Open Windows Defender Firewall
   - Click "Allow an app or feature through Windows Defender Firewall"
   - Add rules for ports 5000 (backend) and 3000 (frontend)

5. Access from other devices: `http://192.168.1.100:3000`

## Project Structure

```
grocery-tracker/
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts (Auth, Data)
│   │   ├── services/          # API service layer
│   │   └── types/             # TypeScript types
│   └── ...
├── backend/                   # .NET 8 Web API
│   └── GroceryTracker.Api/
│       ├── Controllers/       # API endpoints
│       ├── Models/            # Entity models and DTOs
│       ├── Data/              # DbContext
│       └── Migrations/        # EF Core migrations
└── README.md
```

## Features

- **Password protection** - Simple family password (2975)
- **Track items** - Add grocery and household items
- **Price history** - Record prices from different stores over time
- **Compare prices** - See which store has the best price
- **Search & filter** - Find items by name, filter by store
- **Sort** - Sort by name, price, or date
- **Mobile-first** - Designed for use on phones while shopping

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/verify | Verify password |
| GET | /api/items | List all items with latest prices |
| GET | /api/items/{id} | Get item with full price history |
| POST | /api/items | Create new item |
| PUT | /api/items/{id} | Update item name |
| DELETE | /api/items/{id} | Delete item |
| POST | /api/prices | Add price entry |
| PUT | /api/prices/{id} | Update price entry |
| DELETE | /api/prices/{id} | Delete price entry |
| GET | /api/stores | List all stores |
| POST | /api/stores | Create new store |

## Upgrading Node.js

Your current Node.js version (v15.2.1) is too old for production builds. To upgrade:

1. Download Node.js 18+ from https://nodejs.org/
2. Install and restart your terminal
3. Verify: `node --version` should show v18 or higher
4. Run `npm install` again in the frontend folder

## Troubleshooting

**"Cannot connect to database"**
- Ensure SQL Server is running
- Check the connection string in appsettings.json
- Make sure the SQL Server service is set to accept local connections

**"CORS error in browser"**
- The backend is configured to allow all origins
- Make sure you're accessing the frontend, not the backend directly

**"Permission denied on network"**
- Add firewall rules for ports 5000 and 3000
- Ensure both backend and frontend are running
