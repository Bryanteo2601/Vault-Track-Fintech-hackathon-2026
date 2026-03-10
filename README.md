# Wealth Wellness Hub

**Your complete financial health, in one place.**

A comprehensive mobile financial planning app built with React Native and Expo, featuring AI-powered insights, multi-asset portfolio tracking, private asset management, and Singapore-specific financial tools.

---

## 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Wealth Wellness Score gauge, net worth overview, asset allocation visualization, financial health metrics, and AI-generated recommendations |
| **Banks** | Savings, daily, and credit account tracking with CBS-style credit score breakdown and TDSR-based loan capacity calculator |
| **Investments** | Portfolio P&L tracking across 8 asset classes (stocks, crypto, ETFs, bonds, futures, options, REITs, commodities) with AI insights |
| **Loans** | Loan management with CBS-format aggregated balances, 6-month liability trends, and amortization schedules |
| **Insurance** | Policy tracking with expiry status badges, coverage breakdown, and PDF document import |
| **Private Assets** | Track non-traditional assets (real estate, art, jewelry, vehicles, business stakes) with historical valuation tracking and confidence levels |
| **CPF (Singapore)** | CPF OA/SA/MA account tracking, contribution history, **CPF LIFE payout estimator**, retirement milestones (BRS/FRS/ERS), and withdrawal simulations |
| **AI Chat** | Interactive AI financial advisor performing structured 5-point financial analysis: Snapshot → Observations → Risks → Opportunities → Questions |
| **Stress Testing** | Scenario simulations for market crashes, interest rate changes, and economic downturns |
| **Profile & Authentication** | User profile management with email/name persistence, Gmail signup, age tracking, and subscription tier comparison |

---

## 🛠️ Technology Stack

### Frontend Framework
The app is built on a modern React Native stack optimized for performance and developer experience:

- **React Native** 0.81.5 with **Expo SDK 54** - Cross-platform mobile development
- **Expo Router** 6.0 - File-based routing for intuitive navigation structure
- **TypeScript** 5.9 - Full type safety across the codebase
- **React** 19.1.0 - Latest React features and optimizations
- **NativeWind** 4.2.1 - Tailwind CSS support in React Native for consistent styling

### State Management & Data Fetching
- **React Query** 5.90.12 - Server state management and caching
- **React Context API** - Local state management with custom hooks
- **AsyncStorage** 2.2.0 - Offline-first local data persistence

### Animations & Interactions
- **React Native Reanimated** 4.1.6 - High-performance gesture-driven animations
- **React Native Gesture Handler** 2.28.0 - Advanced gesture recognition
- **Expo Haptics** 15.0.8 - Haptic feedback for user interactions

### Backend & API
- **tRPC** 11.7.2 - Type-safe end-to-end API communication
- **Express** 4.22.1 - Node.js server framework
- **Drizzle ORM** 0.44.7 - Type-safe database queries with MySQL2
- **Axios** 1.13.2 - HTTP client for external API calls

### Authentication & Security
- **Firebase Authentication** - Email/password and OAuth sign-in
- **Jose** 6.1.0 - JWT token handling
- **Expo Secure Store** 15.0.8 - Secure credential storage

### AI & Analytics
- **Google Gemini AI** - Financial analysis and recommendations
- **Metric Insight Engine** - Financial health metrics and insights generation

### Data Storage
- **Firebase Firestore** - Cloud sync and real-time updates
- **S3 Storage** - File uploads (insurance PDFs, documents)
- **MySQL** 3.16.0 - Primary database for backend

### Development & Testing
- **Vitest** 2.1.9 - Unit and integration testing
- **ESLint** 9.39.2 - Code quality and linting
- **Prettier** 3.7.4 - Code formatting
- **Drizzle Kit** 0.31.8 - Database migrations
- **TypeScript** 5.9.3 - Type checking

### UI Components & Icons
- **Expo Vector Icons** 15.0.3 - Material Icons and SF Symbols
- **Expo Symbols** 1.0.8 - Native SF Symbols on iOS
- **React Native SVG** 15.12.1 - SVG rendering

### Utilities
- **Zod** 4.2.1 - Runtime schema validation
- **Clsx** 2.1.1 - Conditional class names
- **Tailwind Merge** 2.6.0 - Tailwind class merging
- **SuperJSON** 1.13.3 - JSON serialization for complex types

---

## 📁 Project Architecture

