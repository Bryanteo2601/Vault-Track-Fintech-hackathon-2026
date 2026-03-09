/**
 * Subscription and Feature Gating Types
 * Defines all subscription tiers, features, and pricing
 */

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number; // in SGD
  annualPrice: number; // in SGD
  features: Feature[];
  color: string; // for UI badges
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  requiredTier: SubscriptionTier;
  requiresSingpass?: boolean; // For CPF features
}

export type FeatureCategory =
  | 'dashboard'
  | 'banking'
  | 'investments'
  | 'loans'
  | 'insurance'
  | 'cpf'
  | 'analysis'
  | 'ai'
  | 'planning';

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  startDate: string; // ISO date
  renewalDate: string; // ISO date
  status: 'active' | 'cancelled' | 'expired';
  paymentMethodId?: string;
  singpassVerified: boolean;
  singpassVerifiedDate?: string;
}

export interface SubscriptionUsage {
  userId: string;
  tier: SubscriptionTier;
  aiChatsUsed: number;
  aiChatsLimit: number; // -1 for unlimited
  stressTestsUsed: number;
  stressTestsLimit: number; // -1 for unlimited
  lastResetDate: string;
}

/**
 * Feature Definitions
 * Maps feature IDs to their requirements and descriptions
 */
export const FEATURES: Record<string, Feature> = {
  // Dashboard Features
  'dashboard.net-worth': {
    id: 'dashboard.net-worth',
    name: 'Net Worth Dashboard',
    description: 'View your total net worth and asset overview',
    category: 'dashboard',
    requiredTier: 'free',
  },
  'dashboard.financial-health': {
    id: 'dashboard.financial-health',
    name: 'Financial Health Score Breakdown',
    description: 'Detailed breakdown of diversification, liquidity, and debt ratios',
    category: 'dashboard',
    requiredTier: 'pro',
  },
  'dashboard.timeline': {
    id: 'dashboard.timeline',
    name: 'Net Worth Timeline',
    description: 'Historical net worth tracking and trends',
    category: 'dashboard',
    requiredTier: 'pro',
  },

  // Banking Features
  'banking.accounts': {
    id: 'banking.accounts',
    name: 'Bank Account Tracking',
    description: 'Track multiple bank accounts and balances',
    category: 'banking',
    requiredTier: 'free',
  },
  'banking.credit-score': {
    id: 'banking.credit-score',
    name: 'Credit Score Display',
    description: 'View your CBS credit score and grade',
    category: 'banking',
    requiredTier: 'free',
  },

  // Investment Features
  'investments.manual-entry': {
    id: 'investments.manual-entry',
    name: 'Manual Asset Entry',
    description: 'Manually add stocks, ETFs, crypto, and other investments',
    category: 'investments',
    requiredTier: 'free',
  },
  'investments.portfolio-overview': {
    id: 'investments.portfolio-overview',
    name: 'Basic Portfolio Overview',
    description: 'View asset allocation and holdings',
    category: 'investments',
    requiredTier: 'free',
  },
  'investments.diversification-analysis': {
    id: 'investments.diversification-analysis',
    name: 'Diversification Analysis',
    description: 'Analyze portfolio concentration and diversification risks',
    category: 'analysis',
    requiredTier: 'pro',
  },
  'investments.stress-testing': {
    id: 'investments.stress-testing',
    name: 'Portfolio Stress Testing',
    description: 'Simulate market crashes and stress scenarios',
    category: 'analysis',
    requiredTier: 'premium',
  },

  // Loan Features
  'loans.tracking': {
    id: 'loans.tracking',
    name: 'Loan Tracking',
    description: 'Track outstanding loans and instalments',
    category: 'loans',
    requiredTier: 'free',
  },
  'loans.debt-analysis': {
    id: 'loans.debt-analysis',
    name: 'Debt Risk Analysis',
    description: 'Analyze debt-to-asset ratios and payment capacity',
    category: 'analysis',
    requiredTier: 'pro',
  },

  // Insurance Features
  'insurance.tracking': {
    id: 'insurance.tracking',
    name: 'Insurance Tracking',
    description: 'Track insurance policies and coverage',
    category: 'insurance',
    requiredTier: 'free',
  },
  'insurance.coverage-analysis': {
    id: 'insurance.coverage-analysis',
    name: 'Insurance Coverage Analysis',
    description: 'Analyze insurance gaps and coverage adequacy',
    category: 'analysis',
    requiredTier: 'pro',
  },

  // CPF Features
  'cpf.basic-overview': {
    id: 'cpf.basic-overview',
    name: 'Basic CPF Overview',
    description: 'View CPF account balances (requires Singpass)',
    category: 'cpf',
    requiredTier: 'free',
    requiresSingpass: true,
  },
  'cpf.retirement-projections': {
    id: 'cpf.retirement-projections',
    name: 'CPF Retirement Projections',
    description: 'Project CPF payouts and retirement readiness',
    category: 'cpf',
    requiredTier: 'pro',
    requiresSingpass: true,
  },
  'cpf.milestones': {
    id: 'cpf.milestones',
    name: 'CPF Milestone Timeline',
    description: 'Track FRS, BRS, and ERS milestones',
    category: 'cpf',
    requiredTier: 'pro',
    requiresSingpass: true,
  },
  'cpf.retirement-simulation': {
    id: 'cpf.retirement-simulation',
    name: 'Retirement Simulations',
    description: 'Simulate different retirement scenarios',
    category: 'planning',
    requiredTier: 'premium',
    requiresSingpass: true,
  },

  // AI Features
  'ai.insights': {
    id: 'ai.insights',
    name: 'AI Financial Insights',
    description: 'AI-powered portfolio analysis and recommendations',
    category: 'ai',
    requiredTier: 'pro',
  },
  'ai.wealth-coach': {
    id: 'ai.wealth-coach',
    name: 'AI Wealth Coach',
    description: 'Chat with AI wealth coach for personalized advice',
    category: 'ai',
    requiredTier: 'premium',
  },
  'ai.strategy': {
    id: 'ai.strategy',
    name: 'AI Financial Strategy',
    description: 'AI-generated financial strategy recommendations',
    category: 'ai',
    requiredTier: 'premium',
  },

  // Planning Features
  'planning.goal-planner': {
    id: 'planning.goal-planner',
    name: 'Financial Goal Planner',
    description: 'Set and track financial goals',
    category: 'planning',
    requiredTier: 'pro',
  },
  'planning.global-retirement': {
    id: 'planning.global-retirement',
    name: 'Global Retirement Planner',
    description: 'Plan retirement for non-CPF users (expats)',
    category: 'planning',
    requiredTier: 'premium',
  },
  'planning.inflation-modeling': {
    id: 'planning.inflation-modeling',
    name: 'Inflation Impact Modeling',
    description: 'Model inflation impact on retirement plans',
    category: 'planning',
    requiredTier: 'premium',
  },
  'planning.recession-scenarios': {
    id: 'planning.recession-scenarios',
    name: 'Recession Scenario Simulations',
    description: 'Simulate recession impact on portfolio',
    category: 'planning',
    requiredTier: 'premium',
  },
};

