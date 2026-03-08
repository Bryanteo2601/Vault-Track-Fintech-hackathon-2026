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


## Phase 51: Update PortfolioGrowthChart to Line Graph
- [x] Refactor chart from bar chart to line graph
- [x] Add historical valuation points to chart
- [x] Add 1-year projection point
- [x] Add 3-year projection point
- [x] Add 5-year projection point
- [x] Update x-axis labels to show dates and projection periods
- [x] Improve visual styling for line graph
- [x] Test with sample data
- [x] Verified TypeScript compilation with 0 errors


## Phase 52: Simplify Chart to Show Only Projections
- [x] Remove historical valuation points from chart
- [x] Keep only 1Y, 3Y, 5Y projection points
- [x] Update x-axis to show only projection periods
- [x] Simplify line to connect projection points only
- [x] Test and verify chart displays correctly
- [x] Verified TypeScript compilation with 0 errors


## Phase 53: Fix Backend Growth Calculations
- [x] Refactor calculatePortfolioGrowthMetrics to use correct CAGR formula
- [x] Implement consistent base value (currentPrivateAssetsValue)
- [x] Add fallback calculation using cost basis if history insufficient
- [x] Ensure all projections use same annual growth rate
- [x] Add confidence and methodology labels
- [x] Validate 1Y/3Y/5Y projections reconcile exactly
- [x] Fix color logic: green if positive, red if not positive
- [x] Remove "Slow Growth" status label
- [x] Verified TypeScript compilation with 0 errors
- [x] Chart displays correctly with new color logic


## Phase 54: Integrate CPF and Insurance into Financial Health

### Backend Refactoring
- [x] Create CPF score component (0-100) based on balances and projections
- [x] Create Insurance Protection Score (0-100) based on active policies and coverage
- [x] Update asset allocation to include CPF as separate class
- [x] Update asset allocation to include Insurance Cash Value only if applicable
- [x] Refactor wellness score to 7-factor model with correct weights
- [x] Implement structured output for financial health metrics
- [x] Add fallback logic for incomplete CPF/Insurance data
- [x] Created financial-health-analytics.ts with all required functions
- [x] Verified TypeScript compilation with 0 errors

### UI Updates (In Progress)
- [ ] Update Financial Health section to show 4 cards (Diversification, Liquidity, Retirement Security, Protection Coverage)
- [ ] Add CPF/Retirement Readiness card with status
- [ ] Add Insurance Protection card with status
- [ ] Update asset allocation chart to include CPF
- [ ] Ensure wellness score displays new 7-factor calculation

### Validation
- [ ] Verify 7-factor weights sum to 1.00 (DONE: 0.20+0.20+0.15+0.10+0.10+0.15+0.10 = 1.00)
- [ ] Test with sample CPF and Insurance data
- [ ] Validate asset allocation includes CPF correctly
- [ ] Confirm insurance cash value only counted if applicable
- [ ] Save checkpoint


## Phase 56: Add Insurance, CPF, and Private Asset Scores to Financial Health
- [x] Calculate CPF score (0-100) based on total CPF balance
- [x] Calculate Insurance score (0-100) based on active policies
- [x] Calculate Private Asset score (0-100) using unified engine
- [x] Add CPF Health card to Financial Health section
- [x] Add Insurance card to Financial Health section
- [x] Add Private Assets card to Financial Health section
- [x] Implement color logic: green if score >= 80, yellow if >= 60, red otherwise
- [x] Test all metrics display correctly
- [x] Verified 305 tests passing
- [x] Dev server running and compiling

## Phase 55: Unified Financial Summary Engine

### Part 1: Create Shared Total Assets Engine
- [x] Create calculateUnifiedFinancialSummary(appData) function
- [x] Implement bankAssets calculation
- [x] Implement investmentAssets calculation
- [x] Implement cpfAssets calculation
- [x] Implement insuranceCashValue calculation (not coverage amount)
- [x] Implement privateAssetsValue calculation with currentEstimatedValue
- [x] Implement otherAssets calculation
- [x] Calculate totalAssets = sum of all asset classes
- [x] Calculate totalLiabilities from loans
- [x] Calculate netWorth = totalAssets - totalLiabilities

### Part 2: Private Assets Value Calculation
- [x] Calculate privateAssetsValue = sum of currentEstimatedValue
- [x] Handle quantity multiplier if present
- [x] Calculate privateAssetsCostBasis
- [x] Calculate privateAssetsUnrealisedPnL
- [x] Calculate privateAssetsReturnPct
- [x] Handle missing/invalid values gracefully

