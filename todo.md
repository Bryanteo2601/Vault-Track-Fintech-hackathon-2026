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
