# Wealth Wellness Hub (VaultTrack)

**Your complete financial health, in one place.**

A comprehensive mobile financial planning app built with React Native and Expo, featuring AI-powered insights, multi-asset portfolio tracking, and Singapore-specific financial tools.

---

## 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Wealth Wellness Score gauge, net worth overview, asset allocation visualization, financial health metrics, and AI-generated recommendations |
| **Banks** | Savings, daily, and credit account tracking with CBS-style credit score breakdown and TDSR-based loan capacity calculator |
| **Investments** | Portfolio P&L tracking across 8 asset classes (stocks, crypto, ETFs, bonds, futures, options, REITs, commodities) with AI insights |
| **Loans** | Loan management with CBS-format aggregated balances, 6-month liability trends, and amortization schedules |
| **Insurance** | Policy tracking with expiry status badges, coverage breakdown, and PDF document import |
| **CPF (Singapore)** | CPF OA/SA/MA account tracking, contribution history, **CPF LIFE payout estimator**, retirement milestones (BRS/FRS/ERS), and withdrawal simulations |
| **AI Chat** | Interactive AI financial advisor performing structured 5-point financial analysis: Snapshot → Observations → Risks → Opportunities → Questions |
| **Stress Testing** | Scenario simulations for market crashes, interest rate changes, and economic downturns |
| **Profile & Subscriptions** | User profile management, subscription tier comparison, and billing cycle options |

---

## 🛠️ Technology Stack

### Frontend
- **React Native** 0.81.5 with **Expo SDK 54**
- **Expo Router** 6.0 for file-based routing
- **TypeScript** 5.9 for type safety
- **NativeWind** 4.2 for Tailwind CSS in React Native
- **React Query** 5.90 for data fetching and caching
- **React Native Reanimated** 4.x for smooth animations

### Backend
- **tRPC** 11.7.2 for type-safe API communication
- **Express** 4.22 server framework
- **Drizzle ORM** 0.44 with MySQL2
- **Firebase** for authentication and Firestore
- **Google Gemini AI** for financial analysis

### Data Storage
- **AsyncStorage** for local offline-first persistence
- **Firebase Firestore** for cloud sync and real-time updates
- **S3 Storage** for file uploads (insurance PDFs, documents)

### Development & Testing
- **Vitest** for unit and integration tests
- **ESLint** for code quality
- **Prettier** for code formatting
- **Drizzle Kit** for database migrations

---

## 📁 Project Structure

```
wealth-wellness-hub/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (tabs)/                  # Tab navigation screens
│   │   ├── index.tsx            # Dashboard
│   │   ├── banks.tsx            # Banks module
│   │   ├── investments.tsx      # Investments module
│   │   ├── loans.tsx            # Loans module
│   │   ├── insurance.tsx        # Insurance module
│   │   ├── cpf.tsx              # CPF module (Singapore-specific)
│   │   ├── assets.tsx           # Assets overview
│   │   └── profile.tsx          # User profile
│   ├── auth/                     # Authentication screens
│   ├── ai-chat.tsx              # AI chat assistant
│   ├── stress-test.tsx          # Portfolio stress testing
│   ├── net-worth-timeline.tsx   # Net worth history
│   └── _layout.tsx              # Root layout with providers
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   ├── cpf/                      # CPF-specific components
│   │   ├── cpf-overview-card.tsx
│   │   ├── cpf-retirement-sums.tsx
│   │   └── cpf-payout-estimator.tsx
│   ├── metric-card.tsx
│   └── screen-container.tsx      # SafeArea wrapper
├── lib/                          # Core libraries and utilities
│   ├── app-data-context.tsx     # Global app state
│   ├── store.ts                 # Data calculations and storage
│   ├── cpf-calculations.ts      # CPF-specific calculations
│   ├── cpf-constants.ts         # CPF retirement sums (2026 values)
│   ├── gemini-ai-service.ts     # AI integration
│   ├── metric-insight-engine.ts # Financial insights
│   ├── firebase-*.ts            # Firebase integration
│   └── trpc.ts                  # tRPC client
├── server/                       # Backend server
│   ├── _core/                    # Framework-level code
│   ├── routers.ts               # tRPC API routes
│   ├── db.ts                    # Database queries
│   └── storage.ts               # S3 storage helpers
├── hooks/                        # Custom React hooks
│   ├── use-colors.ts            # Theme colors
│   ├── use-auth.ts              # Authentication
│   └── use-color-scheme.ts      # Dark/light mode
├── constants/                    # App constants
├── __tests__/                    # Unit and integration tests
│   ├── cpf-calculations.test.ts
│   └── ...
├── assets/                       # Images and static assets
├── theme.config.js              # Tailwind theme configuration
├── tailwind.config.js           # Tailwind CSS config
├── app.config.ts                # Expo app configuration
└── package.json                 # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm 9.12.0+
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
- Firebase project (for authentication and cloud sync)
- Google Gemini API key (for AI features)

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
   
   # AI Integration
   GEMINI_API_KEY=your_gemini_api_key
   
   # Backend API
   EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
   
   # Database (optional, for backend features)
   DATABASE_URL=mysql://user:password@localhost:3306/wealth_wellness
   ```