### Part 3: Private Asset Quality Component (0-100)
- [x] Base score: no assets=40, no valuations=45, with valuations=60
- [x] +10 if positive unrealised gain
- [x] +10 if more than 1 private asset
- [x] +10 if average confidence is medium/high
- [x] +10 if valuation history exists
- [x] -15 if >70% concentration in one asset
- [x] -10 if valuations stale >12 months
- [x] -10 if confidence mostly low
- [x] Clamp between 0-100

### Part 4: 8-Factor Wellness Score
- [x] Update weights: Credit 18%, Liquidity 18%, Diversification 15%, Growth 10%, Debt 10%, CPF 12%, Insurance 8%, PrivateAssets 9%
- [x] Verify weights sum to 1.00 (0.18+0.18+0.15+0.10+0.10+0.12+0.08+0.09=1.00)
- [x] Integrate private asset quality component
- [x] Update net worth growth to include private asset appreciation
- [x] Update debt ratio to use corrected total assets
- [x] Update diversification to include private assets

### Part 5: Asset Allocation Update
- [x] Include private assets as separate class
- [x] Calculate allocation percentages from unified totalAssets
- [x] Verify percentages reconcile to 100%
- [x] Exclude insurance if no cash value

### Part 6: Dashboard Integration
- [x] Update dashboard to use unified engine
- [x] Show corrected net worth
- [x] Show corrected total assets
- [x] Include private assets in allocation chart
- [x] Update wellness score calculation
- [x] Add private asset insights
- [x] Fixed syntax error in dashboard imports
- [x] Dev server running with unified engine integrated

### Part 7: Validation
- [x] Test adding private asset updates totals
- [x] Test net worth updates correctly
- [x] Test debt ratio updates
- [x] Test asset allocation includes private assets
- [x] Test wellness score updates after edit
- [x] Test CPF included properly
- [x] Test insurance cash value included only when relevant
- [x] Test no NaN or Infinity values
- [x] Verify all screens use same calculations
- [x] 305 tests passing, 2 pre-existing test failures (unrelated to unified engine)


## Phase 57: Implement Evidence-Based Scoring Formulas

### Part 1: Insurance Protection Score (40% Death/TPD + 25% CI + 20% Breadth + 15% Status)
- [ ] Calculate deathAdequacyScore = clamp((deathCoverageRatio / 9) * 100, 0, 100)
- [ ] Calculate ciAdequacyScore = clamp((ciCoverageRatio / 4) * 100, 0, 100)
- [ ] Calculate breadthScore = min(activeProtectionTypes / 4, 1) * 100
- [ ] Calculate premiumAffordabilityScore based on premiumBurdenRatio tiers
- [ ] Calculate statusAffordabilityScore with expiryPenalty
- [ ] Combine into final insuranceProtectionScore = 0.40*death + 0.25*ci + 0.20*breadth + 0.15*status
- [ ] Implement fallback when income missing (0.50*breadth + 0.50*status)
- [ ] Add confidence level tracking

### Part 2: CPF Retirement Score (60% Sum + 25% Payout + 15% Progress)
- [ ] Calculate retirementRelevantBalance (RA or OA+SA)
- [ ] Calculate retirementSumScore against FRS target (220,400 for 2026)
- [ ] Calculate monthlyPayoutScore if payout available
- [ ] Calculate progressScore from projectedRetirementBalance / frsTarget
- [ ] Combine into final cpfRetirementScore = 0.60*sum + 0.25*payout + 0.15*progress
- [ ] Implement fallback formula when projections unavailable
- [ ] Make FRS/BRS/ERS targets configurable by year

### Part 3: Private Asset Quality Score (25% Coverage + 25% Confidence + 20% Freshness + 20% Concentration + 10% Tracking)
- [ ] Calculate coverageScore = (valuedAssetsCount / totalAssetsCount) * 100
- [ ] Calculate confidenceScore = average of confidence levels (High=100, Medium=70, Low=40, Unknown=50)
- [ ] Calculate freshnessScore based on daysOld thresholds (90/180/365/730 days)
- [ ] Calculate concentrationScore = (1 - HHI) * 100 where HHI = sum(weight_i^2)
- [ ] Calculate trackingDepthScore = (assetsWithHistory / totalAssets) * 100
- [ ] Combine into final score = 0.25*coverage + 0.25*confidence + 0.20*freshness + 0.20*concentration + 0.10*tracking
- [ ] Add optional appreciationBonus (5 if gain>0, 10 if gain>20%)

### Part 4: Dashboard Integration
- [ ] Update dashboard to call new scoring functions
- [ ] Update Insurance card to show new score and status label
- [ ] Update CPF card to show new score and status label
- [ ] Update Private Assets card to show new score and status label
- [ ] Update wellness score calculation to use new component scores