```
wealth-wellness-hub/
├── app/                              # Expo Router screens (file-based routing)
│   ├── (tabs)/                      # Tab navigation screens
│   │   ├── index.tsx                # Dashboard
│   │   ├── banks.tsx                # Banks module
│   │   ├── investments.tsx          # Investments module
│   │   ├── loans.tsx                # Loans module
│   │   ├── insurance.tsx            # Insurance module
│   │   ├── cpf.tsx                  # CPF module (Singapore-specific)
│   │   ├── assets.tsx               # Assets overview
│   │   └── profile.tsx              # User profile with email/name display
│   ├── auth/                         # Authentication screens
│   │   └── login.tsx                # Login page
│   ├── signup.tsx                   # Multi-step signup with Gmail auth
│   ├── ai-chat.tsx                  # AI chat assistant
│   ├── stress-test.tsx              # Portfolio stress testing
│   ├── stress-test-ai-chat.tsx      # AI-powered stress test analysis
│   ├── net-worth-timeline.tsx       # Net worth history visualization
│   ├── debt-analysis.tsx            # Debt analysis and management
│   ├── liquidity-analysis.tsx       # Liquidity metrics and analysis
│   ├── diversification-analysis.tsx # Portfolio diversification analysis
│   ├── private-asset-form.tsx       # Add/edit private assets
│   ├── private-asset-detail.tsx     # Private asset details view
│   ├── manage-subscriptions.tsx     # Subscription management
│   ├── oauth/                        # OAuth callback handlers
│   ├── dev/                          # Development utilities
│   └── _layout.tsx                  # Root layout with providers
│
├── components/                       # Reusable UI components
│   ├── ui/                           # Base UI components
│   │   └── icon-symbol.tsx          # Icon mapping for tabs
│   ├── cpf/                          # CPF-specific components
│   │   ├── cpf-overview-card.tsx
│   │   ├── cpf-retirement-sums.tsx
│   │   └── cpf-payout-estimator.tsx
│   ├── metric-card.tsx              # Financial metric cards
│   ├── screen-container.tsx         # SafeArea wrapper for all screens
│   └── haptic-tab.tsx               # Tab bar with haptic feedback
│
├── lib/                              # Core libraries and utilities
│   ├── app-data-context.tsx         # Global app state and user profile
│   ├── theme-provider.tsx           # Dark/light mode provider
│   ├── app-data-context.tsx         # User data management
│   ├── store.ts                     # Data calculations and storage
│   ├── types.ts                     # TypeScript interfaces (UserProfile, PrivateAsset, etc.)
│   ├── cpf-calculations.ts          # CPF-specific calculations
│   ├── cpf-constants.ts             # CPF retirement sums (2026 values)
│   ├── gemini-ai-service.ts         # Google Gemini AI integration
│   ├── metric-insight-engine.ts     # Financial insights generation
│   ├── wellness-score-calculator.ts # Wealth Wellness Score calculation
│   ├── cbs-score-calculator.ts      # CBS credit score calculation
│   ├── diversification-analyzer.ts  # Portfolio diversification analysis
│   ├── portfolio-risk-analytics.ts  # Portfolio risk assessment
│   ├── firebase-auth.ts             # Firebase authentication
│   ├── firebase-auth-context.tsx    # Auth state provider
│   ├── firebase-config.ts           # Firebase configuration
│   ├── trpc.ts                      # tRPC client setup
│   └── utils.ts                     # Utility functions (cn, etc.)
│
├── hooks/                            # Custom React hooks
│   ├── use-colors.ts                # Theme colors hook
│   ├── use-app-colors.ts            # App-specific colors
│   ├── use-auth.ts                  # Authentication hook
│   ├── use-color-scheme.ts          # Dark/light mode detection
│   └── use-app-data.ts              # App data context hook
│
├── server/                           # Backend server
│   ├── _core/                        # Framework-level code
│   │   ├── index.ts                 # Server entry point
│   │   ├── oauth.ts                 # OAuth handlers
│   │   └── errors.ts                # Error handling
│   ├── routers.ts                   # tRPC API routes
│   ├── db.ts                        # Database queries
│   ├── storage.ts                   # S3 storage helpers
│   └── README.md                    # Backend documentation
│
├── constants/                        # App constants
│   └── theme.ts                     # Theme color exports
│
├── __tests__/                        # Unit and integration tests
│   ├── cpf-calculations.test.ts
│   ├── wellness-score.test.ts
│   └── ...
│
├── assets/                           # Images and static assets
│   ├── images/
│   │   ├── icon.png                 # App icon
│   │   ├── splash-icon.png          # Splash screen icon
│   │   ├── favicon.png              # Web favicon
│   │   ├── android-icon-foreground.png
│   │   ├── android-icon-background.png
│   │   └── android-icon-monochrome.png
│
├── theme.config.js                  # Tailwind theme configuration
├── tailwind.config.js               # Tailwind CSS config
├── theme.config.d.ts                # Theme type definitions
├── global.css                       # Tailwind directives
├── app.config.ts                    # Expo app configuration
├── package.json                     # Dependencies and scripts
├── design.md                        # UI/UX design specifications
├── todo.md                          # Project roadmap and features
└── README.md                        # This file
```

