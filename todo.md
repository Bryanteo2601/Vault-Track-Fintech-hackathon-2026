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

## Phase 21: Comprehensive CPF Dashboard Upgrade
- [x] Design CPF data model and create constants/config file
- [x] Build CPF calculation logic and retirement estimator
- [x] Create CPF UI components (overview, editable inputs, descriptions)
- [x] Build retirement milestones timeline and retirement sums section
- [x] Implement CPF LIFE payout estimator and smart insights
- [x] Add interest rates and healthcare info cards
- [x] Integrate all components into CPF screen and test
- [x] Created 24 comprehensive unit tests (all passing)
- [x] CPF dashboard fully functional with dynamic calculations

## Phase 22: AI Chatbot Improvement - Financial Analysis Assistant
- [x] Review current AI chatbot implementation and system prompt
- [x] Create improved AI system prompt with financial analysis framework
- [x] Update AI chat service to use new prompt and data context
- [x] Test AI responses with sample portfolio data
- [x] Verify output follows 5-point format (Snapshot, Observations, Risks, Opportunities, Questions)
- [x] Fixed age input display to show "years old" instead of "SGD"
- [x] Created 25 comprehensive unit tests (all passing)
- [x] AI chatbot now provides data-driven analysis instead of generic advice

## Phase 23: Subscription & Feature Gating System
- [x] Design subscription schema and feature types
- [x] Create subscription database schema and Firestore integration
- [x] Build feature gating logic and hooks (useFeatureGate, useCanPerformAI, useSingpassVerification)
- [x] Create paywall and upgrade modal UI components
- [x] Create feature gated section and button components
- [x] Add subscription management screen with tier comparison
- [x] Add subscription tab to navigation
- [x] Created 23 comprehensive unit tests (all passing)
- [x] Feature gating system fully functional with 3 tiers (Free, Pro, Premium)

## Phase 24: Subscription Management on Profile
- [x] Removed subscription tab from navigation
- [x] Added "Manage Subscriptions" section to Profile screen
- [x] Created upgrade modal with Pro and Premium tier options
- [x] Improved "Upgrade Now" button UI with better styling
- [x] Subscription section displays current tier (FREE) with upgrade prompt
- [x] Upgrade modal shows tier comparison with pricing and features
- [x] All TypeScript errors resolved

## Phase 25: Navigation & Subscription Flow Refactor
- [x] Deleted standalone subscription.tsx and manage-subscription.tsx pages
- [x] Integrated all subscription management features into Profile page
- [x] Added expandable Pro and Premium plan cards in Profile
- [x] Added billing cycle toggle (monthly/annual) in Profile
- [x] Added tier comparison with features list in Profile
- [x] Added billing information and FAQ in Profile
- [x] All TypeScript errors resolved
- [x] Dev server compiling successfully
- [x] Bottom navigation clean with 7 essential tabs (Dashboard, Banks, Investments, Loans, Insurance, CPF, Profile)
- [x] All subscription management now accessible from Profile page only

## Phase 26: Improved Wellness Score Algorithm
- [x] Create wellness score calculation module with five weighted factors
- [x] Implement credit score normalization (300-850 to 0-100)
- [x] Implement liquidity score calculation (months of expenses)
- [x] Implement diversification score (concentration risk analysis)
- [x] Implement net worth growth score (YoY change)
- [x] Implement debt ratio score (liabilities/assets)
- [x] Integrate algorithm into store and app data context
- [x] Update dashboard gauge to display dynamic score (now showing 52.1)
- [x] Create 40+ comprehensive unit tests for all five scoring factors
- [x] Algorithm tested with sample data and grades (A-F) verified
- [x] Dev server compiling with 0 errors

## Phase 27: Dynamic CBS Credit Score Calculation Engine
- [x] Create CBS score calculation utility with five weighted factors
- [x] Implement Payment History factor (35% weight)
- [x] Implement Amounts Owed factor (30% weight)
- [x] Implement Length of Credit factor (15% weight)
- [x] Implement Credit Mix factor (10% weight)
- [x] Implement New Credit factor (10% weight)
- [x] Calculate estimated max loan using TDSR logic
- [x] Integrate CBS calculation into Banks screen
- [x] Update Banks screen to display dynamic scores and factors
- [x] Add edge case handling (no loans, missing income, zero assets)
- [x] Created 30+ comprehensive unit tests for CBS calculation
- [x] All TypeScript errors resolved
- [x] Dev server compiling successfully with 0 errors
- [x] CBS score now calculates dynamically from user financial data