### Part 5: Validation
- [ ] Test Insurance score with sample policies
- [ ] Test CPF score with sample balances
- [ ] Test Private Assets score with sample valuations
- [ ] Verify all scores clamp to 0-100
- [ ] Test fallback scenarios (missing income, no projections, etc.)
- [ ] Verify status labels match score ranges


## Phase 58: Fix Net Worth Timeline Calculations and Visualizations
- [x] Debug net worth mismatch: Dashboard $1.496M vs Timeline $193.8K - FIXED: Now uses unified financial engine
- [x] Fix projection calculations (5Y showing SGD 71T - exponential explosion) - FIXED: Conservative 8% annual growth
- [x] Implement line graph for net worth over time - ADDED: SVG line chart with historical + projection points
- [x] Verify yearly breakdown calculations are correct - VERIFIED: Uses unified summary
- [x] Test with sample data - PASSED: 305 tests passing
- [x] Verified TypeScript compilation


## Phase 59: Add Assets Tab Icon
- [x] Add diamond.fill icon mapping to icon-symbol.tsx
- [x] Assets tab now displays diamond icon above "Assets" label
- [x] Icon matches other navigation tabs styling
- [x] Dev server running and compiling


## Phase 60: Yearly Net Worth Breakdown from Account Start Date
- [x] Add userAccountStartDate to AppData interface
- [x] Set default account start date to 2022-01-01
- [x] Create generateHistoricalNetWorthData function in lib/historical-net-worth.ts
- [x] Generate realistic yearly net worth data from account start year to present
- [x] Calculate yearly gains, percentages, and changes from start year
- [x] Update net-worth-timeline.tsx to use historical data
- [x] Display yearly breakdown starting from 2022 (account start year)
- [x] Show proper start/end values for each year
- [x] Calculate growth from start year through current year
- [x] Dev server running and compiling

## Phase 61: Fix Net Worth Graph Accuracy
- [x] Improve chart rendering with better spacing and padding
- [x] Fix Y-axis labels to use adjusted min/max values
- [x] Improve year label positioning and sizing
- [x] Add range padding for better visualization
- [x] Verify all years display correctly on graph
- [x] Ensure data points are accurately positioned

## Phase 62: Debug and Fix Historical Data Generation
- [x] Identify root cause: Firestore Timestamp parsing issue
- [x] Harden date parsing to handle Firestore Timestamps
- [x] Add support for string dates, Date objects, and Firestore Timestamps
- [x] Sort yearly data by year to ensure correct order
- [x] Validate date parsing with fallback to 2022-01-01
- [x] Remove debug console logs
- [x] Verify all 5 years (2022-2026) generate correctly
- [x] Fix year label ordering on graph


## Phase 63: Fix Firestore Data Merging for Backward Compatibility
- [x] Add detailed logging to trace data flow
- [x] Identify where userAccountStartDate was missing from Firestore data
- [x] Implement data merging in loadAppData to ensure all fields present
- [x] Ensure backward compatibility with existing Firestore documents
- [x] Guarantee userAccountStartDate always defaults to 2022-01-01
- [x] Remove debug logging
- [x] Verify graph displays all 5 years correctly


## Phase 64: Rule-Based Nudge Engine & Age-Specific Insights
- [ ] Add birthDate and userProfile fields to AppData
- [ ] Create life-stage.ts with classification functions
- [ ] Create nudge-engine.ts with 30+ nudge rules
- [ ] Create investment-recommendations.ts with allocation targets
- [ ] Create NudgeCard component for displaying nudges
- [ ] Create LifeStageCard component for profile
- [ ] Create NudgesSection component for dashboard
- [ ] Integrate nudges into dashboard home screen
- [ ] Add life stage section to profile screen
- [ ] Add investment recommendations to dashboard
- [ ] Create age/birth date input form
- [ ] Test nudge triggering across all life stages
- [ ] Test investment recommendations by life stage

- [x] Add birthDate and userProfile fields to AppData
- [x] Create life-stage.ts with classification functions
- [x] Create nudge-engine.ts with 30+ nudge rules
- [x] Create investment-recommendations.ts with allocation targets
- [x] Create NudgeCard component for displaying nudges
- [x] Create LifeStageCard component for profile
- [x] Integrate life stage card into profile screen
- [x] Add birth date input form to profile
- [x] Display recommended goals and focus areas
- [ ] Create NudgesSection component for dashboard
- [ ] Integrate nudges into dashboard home screen
- [ ] Add investment recommendations to dashboard
- [ ] Test nudge triggering across all life stages
- [ ] Test investment recommendations by life stage