---

## 📊 Key Modules

### Dashboard
The main screen provides a comprehensive financial overview with real-time updates:

- **Wealth Wellness Score**: Composite score (0-100) calculated from diversification, liquidity, debt ratios, and credit score
- **Net Worth**: Total assets (including private assets) minus total liabilities
- **Asset Allocation**: Visual breakdown of wealth distribution across all asset classes
- **Financial Health Cards**: Quick access to detailed analysis for banks, investments, loans, and insurance
- **AI Recommendations**: Personalized financial advice based on portfolio analysis

### Authentication & User Profile
The app implements a multi-step signup flow with Gmail integration:

- **Signup Flow**: Three-step process - method selection → Gmail email entry → name and age collection
- **User Profile**: Stores email, name, and birthDate (age calculated from birthDate)
- **Profile Display**: Shows user's name, calculated age, and life stage on profile card
- **Email Persistence**: Email from signup is saved and displayed in profile details
- **Login Page**: Dedicated sign-in screen for returning users

### Private Assets Module
Comprehensive tracking for non-traditional assets:

- **Asset Types**: Real estate, art, jewelry, vehicles, business stakes, collectibles, and custom categories
- **Valuation Tracking**: Historical valuation records with confidence levels (high/medium/low)
- **Custom Attributes**: Flexible key-value storage for asset-specific metadata
- **Estimated Value**: Current market value estimation with optional notes and source
- **Net Worth Integration**: Private assets contribute to total net worth calculations

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

The app uses sophisticated financial calculation engines for comprehensive analysis:

#### Net Worth Calculation
```
Net Worth = Total Assets - Total Liabilities

Total Assets = Bank Balances + Investment Holdings + Insurance Coverage + CPF Accounts + Private Assets
Total Liabilities = Outstanding Loan Balances
```

#### Wealth Wellness Score (0-100)
Composite score based on five weighted financial health factors:
```
Wellness Score = 
  (Credit Score Normalized × 25%) +
  (Liquidity Score × 25%) +
  (Diversification Score × 20%) +
  (Net Worth Growth Score × 15%) +
  (Debt Ratio Score × 15%)
```

**Component Calculations:**
- **Credit Score Normalized**: `((CBS Score - 1000) / (2000 - 1000)) × 100` (0-100 range)
- **Liquidity Score**: Based on months of expenses covered by liquid assets
  - ≤1 month: 20 points
  - 1-3 months: 50 points
  - 3-6 months: 80 points
  - >6 months: 100 points
- **Diversification Score**: Penalizes concentration if one asset class >60%
  - Applies Herfindahl index for portfolio concentration analysis
  - Concentration penalty: 2% per 1% over 60% threshold
- **Net Worth Growth Score**: Year-over-year change
  - Negative growth: 40 points
  - 0-5% growth: 60 points
  - 5-10% growth: 80 points
  - >10% growth: 100 points
- **Debt Ratio Score**: `(Liabilities / Assets)` ratio assessment
  - <20%: 100 points (Excellent)
  - 20-50%: 80 points (Good)
  - 50-100%: 60 points (Fair)
  - >100%: 20 points (Critical)

#### CBS Credit Score (1000-2000)
Singapore-style credit score based on five weighted factors:
```
CBS Score = 
  (Payment History × 35%) +
  (Amounts Owed × 30%) +
  (Length of Credit × 15%) +
  (Credit Mix × 15%) +
  (New Credit × 5%)
```

**Factor Details:**
- **Payment History (35%)**: Liquid assets vs monthly instalments ratio
  - ≥12x ratio: 95 points
  - 6-12x ratio: 85 points
  - 3-6x ratio: 70 points
  - 1-3x ratio: 50 points
  - <1x ratio: 25 points
- **Amounts Owed (30%)**: Debt-to-asset ratio analysis
  - <20%: 95 points
  - 20-50%: 75 points
  - 50-100%: 50 points
  - >100%: 20 points
- **Length of Credit (15%)**: Account age and credit history duration
- **Credit Mix (15%)**: Variety of credit types (secured, unsecured, revolving)
- **New Credit (5%)**: Recent credit inquiries and new accounts

