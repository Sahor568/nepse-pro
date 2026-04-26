# Nepal NEPSE Chart - Stock Market Analysis Platform

A full-stack web application for tracking and analyzing Nepal Stock Exchange (NEPSE) data with real-time charts, portfolio management, and market insights.

## 🚀 Features

### Frontend
- **Real-time Charts**: Interactive candlestick charts using Lightweight Charts
- **Market Watch**: Live NEPSE index and stock prices
- **Portfolio Management**: Track investments with buy/sell records
- **Watchlist**: Personalized stock monitoring
- **User Authentication**: Secure login/signup with JWT
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

### Backend
- **RESTful API**: Express.js server with TypeScript
- **NEPSE Data Integration**: Fetch real-time stock data from NEPSE API
- **User Management**: Registration, authentication, and profile management
- **Database**: SQLite with Prisma ORM
- **Portfolio & Watchlist**: CRUD operations for user data

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with Tailwind Merge for styling
- **Lightweight Charts** for financial charting
- **React Router DOM** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **SQLite** database with **Prisma** ORM
- **JWT** for authentication
- **Bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **NEPSE API** wrapper for stock data

## 📁 Project Structure

```
nepal nepse chart/
├── backend/                 # Express.js API server
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   ├── db.ts           # Database initialization
│   │   └── index.ts        # Server entry point
│   ├── .env                # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React application
│   ├── src/
│   │   ├── assets/         # Images and icons
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Chart/      # Chart components
│   │   │   ├── Market/     # Market components
│   │   │   ├── Portfolio/  # Portfolio components
│   │   │   ├── Profile/    # Profile components
│   │   │   ├── Watchlist/  # Watchlist components
│   │   │   └── Layout.tsx  # Layout component
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── ChartPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MarketWatch.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Watchlist.tsx
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Application entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md               # This file
```

## ⚡ Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "nepal nepse chart"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Option 1: Run Backend and Frontend Separately

1. **Start Backend Server** (in one terminal)
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on: `http://localhost:5000`

2. **Start Frontend Development Server** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on: `http://localhost:5173`

#### Option 2: Run Both with a Single Command (Using Concurrently)
You can add a script in the root package.json (if exists) or use:
```bash
# In backend directory
npm run dev &
# In frontend directory  
npm run dev
```

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_key_here"
```

### Frontend API Configuration
The frontend is configured to connect to the backend API. Update `frontend/src/apiConfig.ts` if needed:
```typescript
export const API_BASE_URL = 'http://localhost:5000/api';
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### NEPSE Data
- `GET /api/nepse/market` - Get market overview
- `GET /api/nepse/stocks` - Get all stocks
- `GET /api/nepse/stock/:symbol` - Get specific stock data
- `GET /api/nepse/historical/:symbol` - Get historical data

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/watchlist` - Get user watchlist
- `POST /api/user/watchlist` - Add to watchlist
- `DELETE /api/user/watchlist/:symbol` - Remove from watchlist
- `GET /api/user/portfolio` - Get user portfolio
- `POST /api/user/portfolio` - Add to portfolio
- `PUT /api/user/portfolio/:id` - Update portfolio item
- `DELETE /api/user/portfolio/:id` - Remove from portfolio

### Health Check
- `GET /api/health` - Server health status

## 🗄️ Database

The application uses SQLite database with the following schema:

### Users Table
- `id` (Primary Key)
- `name` (Text)
- `email` (Text, Unique)
- `password` (Text)

### Watchlist Table  
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `symbol` (Text)

### Portfolio Table
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `symbol` (Text)
- `name` (Text)
- `quantity` (Real)
- `buy_price` (Real)
- `buy_date` (Text)
- `reference` (Text)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment
1. Build the TypeScript code:
   ```bash
   cd backend
   npm run build
   ```
2. Start production server:
   ```bash
   npm start
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   cd frontend
   npm run build
   ```
2. The built files will be in `dist/` directory ready to be served.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [NEPSE API](https://github.com/rumess/nepse-api) for providing NEPSE data
- [Lightweight Charts](https://github.com/tradingview/lightweight-charts) for charting library
- [Prisma](https://prisma.io) for database ORM
- [Tailwind CSS](https://tailwindcss.com) for styling framework

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Happy Trading! 📈**