## Phase 28: Fix CBS Credit Score Display for Empty Data
- [x] Fix CBS credit score display to show 0 and Grade "-" when no data exists
- [x] Update Banks screen credit score card to reflect empty state properly
- [x] Ensure all factor scores show 0 when insufficient data
- [x] Update Dashboard to use dynamic CBS score calculation instead of stored credit score
- [x] Fix Dashboard credit score color calculation for empty state
- [x] All 17 CBS calculator unit tests passing

## Phase 29: Refactor to Shared Financial Analytics Engine
- [ ] Create unified financialEngine.ts with shared analysis logic
- [ ] Implement normalized data aggregation from all financial data
- [ ] Refactor Wealth Wellness Score to use shared engine
- [ ] Refactor CBS Credit Score to use shared engine
- [ ] Create shared insights generation system
- [ ] Bind all UI screens to live computed values
- [ ] Add comprehensive edge case handling
- [ ] Test and save checkpoint

## Phase 30: Portfolio Risk Analytics
- [x] Create portfolio risk analytics calculation engine
- [x] Implement portfolio return calculation (current_value - cost_basis) / cost_basis
- [x] Implement portfolio volatility calculation using standard deviation
- [x] Implement Sharpe ratio calculation with 3% risk-free rate
- [x] Create risk classification logic (Low/Moderate/Strong)
- [x] Build portfolio risk analytics UI components
- [x] Integrate analytics into Investments screen
- [x] Create comprehensive unit tests for risk calculations (21/21 passing)
- [x] Test all features and verify compilation

## Phase 31: Fix Stress Test Empty State
- [x] Fix Portfolio Stress Test to show SGD 0 for all scenarios when no holdings exist
- [x] Update stress test to use real portfolio data instead of hardcoded values
- [x] Add empty state card when portfolio is empty
- [x] Verify all market scenarios display SGD 0 with 0% impact

## Phase 32: Monte Carlo Simulation Engine Upgrade
- [x] Create Monte Carlo simulation engine with historical volatility calculation
- [x] Implement 1000-path simulation with normal distribution returns
- [x] Calculate final portfolio value for each simulation path
- [x] Calculate maximum drawdown for each path
- [x] Calculate expected return metrics (mean, median, percentiles)
- [x] Create distribution histogram visualization
- [x] Create confidence interval chart visualization
- [x] Build Monte Carlo results UI component
- [x] Integrate Monte Carlo into stress testing screen
- [x] Create comprehensive unit tests for Monte Carlo engine (33/33 passing)
- [x] Test all features and verify compilation

## Phase 33: HHI-Based Diversification Analysis
- [x] Create HHI calculation engine with weight normalization
- [x] Implement diversification score calculation (1 - HHI) * 100
- [x] Create diversification level classification (Well/Moderate/Concentrated)
- [x] Build portfolio adjustment recommendation engine
- [x] Create diversification analysis UI component
- [x] Integrate into portfolio/investments screens
- [x] Create comprehensive unit tests for HHI engine (40/40 passing)
- [x] Test all features and verify compilation

## Phase 34: Goal-Based Financial Planning Tool
- [x] Create financial goal planning engine with FV calculations
- [x] Implement goal achievement probability calculation
- [x] Implement required monthly savings calculation
- [x] Create goal progress tracking and completion year projection
- [x] Create comprehensive unit tests for goal planning engine (31/31 passing)
- [x] Test all features and verify compilation
- [ ] Build goal planning UI component with progress bar
- [ ] Integrate into financial planning screen

## Phase 35: 12-Month Cashflow Forecasting
- [x] Create cashflow forecasting engine with monthly balance projections
- [x] Implement liquidity warning system with safety threshold
- [x] Calculate minimum balance projection across forecast period
- [x] Identify months with critical liquidity issues
- [x] Create comprehensive unit tests for cashflow engine (34/34 passing)
- [x] Test all features and verify compilation
- [ ] Build cashflow forecast UI component with monthly breakdown
- [ ] Integrate into financial planning screen
- [ ] Save checkpoint

## Phase 36: Add Test Data to All Features
- [x] Add sample investment holdings (stocks, bonds, ETFs, crypto)
- [x] Add sample banking accounts and loan data
- [x] Add sample insurance and CPF data
- [x] Add sample credit score data with good standing
- [x] Verify all features display correctly with test data
- [x] Create test data initialization script
- [ ] Save checkpoint with test data

## Phase 37: Fix UI Layout Issues
- [x] Rewrite loans page with better card-based layout
- [x] Add loan type and security type selectors
- [x] Implement loan breakdown by security type
- [x] Update Financial Health metrics from square grid to horizontal cards
- [x] Fix dashboard layout and styling
- [x] Verify all changes compile successfully