#### CPF Projections
Account growth calculations with annual interest rates:
```
Ordinary Account (OA): 2.5% annual interest
Special Account (SA): 4% annual interest
MediSave Account (MA): 4% annual interest
Retirement Account (RA): 4% annual interest (activated at age 55)

Projected Balance at Age 65 = Current Balance × (1 + interest_rate)^(65 - current_age)
```

#### Debt-to-Asset Ratio
```
Debt-to-Asset Ratio (%) = (Total Liabilities / Total Assets) × 100

Status Classification:
- <50%: Healthy
- 50-150%: Warning
- >150%: Critical
```

#### Liquidity Analysis
```
Liquidity Months = Liquid Assets / Monthly Debt Obligations

Liquid Assets = Savings + Daily Accounts
Monthly Debt Obligations = Sum of all monthly loan instalments

Target: 6+ months of coverage (emergency fund)
```

#### Diversification Index
```
Asset Classes Tracked: Stocks, Crypto, ETFs, Bonds, Futures, Options, REITs, Commodities

Diversification Score = 100 - Concentration Penalty - Herfindahl Penalty

Target: 4+ asset classes with balanced allocation
```

#### TDSR-Based Loan Capacity
```
Maximum Loan Capacity = (Monthly Income × 60%) / Monthly Debt Service Ratio

Where:
- Monthly Income = Annual Salary / 12
- TDSR = Total Debt Service / Monthly Income
- Typical TDSR Limit: 60% for most lenders
```

### AI Integration

The app uses Google Gemini AI for:

- **Financial Recommendations**: Analyzes portfolio and suggests improvements
- **Chat Assistant**: Answers questions about financial health with data-driven insights
- **Stress Test Analysis**: Provides insights on portfolio resilience
- **Metric Insights**: Explains financial health metrics in plain language

---

## 🔐 Authentication & User Management

The app implements a comprehensive authentication system with user profile persistence:

### Authentication Methods
1. **Gmail Signup** - Multi-step flow with email collection and profile setup
2. **Email/Password** - Traditional signup and login
3. **Firebase Authentication** - Secure backend authentication
4. **Session Management** - Token-based sessions with secure storage

### User Profile Management
- **Profile Data**: Email, name, birthDate (age calculated automatically)
- **Life Stage Classification**: Automatically determined based on age and family status
- **Profile Display**: User's name displayed on profile card with calculated age and life stage
- **Data Persistence**: All profile data persists across app sessions via AsyncStorage and Firebase

### Login Page
Dedicated login screen for returning users with:
- Email/password authentication
- Password reset functionality
- Sign-up link for new users
- Session recovery

---

## 📱 Data Management

### Local Storage
- Uses AsyncStorage for offline-first data persistence
- All financial data stored locally by default
- Automatic sync to Firestore when authenticated
- Supports data export and backup

### Cloud Sync
- Firebase Firestore for user data synchronization
- Secure per-user data isolation
- Real-time updates across devices
- Automatic conflict resolution

### Data Types
The app manages the following data structures:

| Data Type | Purpose | Storage |
|-----------|---------|---------|
| **BankAccount** | Savings, daily, credit accounts | Local + Cloud |
| **Loan** | Mortgages, personal loans, credit cards | Local + Cloud |
| **Holding** | Investment positions across 8 asset classes | Local + Cloud |
| **InsurancePolicy** | Life, health, property insurance | Local + Cloud |
| **PrivateAsset** | Real estate, art, vehicles, business stakes | Local + Cloud |
| **CPFUserData** | OA, SA, MA, RA balances and projections | Local + Cloud |
| **UserProfile** | Email, name, birthDate, life stage | Local + Cloud |
| **CreditScoreData** | CBS score and component breakdown | Calculated |

---

## 📚 Documentation

- **`design.md`**: UI/UX design specifications and brand guidelines
- **`todo.md`**: Project roadmap and feature checklist
- **`server/README.md`**: Backend development guide
- **`lib/wellness-score-calculator.ts`**: Wealth Wellness Score calculation engine
- **`lib/cbs-score-calculator.ts`**: CBS credit score calculation with TDSR analysis
- **`lib/metric-insight-engine.ts`**: Financial health metrics and insights generation
- **`lib/cpf-calculations.ts`**: CPF account projections and retirement planning
- **`lib/diversification-analyzer.ts`**: Portfolio diversification analysis
- **`lib/portfolio-risk-analytics.ts`**: Portfolio risk assessment and stress testing
- **`lib/types.ts`**: Complete TypeScript interface definitions

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
