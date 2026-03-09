# Wealth Wellness Hub — Interface Design Plan

## Brand Identity
- **App Name:** Wealth Wellness Hub
- **Tagline:** Your complete financial health, in one place.
- **Color Palette:**
  - Primary: `#1A3C5E` (deep navy — trust, stability)
  - Accent: `#00C896` (emerald green — growth, health)
  - Warning: `#F59E0B` (amber)
  - Error: `#EF4444` (red)
  - Background (light): `#F0F4F8` (soft blue-grey)
  - Surface (light): `#FFFFFF`
  - Background (dark): `#0D1B2A`
  - Surface (dark): `#1A2B3C`
  - Text: `#11181C` / `#ECEDEE`

---

## Screen List

### Tab Bar (5 tabs)
1. **Dashboard** (Home) — `/`
2. **Banks** — `/banks`
3. **Investments** — `/investments`
4. **Loans** — `/loans`
5. **Insurance** — `/insurance`

### Sub-Screens
- `/banks/[id]` — Bank account detail
- `/banks/add` — Add bank account
- `/investments/[assetClass]` — Asset class detail with holdings
- `/investments/add` — Add investment holding
- `/loans/[id]` — Loan detail with amortization
- `/loans/add` — Add loan
- `/insurance/[id]` — Insurance policy detail
- `/insurance/add` — Add insurance policy

---

## Screen Designs

### 1. Dashboard (Home)
**Content:**
- Header: greeting + date
- **Wealth Wellness Score** — circular gauge (0–100), color-coded
- **Total Net Worth** — large number, trend arrow
- **Asset Allocation Summary** — mini horizontal bar chart (Banks / Investments / Insurance / Other)
- **Financial Health Cards** (horizontal scroll):
  - Diversification Index
  - Liquidity Ratio
  - Debt-to-Asset Ratio
  - Credit Score
- **Recent Activity** — last 5 transactions/changes
- **AI Recommendations** — 2–3 action cards

**Layout:** ScrollView, cards with shadow, navy header with emerald accent

---

### 2. Banks
**Content:**
- **Total Bank Balance** — summary at top
- **Account Cards** (FlatList) — bank name, account type (savings/daily/credit), balance, interest rate
- **Credit Score Section** — CBS-style gauge with score breakdown:
  - Payment History (35%)
  - Amounts Owed (30%)
  - Length of Credit (15%)
  - Credit Mix (10%)
  - New Credit (10%)
- **Loan Capacity** — estimated max loan amount
- **Monthly Interest Earned** — from savings accounts

**Sub-screen (Account Detail):**
- Account type badge
- Balance, interest rate
- Linked loans with monthly instalment, months remaining, total due, total paid
- Transaction history (mock)

---

### 3. Investments
**Content:**
- **Total Portfolio Value** — with % gain/loss
- **Pie Chart** — breakdown by asset class (Stocks, Crypto, ETFs, Bonds, Futures, Options)
- **Asset Class Cards** (expandable) — each shows holdings list
- **Holdings** — ticker, quantity, avg cost, current value, P&L
- **AI Suggestions Panel** — 3 personalized recommendations based on portfolio composition

**Sub-screen (Asset Class Detail):**
- Holdings FlatList
- Add/Edit/Delete holding
- Mini chart for that class

---

### 4. Loans
**Content:**
- **Total Outstanding** — secured + unsecured
- **Aggregated Outstanding Balances Table** — matches CBS format (Month, Product, Bank, Secured, Unsecured Interest-Bearing, Unsecured Non-Interest-Bearing, Exempted)
- **5-Month Historical Trend** — line chart
- **Loan Cards** (FlatList) — bank, type, balance, monthly instalment, months left, interest rate, total interest payable

**Sub-screen (Loan Detail):**
- Full amortization summary
- Interest breakdown
- Progress bar (paid vs remaining)

---

### 5. Insurance
**Content:**
- **Policy Summary** — total coverage, annual premium
- **Policy Cards** (FlatList) — insurer, policy type, coverage amount, premium, expiry
- **PDF Import** — attach policy documents
- **Policy Detail** — full terms, beneficiaries, exclusions

---

## Key User Flows

### Add Bank Account
Tap Banks tab → Tap "+" → Fill form (bank name, account type, balance, interest rate) → Save → Appears in list

### Add Investment Holding
Tap Investments → Tap asset class → Tap "+" → Fill (ticker, quantity, avg cost) → Save → Pie chart updates

### View Credit Score
Tap Banks → Scroll to Credit Score section → See CBS-style breakdown with score and loan capacity

### Track Loan Progress
Tap Loans → Tap loan card → See instalment, months left, total paid/due, interest breakdown

### Import Insurance PDF
Tap Insurance → Tap policy → Tap "Import PDF" → Document picker → PDF stored and viewable

### View AI Suggestions
Dashboard → AI Recommendations cards, or Investments → AI Suggestions panel

---

## Design Principles
- **One-handed usage:** All primary actions reachable from bottom half of screen
- **Card-based layout:** Each data entity is a tappable card with clear hierarchy
- **Color coding:** Green = positive/healthy, Amber = caution, Red = risk/overdue
- **Progressive disclosure:** Summary first, detail on tap
- **iOS HIG compliance:** Native-feel typography (SF Pro sizing), standard navigation patterns