## Phase 38: Private Assets Feature Implementation
- [ ] Create Private Assets data model with flexible asset types
- [ ] Implement historical valuations tracking
- [ ] Build Private Assets list and detail screens
- [ ] Create add/edit asset forms with optional custom attributes
- [ ] Implement profit/loss calculations
- [ ] Create time series analysis and CAGR calculations
- [ ] Build AI-powered contextual valuation assistant
- [ ] Integrate Private Assets into net worth calculations
- [ ] Add Private Assets to dashboard and asset allocation
- [ ] Create Private Asset insights and analytics
- [ ] Create comprehensive unit tests for all calculations
- [ ] Test and save checkpoint

## Phase 38: Private Assets UI Screens
- [x] Create Private Assets list screen with filtering and sorting
- [ ] Build Private Assets detail screen with valuation history timeline
- [ ] Create add/edit form screen with validation
- [ ] Implement CRUD context methods (add, update, delete)
- [ ] Add navigation between screens
- [ ] Create comprehensive unit tests for UI components
- [ ] Test all features and save checkpoint

## Phase 39: Complete Private Assets UI Screens
- [x] Build Private Assets detail screen with valuation history
- [x] Create add/edit form with flexible asset fields
- [x] Implement asset type detection and custom attributes
- [x] Add historical value tracking UI
- [ ] Create time series chart visualization

## Phase 40: Private Assets CRUD Operations
- [x] Implement addPrivateAsset context method
- [x] Implement updatePrivateAsset context method
- [x] Implement deletePrivateAsset context method
- [x] Add historical valuation update logic
- [x] Persist changes to Firestore

## Phase 41: Profit/Loss & Historical Tracking
- [ ] Calculate unrealised PnL for each asset
- [ ] Calculate percentage return
- [ ] Support quantity-based calculations
- [ ] Build historical valuations tracking
- [ ] Create value trend analysis

## Phase 42: Time Series Analysis Engine
- [ ] Calculate CAGR from historical data
- [ ] Generate 1Y, 3Y, 5Y projections
- [ ] Implement annualized growth rate
- [ ] Handle limited history fallback
- [ ] Create projection confidence levels

## Phase 43: AI Valuation Assistant
- [ ] Create contextual AI valuation engine
- [ ] Implement asset type detection
- [ ] Build structured valuation response format
- [ ] Add confidence level assessment
- [ ] Create safe valuation disclaimers

## Phase 44: AI Valuation Workflow
- [ ] Create "Estimate with AI" button
- [ ] Build contextual valuation flow
- [ ] Implement missing field detection
- [ ] Create asset-specific question flows
- [ ] Add valuation acceptance/editing UI

## Phase 45: Net Worth Integration
- [ ] Add privateAssetsTotal to net worth calculation
- [ ] Update asset allocation charts
- [ ] Include in dashboard summary
- [ ] Add toggle for inclusion/exclusion
- [ ] Update all financial metrics

## Phase 46: Private Asset Insights
- [ ] Generate appreciation insights
- [ ] Identify best/worst performers
- [ ] Flag low confidence valuations
- [ ] Detect stale valuations
- [ ] Analyze concentration risk

## Phase 47: Testing & Refinement
- [ ] Create unit tests for all calculations
- [ ] Test AI valuation flows
- [ ] Verify net worth integration
- [ ] Test historical tracking
- [ ] Comprehensive end-to-end testing


## Phase 48: Fix Private Assets Feature
- [ ] Fix navigation: wire up "+ Add Asset" button to form screen
- [ ] Fix navigation: wire up "Add Your First Asset" button to form screen
- [ ] Implement asset creation form with required/optional fields
- [ ] Add form validation and error handling
- [ ] Create profit/loss calculation engine
- [ ] Build asset card component with gain/loss display
- [ ] Implement historical valuation tracking
- [ ] Create value history chart and CAGR analysis
- [ ] Integrate private assets into net worth calculations
- [ ] Add AI valuation assistant button and logic
- [ ] Improve empty state message
- [ ] Handle edge cases (zero purchase price, missing values, NaN)
- [ ] Test all functionality and save checkpoint


## Phase 49: Time Series Analytics for Private Assets
- [x] Create time series analytics calculation engine
- [x] Implement CAGR calculation from historical valuations
- [x] Calculate 1Y, 3Y, 5Y projections
- [x] Build portfolio growth chart component
- [x] Create insights display with growth metrics
- [x] Integrate chart into Private Assets screen under Total Gain/Loss
- [x] Test and save checkpoint


## Phase 50: Add Sample Private Assets Data
- [x] Add sample jewelry with historical valuations
- [x] Add sample real estate with appreciation history
- [x] Add sample art collection with valuation timeline
- [x] Add sample collectibles with growth data
- [x] Generate Private Assets feature logo
- [x] Test growth chart with sample data
- [x] Fixed property names and createdAt timestamps
- [x] Verified TypeScript compilation with 0 errors
