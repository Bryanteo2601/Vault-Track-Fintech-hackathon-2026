# Wealth Wellness Hub — TODO

## Phase 1: Setup
- [x] Initialize project scaffold
- [x] Write design.md
- [x] Generate app logo and update branding
- [x] Update theme colors (navy/emerald palette)

## Phase 2: Core Structure
- [x] Update tab navigation (Dashboard, Banks, Investments, Loans, Insurance)
- [x] Add all icon mappings to icon-symbol.tsx
- [x] Create shared data layer (AsyncStorage-backed stores)
- [x] Create shared UI components (StatCard, SectionHeader, EmptyState, ProgressBar)
- [x] Create data types and interfaces
- [x] AppDataContext provider

## Phase 3: Dashboard
- [x] Wealth Wellness Score gauge
- [x] Total Net Worth display
- [x] Asset allocation horizontal bar
- [x] Financial health metric cards (Diversification, Liquidity, Debt-to-Asset, Credit Score)
- [x] AI Recommendations cards

## Phase 4: Banks Module
- [x] Bank accounts list screen
- [x] Add/edit bank account form
- [x] Credit score section (CBS-style breakdown with grade)
- [x] Loan capacity calculator (TDSR-based)
- [x] Monthly interest earned summary
- [x] Loan summary per bank

## Phase 5: Investments Module
- [x] Investment portfolio overview with P&L
- [x] Pie chart by asset class (react-native-svg)
- [x] Asset class expandable cards
- [x] Holdings list per asset class (stocks, crypto, ETFs, bonds, futures, options, REITs, commodities)
- [x] Add/edit/delete holding form
- [x] AI portfolio suggestions panel

## Phase 6: Loans Module
- [x] Loans overview with total outstanding
- [x] Aggregated outstanding balances table (CBS format, matching provided image)
- [x] 6-month historical trend chart
- [x] Loan cards with instalment/months/interest/progress bar
- [x] Add/edit/delete loan form
- [x] Security type classification (Secured / Unsecured IB / Unsecured NIB / Exempted)

## Phase 7: Insurance Module
- [x] Insurance policies list with expiry tracking
- [x] Add/edit/delete policy form
- [x] PDF import via document picker (persistent storage)
- [x] Coverage breakdown by type
- [x] Policy status badges (Active / Expiring Soon / Expired)

## Phase 8: Polish & Delivery
- [x] App logo generated and applied
- [x] All screens reviewed for consistency
- [x] Empty states for all lists
- [x] Unit tests for all financial calculations (13 tests passing)
- [x] Checkpoint saved

## Phase 9: Firebase Authentication & Firestore Integration
- [x] Install Firebase SDK packages (firebase)
- [x] Configure environment variables for Firebase public config
- [x] Create Firebase auth service with signup/login/logout/forgot-password
- [x] Build auth context provider for global auth state
- [x] Create signup screen with email/password validation
- [x] Create login screen with email/password
- [x] Create forgot-password screen with email recovery
- [x] Build protected route wrapper component
- [x] Update navigation to show auth or app screens based on login state
- [x] Create Firestore user document schema
- [x] Integrate Firestore user data sync on login
- [x] Write Firestore security rules (users can only read/write own data)
- [x] Add field validation to prevent unauthorized updates
- [x] Create user profile/settings screen
- [x] Document Firebase setup steps and security rules
- [x] Create comprehensive Firebase architecture documentation

## Phase 10: Firebase Auth Bug Fix
- [x] Fix Firebase configuration-not-found error on auth screens
- [x] Verify Firebase SDK initialization in React Native
- [x] Test email/password signup
- [x] Test email/password login
- [ ] Test Apple Sign-In on iOS

## Phase 11: Firestore Security Rules & Data Isolation
- [x] Create firestore.rules file with per-user access control
- [x] Ensure users can only read/write their own data
- [x] Test data isolation with multiple user accounts
- [x] Deploy security rules to Firebase Console (manual step in Firebase Console)

## Phase 13: Firebase Gemini AI Integration
- [x] Set up Firebase Gemini AI service
- [x] Create AI financial analysis service
- [x] Add AI recommendations to dashboard
- [x] Create AI chat assistant screen
- [x] Add chat history persistence
- [ ] Test AI responses and optimize prompts

## Phase 14: AI Chat Error Fix
- [x] Fix Gemini AI initialization error
- [x] Test chat responses
- [x] Verify API integration

## Phase 15: Drill-Down Financial Analysis Feature
- [x] Create metric analysis data structures and types
- [x] Build AI insight engine for financial metrics
- [x] Create debt analysis screen with breakdown
- [x] Add visual charts (donut and line charts)
- [x] Build reusable metric drill-down component
- [x] Add navigation from dashboard cards to analysis screens
- [x] Create liquidity, diversification, and credit score analysis screens
- [x] Test all drill-down features

## Phase 16: CPF Support (Singapore)
- [x] Create CPF data types (OA, SA, MA accounts)
- [x] Add CPF module to tab navigation
- [x] Build CPF overview screen with account balances
- [x] Create CPF account detail screens (OA, SA, MA)
- [x] Add CPF contribution tracking
- [x] Add CPF withdrawal simulation calculator
- [x] Integrate CPF into net worth calculations
- [x] Add CPF to financial health metrics

## Phase 17: Portfolio Stress Testing
- [x] Create stress testing data types and scenarios
- [x] Build stress testing engine (market crash, interest rate changes, etc.)
- [x] Create portfolio stress testing screen under Investments
- [x] Add AI Chat feature to stress testing screen
- [x] Generate stress test reports and recommendations
- [x] Add historical stress test results tracking
- [x] Test various market scenarios

## Phase 18: Net Worth Timeline Visualization
- [x] Create historical net worth data tracking
- [x] Build timeline chart component (2022-2025)
- [x] Add net worth history data persistence
- [x] Create timeline screen on Dashboard
- [x] Add year-over-year comparison
- [x] Add trend analysis and projections
- [x] Integrate with existing data


## Phase 19: Banks Module Firestore Migration Fix
- [x] Fixed calcMaxLoan undefined error in banks.tsx
- [x] Fixed calcCBSScore import and replaced with getCreditScoreDetails
- [x] Fixed broken function calls in loans.tsx (totalInterest, totalPaid)
- [x] Verified all TypeScript errors resolved
- [x] Dev server compiling successfully with 0 errors

## Phase 20: Remove Placeholder Data for New Users
- [x] Changed default bank accounts to empty array
- [x] Changed default loans to empty array
- [x] Changed default holdings to empty array
- [x] Changed default insurance policies to empty array
- [x] Changed default credit score to all zeros
- [x] Added empty state to Banks screen for credit score
- [x] Added empty state to CPF screen
- [x] Verified wellness score calculates dynamically (50 base + bonuses for actual data)
- [x] All TypeScript errors resolved

## Phase 20: User Data Isolation Audit & Fix
- [ ] Audit AppDataContext data fetching logic
- [ ] Verify all data writes use currentUser.uid in paths
- [ ] Verify all data reads query only current user's data
- [ ] Test with multiple user accounts
- [ ] Fix any data isolation issues
- [ ] Document data structure and paths