4. **Set up Firebase (optional, for cloud sync)**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Add your Firebase config to `.env`

### Running the App

**Development mode (with hot reload):**
```bash
pnpm dev
```

This runs both the Metro bundler and backend server concurrently.

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

**Run tests:**
```bash
pnpm test
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

---

## 📊 Key Modules

### Dashboard
The main screen provides a comprehensive financial overview:
- **Wealth Wellness Score**: Calculated from diversification, liquidity, debt ratios, and credit score
- **Net Worth**: Sum of all assets minus liabilities
- **Asset Allocation**: Visual breakdown of wealth distribution
- **Financial Health Cards**: Quick access to detailed analysis
- **AI Recommendations**: Personalized financial advice

### CPF Module (Singapore-Specific)
Comprehensive CPF planning tools for Singapore residents:
- **Account Tracking**: OA (Ordinary Account), SA (Special Account), MA (MediSave Account)
- **Retirement Benchmarks** (2026 values):
  - BRS (Basic Retirement Sum): SGD $102,900
  - FRS (Full Retirement Sum): SGD $205,800
  - ERS (Enhanced Retirement Sum): SGD $308,700
- **CPF LIFE Payout Estimator**: Monthly income projections based on RA balance
- **Retirement Readiness**: Dynamic status (Below BRS → BRS to FRS → FRS to ERS → Above ERS)
- **Age Sync**: Automatically syncs user age from profile for accurate projections

### Financial Calculations

The app includes comprehensive financial calculations:

- **Net Worth**: `Assets (Banks + Investments + Insurance + CPF) - Liabilities (Loans)`
- **Wealth Wellness Score**: Weighted combination of:
  - Diversification Index (30%)
  - Liquidity Ratio (25%)
  - Debt-to-Asset Ratio (25%)
  - Credit Score (20%)
- **CPF Projections**: Account growth with 2.5% (OA) and 4% (SA/MA/RA) annual interest
- **CBS Credit Score**: Calculated from payment history, amounts owed, credit length, credit mix, and new credit
- **Loan Capacity**: TDSR-based calculation for maximum loan eligibility

### AI Integration

The app uses Google Gemini AI for:
- **Financial Recommendations**: Analyzes portfolio and suggests improvements
- **Chat Assistant**: Answers questions about financial health with data-driven insights
- **Stress Test Analysis**: Provides insights on portfolio resilience
- **Metric Insights**: Explains financial health metrics in plain language

---

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

---

## 📱 Data Management

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
- **CPFUserData**: OA, SA, MA, RA balances, age, annual salary

---

## 🧪 Testing

Run tests with:
```bash
pnpm test
```

The project includes comprehensive tests for:
- CPF calculations (33+ tests)
- Financial metrics and formulas
- Data validation
- API endpoints
- Context integration

---

## 📚 Documentation

- **`design.md`**: UI/UX design specifications and brand guidelines
- **`todo.md`**: Project roadmap and feature checklist
- **`server/README.md`**: Backend development guide
- **`FIREBASE_ARCHITECTURE.md`**: Firebase integration architecture (if available)

---

## 🎨 Design System

### Color Palette
- **Primary**: `#0a7ea4` (Ocean Blue) - Trust, stability
- **Accent**: `#00C896` (Emerald Green) - Growth, health
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)
- **Background (Light)**: `#ffffff` (White)
- **Background (Dark)**: `#151718` (Dark Grey)
- **Surface**: `#f5f5f5` (Light Grey)

### Design Principles
- One-handed usage optimization
- Card-based layout for clarity
- Glass morphism effects for modern UI
- Color-coded status indicators
- Progressive disclosure of information
- iOS Human Interface Guidelines (HIG) compliance

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests: `pnpm test`
4. Run linting and type checking: `pnpm check && pnpm lint`
5. Format code: `pnpm format`
6. Submit a pull request

---

## 🙏 Acknowledgments

Built with:
- [Expo](https://expo.dev/) - React Native framework
- [React Native](https://reactnative.dev/) - Mobile UI framework
- [Firebase](https://firebase.google.com/) - Authentication and database
- [Google Gemini AI](https://ai.google.dev/) - AI-powered insights
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [tRPC](https://trpc.io/) - Type-safe API framework
- [NativeWind](https://www.nativewind.dev/) - Tailwind CSS for React Native

---

**Wealth Wellness Hub** - Understand, optimize, and grow your wealth all in one place. 💰✨

*Last updated: March 2026*