/**
 * Subscription Plans Configuration
 * Defines pricing and tier details
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Free',
    description: 'Essential wealth tracking',
    monthlyPrice: 0,
    annualPrice: 0,
    color: '#687076', // muted
    features: Object.values(FEATURES).filter(f => f.requiredTier === 'free'),
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    description: 'Advanced analytics and insights',
    monthlyPrice: 30,
    annualPrice: 300,
    color: '#0a7ea4', // primary
    features: Object.values(FEATURES).filter(f => f.requiredTier === 'free' || f.requiredTier === 'pro'),
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    description: 'AI-powered wealth management',
    monthlyPrice: 50,
    annualPrice: 400,
    color: '#22C55E', // success
    features: Object.values(FEATURES),
  },
};

/**
 * AI Usage Limits per Tier
 * Defines how many AI operations users can perform
 */
export const AI_USAGE_LIMITS: Record<SubscriptionTier, { chats: number; stressTests: number }> = {
  free: {
    chats: 0, // No AI access
    stressTests: 0,
  },
  pro: {
    chats: 50, // 50 chats per month
    stressTests: 5, // 5 stress tests per month
  },
  premium: {
    chats: -1, // Unlimited
    stressTests: -1, // Unlimited
  },
};

/**
 * Feature Tier Hierarchy
 * Returns true if a tier has access to a feature
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  featureId: string,
  singpassVerified: boolean = false
): boolean {
  const feature = FEATURES[featureId];
  if (!feature) return false;

  // Check if feature requires Singpass
  if (feature.requiresSingpass && !singpassVerified) {
    return false;
  }

  // Check tier hierarchy: free < pro < premium
  const tierHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };

  const requiredHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };

  return tierHierarchy[userTier] >= requiredHierarchy[feature.requiredTier];
}

/**
 * Get features available for a tier
 */
export function getFeaturesForTier(tier: SubscriptionTier): Feature[] {
  return SUBSCRIPTION_PLANS[tier].features;
}

/**
 * Get locked features for a tier
 */
export function getLockedFeaturesForTier(tier: SubscriptionTier): Feature[] {
  const allFeatures = Object.values(FEATURES);
  const availableFeatures = getFeaturesForTier(tier);
  return allFeatures.filter(f => !availableFeatures.includes(f));
}

/**
 * Get upgrade path from current tier
 */
export function getUpgradePath(currentTier: SubscriptionTier): SubscriptionTier | null {
  const upgrades: Record<SubscriptionTier, SubscriptionTier | null> = {
    free: 'pro',
    pro: 'premium',
    premium: null,
  };
  return upgrades[currentTier];
}
