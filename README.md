# Wealth Wellness Hub

**Your complete financial health, in one place.**

Wealth Wellness Hub is a comprehensive React Native mobile application built with Expo that helps users track, analyze, and optimize their complete financial portfolio. The app provides a unified view of bank accounts, investments, loans, insurance policies, and CPF (Singapore) accounts, with AI-powered insights and recommendations.

## 🎯 Overview

Wealth Wellness Hub consolidates all financial data into a single dashboard, providing users with:
- **Wealth Wellness Score**: A comprehensive 0-100 score indicating overall financial health
- **Net Worth Tracking**: Real-time calculation and historical timeline visualization
- **Financial Health Metrics**: Diversification, liquidity, debt-to-asset ratios, and credit score analysis
- **AI-Powered Insights**: Personalized recommendations and financial analysis using Google Gemini AI
- **Portfolio Stress Testing**: Scenario analysis for market crashes, interest rate changes, and economic downturns

## ✨ Key Features

### 📊 Dashboard
- Wealth Wellness Score gauge with color-coded indicators
- Total Net Worth display with trend analysis
- Asset allocation summary (Banks, Investments, Insurance, CPF, Other)
- Financial health metric cards with drill-down analysis
- AI-generated recommendations
- Net worth timeline visualization (2022-2025)

### 🏦 Banks Module
- Bank account management (savings, daily, credit, fixed deposits)
- Credit score breakdown (CBS-style with grade calculation)
- Loan capacity calculator (TDSR-based)
- Monthly interest earned summary
- Linked loans per bank account

### 📈 Investments Module
- Portfolio overview with profit/loss tracking
- Asset class breakdown (Stocks, Crypto, ETFs, Bonds, Futures, Options, REITs, Commodities)
- Interactive pie chart visualization
- Holdings management (add/edit/delete)
- AI portfolio suggestions
- Portfolio stress testing with scenario analysis

### 💳 Loans Module
- Loan tracking and management
- Aggregated outstanding balances table (CBS format)
- 6-month historical trend charts
- Loan classification (Secured, Unsecured Interest-Bearing, Unsecured Non-Interest-Bearing, Exempted)
- Amortization schedules and progress tracking

### 🛡️ Insurance Module
- Insurance policy management
- Coverage breakdown by type
- Policy expiry tracking with status badges (Active, Expiring Soon, Expired)
- PDF document import and storage

### 🇸🇬 CPF Support (Singapore)
- CPF account tracking (Ordinary Account, Special Account, Medisave Account)
- Contribution tracking
- Withdrawal simulation calculator
- Integration with net worth calculations

### 🤖 AI Features
- **Financial Recommendations**: Personalized insights based on portfolio composition
- **AI Chat Assistant**: Interactive financial advisor powered by Google Gemini
- **Stress Test Analysis**: AI-powered scenario analysis and recommendations
- **Metric Insights**: Deep-dive analysis for financial health metrics

## 🛠️ Technology Stack

### Frontend
- **React Native** (0.81.5) with **Expo** (~54.0.29)
- **Expo Router** (~6.0.19) for file-based routing
- **TypeScript** for type safety
- **NativeWind** (^4.2.1) for Tailwind CSS styling
- **React Query** (@tanstack/react-query) for data fetching
- **React Native Reanimated** for animations

### Backend
- **tRPC** (11.7.2) for type-safe API communication
- **Express** (^4.22.1) server
- **Drizzle ORM** (^0.44.7) with MySQL2
- **Firebase** (^12.10.0) for authentication and Firestore
- **Google Gemini AI** for financial analysis and recommendations

### Data Storage
- **AsyncStorage** for local data persistence
- **Firebase Firestore** for cloud sync and user data
- **S3 Storage** for file uploads (insurance PDFs, etc.)

### Development Tools
- **Vitest** for testing
- **ESLint** for code quality
- **Prettier** for code formatting
- **Drizzle Kit** for database migrations

## 📁 Project Structure

```
wealth-wellness-hub/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── banks.tsx      # Banks module
│   │   ├── investments.tsx # Investments module
│   │   ├── loans.tsx      # Loans module
│   │   ├── insurance.tsx  # Insurance module
│   │   ├── cpf.tsx        # CPF module
│   │   └── profile.tsx    # User profile
│   ├── auth/              # Authentication screens
│   ├── ai-chat.tsx        # AI chat assistant
│   ├── debt-analysis.tsx  # Debt analysis drill-down
│   ├── liquidity-analysis.tsx
│   ├── diversification-analysis.tsx
│   ├── stress-test.tsx    # Portfolio stress testing
│   └── net-worth-timeline.tsx
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── metric-card.tsx
│   ├── metric-drill-down.tsx
│   └── chart-container.tsx
├── lib/                   # Core libraries and utilities
│   ├── store.ts          # Data store and calculations
│   ├── firebase-*.ts     # Firebase integration
│   ├── gemini-ai-service.ts
│   ├── metric-insight-engine.ts
│   └── trpc.ts           # tRPC client
├── server/                # Backend server
│   ├── _core/            # Framework-level code
│   ├── routers.ts        # tRPC API routes
│   ├── db.ts             # Database queries
│   └── storage.ts        # S3 storage helpers
├── drizzle/              # Database schema and migrations
│   ├── schema.ts
│   └── migrations/
├── shared/               # Shared types and constants
├── hooks/                # Custom React hooks
├── constants/             # App constants
└── assets/               # Images and static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm 9.12.0+
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator
- Firebase project (for authentication and cloud sync)
- MySQL/TiDB database (for backend features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wealth-wellness-hub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Backend API
   EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
   
   # Database
   DATABASE_URL=mysql://user:password@localhost:3306/wealth_wellness
   
   # OAuth (if using Manus OAuth)
   VITE_APP_ID=your_app_id
   OAUTH_SERVER_URL=your_oauth_url
   ```

4. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Configure security rules (see `FIREBASE_ARCHITECTURE.md`)
   - Add your Firebase config to `.env`

5. **Set up database**
   ```bash
   pnpm db:push
   ```

### Running the App

**Development mode (with hot reload):**
```bash
pnpm dev
```

This runs both the Metro bundler and the backend server concurrently.

**iOS:**
```bash
pnpm ios
```

**Android:**
```bash
pnpm android
```

**Web:**
```bash
pnpm dev:metro
```

### Building for Production

**Build the server:**
```bash
pnpm build
```

**Start production server:**
```bash
pnpm start
```

## 📱 Key Modules

### Dashboard
The main screen provides an overview of financial health:
- **Wealth Wellness Score**: Calculated from diversification, liquidity, debt ratios, and credit score
- **Net Worth**: Sum of all assets minus liabilities
- **Asset Allocation**: Visual breakdown of wealth distribution
- **Financial Health Cards**: Quick access to detailed analysis
- **AI Recommendations**: Personalized financial advice

### Financial Calculations

The app includes comprehensive financial calculations:

- **Net Worth**: `Assets (Banks + Investments + Insurance + CPF) - Liabilities (Loans)`
- **Wealth Wellness Score**: Weighted combination of:
  - Diversification Index (30%)
  - Liquidity Ratio (25%)
  - Debt-to-Asset Ratio (25%)
  - Credit Score (20%)
- **CBS Credit Score**: Calculated from payment history, amounts owed, credit length, credit mix, and new credit
- **Loan Capacity**: TDSR-based calculation for maximum loan eligibility

### AI Integration

The app uses Google Gemini AI for:
- **Financial Recommendations**: Analyzes portfolio and suggests improvements
- **Chat Assistant**: Answers questions about financial health
- **Stress Test Analysis**: Provides insights on portfolio resilience
- **Metric Insights**: Explains financial health metrics in plain language

## 🔐 Authentication

The app supports two authentication methods:

1. **Firebase Authentication** (Primary)
   - Email/Password signup and login
   - Password reset functionality
   - Apple Sign-In (iOS)
   - User data stored in Firestore

2. **Manus OAuth** (Alternative)
   - OAuth-based authentication
   - Token-based (native) or cookie-based (web) sessions

See `FIREBASE_ARCHITECTURE.md` and `FIREBASE_SETUP.md` for detailed setup instructions.

## 📊 Data Management

### Local Storage
- Uses AsyncStorage for offline-first data persistence
- All financial data stored locally by default
- Automatic sync to Firestore when authenticated

### Cloud Sync
- Firebase Firestore for user data synchronization
- Secure per-user data isolation
- Real-time updates across devices

### Data Types
- **BankAccount**: Bank name, account type, balance, interest rate
- **Loan**: Bank, type, balance, interest, instalment, security type
- **Holding**: Ticker, quantity, average cost, asset class
- **InsurancePolicy**: Insurer, type, coverage, premium, expiry
- **CPFAccount**: Account type (OA/SA/MA), balance, contributions

## 🧪 Testing

Run tests with:
```bash
pnpm test
```

The project includes unit tests for:
- Financial calculations (net worth, wellness score, credit score)
- Data validation
- API endpoints

## 📚 Documentation

- **`design.md`**: UI/UX design specifications and brand guidelines
- **`FIREBASE_ARCHITECTURE.md`**: Firebase integration architecture
- **`FIREBASE_SETUP.md`**: Firebase setup instructions
- **`server/README.md`**: Backend development guide
- **`todo.md`**: Project roadmap and completed features

## 🎨 Design System

### Color Palette
- **Primary**: `#1A3C5E` (Deep Navy) - Trust, stability
- **Accent**: `#00C896` (Emerald Green) - Growth, health
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)
- **Background (Light)**: `#F0F4F8` (Soft Blue-Grey)
- **Background (Dark)**: `#0D1B2A` (Dark Navy)

### Design Principles
- One-handed usage optimization
- Card-based layout for clarity
- Color-coded status indicators
- Progressive disclosure of information
- iOS HIG compliance

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting and type checking: `pnpm check && pnpm lint`
5. Submit a pull request

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

Built with:
- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [tRPC](https://trpc.io/)

---

**Wealth Wellness Hub** - Your complete financial health, in one place. 💰✨
