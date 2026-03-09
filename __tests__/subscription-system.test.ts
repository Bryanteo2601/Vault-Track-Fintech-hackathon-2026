/**
 * Subscription System Tests
 * Tests feature gating, subscription logic, and tier management
 */

import { describe, it, expect } from 'vitest';
import {
  hasFeatureAccess,
  getFeaturesForTier,
  getLockedFeaturesForTier,
  getUpgradePath,
  FEATURES,
  SUBSCRIPTION_PLANS,
  AI_USAGE_LIMITS,
} from '../lib/subscription-types';

describe('Subscription Types', () => {
  describe('Feature Access', () => {
    it('should grant free tier access to free features', () => {
      expect(hasFeatureAccess('free', 'dashboard.net-worth')).toBe(true);
      expect(hasFeatureAccess('free', 'banking.accounts')).toBe(true);
      expect(hasFeatureAccess('free', 'investments.manual-entry')).toBe(true);
    });

    it('should deny free tier access to pro features', () => {
      expect(hasFeatureAccess('free', 'dashboard.financial-health')).toBe(false);
      expect(hasFeatureAccess('free', 'investments.diversification-analysis')).toBe(false);
      expect(hasFeatureAccess('free', 'ai.insights')).toBe(false);
    });

    it('should deny free tier access to premium features', () => {
      expect(hasFeatureAccess('free', 'investments.stress-testing')).toBe(false);
      expect(hasFeatureAccess('free', 'ai.wealth-coach')).toBe(false);
      expect(hasFeatureAccess('free', 'planning.global-retirement')).toBe(false);
    });

    it('should grant pro tier access to free and pro features', () => {
      expect(hasFeatureAccess('pro', 'dashboard.net-worth')).toBe(true);
      expect(hasFeatureAccess('pro', 'dashboard.financial-health')).toBe(true);
      expect(hasFeatureAccess('pro', 'ai.insights')).toBe(true);
    });

    it('should deny pro tier access to premium features', () => {
      expect(hasFeatureAccess('pro', 'investments.stress-testing')).toBe(false);
      expect(hasFeatureAccess('pro', 'ai.wealth-coach')).toBe(false);
    });

    it('should grant premium tier access to all features', () => {
      expect(hasFeatureAccess('premium', 'dashboard.net-worth')).toBe(true);
      expect(hasFeatureAccess('premium', 'dashboard.financial-health')).toBe(true);
      expect(hasFeatureAccess('premium', 'investments.stress-testing')).toBe(true);
      expect(hasFeatureAccess('premium', 'ai.wealth-coach')).toBe(true);
      expect(hasFeatureAccess('premium', 'planning.global-retirement')).toBe(true);
    });

    it('should deny access to CPF features without Singpass verification', () => {
      expect(hasFeatureAccess('pro', 'cpf.basic-overview', false)).toBe(false);
      expect(hasFeatureAccess('pro', 'cpf.retirement-projections', false)).toBe(false);
      expect(hasFeatureAccess('premium', 'cpf.retirement-simulation', false)).toBe(false);
    });

    it('should grant access to CPF features with Singpass verification', () => {
      expect(hasFeatureAccess('free', 'cpf.basic-overview', true)).toBe(true);
      expect(hasFeatureAccess('pro', 'cpf.retirement-projections', true)).toBe(true);
      expect(hasFeatureAccess('premium', 'cpf.retirement-simulation', true)).toBe(true);
    });
  });

  describe('Feature Lists', () => {
    it('should return correct features for each tier', () => {
      const freeFeatures = getFeaturesForTier('free');
      const proFeatures = getFeaturesForTier('pro');
      const premiumFeatures = getFeaturesForTier('premium');

      expect(freeFeatures.length).toBeGreaterThan(0);
      expect(proFeatures.length).toBeGreaterThan(freeFeatures.length);
      expect(premiumFeatures.length).toBeGreaterThan(proFeatures.length);
    });

    it('should return locked features for each tier', () => {
      const freeLockedFeatures = getLockedFeaturesForTier('free');
      const proLockedFeatures = getLockedFeaturesForTier('pro');
      const premiumLockedFeatures = getLockedFeaturesForTier('premium');

      expect(freeLockedFeatures.length).toBeGreaterThan(0);
      expect(proLockedFeatures.length).toBeGreaterThan(0);
      expect(premiumLockedFeatures.length).toBe(0); // Premium has no locked features
    });

    it('should have no overlap between available and locked features', () => {
      const availableFeatures = getFeaturesForTier('pro');
      const lockedFeatures = getLockedFeaturesForTier('pro');

      const availableIds = new Set(availableFeatures.map(f => f.id));
      const lockedIds = new Set(lockedFeatures.map(f => f.id));

      const overlap = [...availableIds].filter(id => lockedIds.has(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('Upgrade Paths', () => {
    it('should return correct upgrade paths', () => {
      expect(getUpgradePath('free')).toBe('pro');
      expect(getUpgradePath('pro')).toBe('premium');
      expect(getUpgradePath('premium')).toBeNull();
    });
  });

  describe('Pricing', () => {
    it('should have correct pricing for each tier', () => {
      expect(SUBSCRIPTION_PLANS.free.monthlyPrice).toBe(0);
      expect(SUBSCRIPTION_PLANS.free.annualPrice).toBe(0);

      expect(SUBSCRIPTION_PLANS.pro.monthlyPrice).toBe(30);
      expect(SUBSCRIPTION_PLANS.pro.annualPrice).toBe(300);

      expect(SUBSCRIPTION_PLANS.premium.monthlyPrice).toBe(50);
      expect(SUBSCRIPTION_PLANS.premium.annualPrice).toBe(400);
    });

    it('should have annual discount for pro tier', () => {
      const monthlyTotal = SUBSCRIPTION_PLANS.pro.monthlyPrice * 12;
      const annualPrice = SUBSCRIPTION_PLANS.pro.annualPrice;
      expect(annualPrice).toBeLessThan(monthlyTotal);
    });

    it('should have annual discount for premium tier', () => {
      const monthlyTotal = SUBSCRIPTION_PLANS.premium.monthlyPrice * 12;
      const annualPrice = SUBSCRIPTION_PLANS.premium.annualPrice;
      expect(annualPrice).toBeLessThan(monthlyTotal);
    });
  });

  describe('AI Usage Limits', () => {
    it('should have correct AI limits for each tier', () => {
      expect(AI_USAGE_LIMITS.free.chats).toBe(0);
      expect(AI_USAGE_LIMITS.free.stressTests).toBe(0);

      expect(AI_USAGE_LIMITS.pro.chats).toBe(50);
      expect(AI_USAGE_LIMITS.pro.stressTests).toBe(5);

      expect(AI_USAGE_LIMITS.premium.chats).toBe(-1); // Unlimited
      expect(AI_USAGE_LIMITS.premium.stressTests).toBe(-1); // Unlimited
    });

    it('should have unlimited limits for premium tier', () => {
      expect(AI_USAGE_LIMITS.premium.chats).toBe(-1);
      expect(AI_USAGE_LIMITS.premium.stressTests).toBe(-1);
    });
  });

  describe('Feature Categories', () => {
    it('should have features in all categories', () => {
      const categories = new Set<string>();
      Object.values(FEATURES).forEach(feature => {
        categories.add(feature.category);
      });

      expect(categories.size).toBeGreaterThan(0);
      expect(categories.has('dashboard')).toBe(true);
      expect(categories.has('banking')).toBe(true);
      expect(categories.has('investments')).toBe(true);
      expect(categories.has('ai')).toBe(true);
    });

    it('should have consistent feature definitions', () => {
      Object.entries(FEATURES).forEach(([id, feature]) => {
        expect(feature.id).toBe(id);
        expect(feature.name).toBeTruthy();
        expect(feature.description).toBeTruthy();
        expect(['free', 'pro', 'premium']).toContain(feature.requiredTier);
      });
    });
  });

  describe('Subscription Plans', () => {
    it('should have all three tiers defined', () => {
      expect(SUBSCRIPTION_PLANS.free).toBeDefined();
      expect(SUBSCRIPTION_PLANS.pro).toBeDefined();
      expect(SUBSCRIPTION_PLANS.premium).toBeDefined();
    });

    it('should have features for each tier', () => {
      expect(SUBSCRIPTION_PLANS.free.features.length).toBeGreaterThan(0);
      expect(SUBSCRIPTION_PLANS.pro.features.length).toBeGreaterThan(0);
      expect(SUBSCRIPTION_PLANS.premium.features.length).toBeGreaterThan(0);
    });

    it('should have unique colors for each tier', () => {
      const colors = new Set([
        SUBSCRIPTION_PLANS.free.color,
        SUBSCRIPTION_PLANS.pro.color,
        SUBSCRIPTION_PLANS.premium.color,
      ]);
      expect(colors.size).toBe(3);
    });
  });

  describe('Feature Tier Hierarchy', () => {
    it('should enforce tier hierarchy correctly', () => {
      // Free features should be accessible to all tiers (excluding Singpass-required)
      const freeFeatures = getFeaturesForTier('free');
      freeFeatures.forEach(feature => {
        if (feature.requiresSingpass) return;
        expect(hasFeatureAccess('free', feature.id)).toBe(true);
        expect(hasFeatureAccess('pro', feature.id)).toBe(true);
        expect(hasFeatureAccess('premium', feature.id)).toBe(true);
      });

      // Pro features should only be accessible to pro and premium (excluding Singpass-required)
      const proOnlyFeatures = getFeaturesForTier('pro').filter(
        f => f.requiredTier === 'pro'
      );
      proOnlyFeatures.forEach(feature => {
        if (feature.requiresSingpass) return;
        expect(hasFeatureAccess('free', feature.id)).toBe(false);
        expect(hasFeatureAccess('pro', feature.id)).toBe(true);
        expect(hasFeatureAccess('premium', feature.id)).toBe(true);
      });

      // Premium features should only be accessible to premium (excluding Singpass-required)
      const premiumOnlyFeatures = getFeaturesForTier('premium').filter(
        f => f.requiredTier === 'premium'
      );
      premiumOnlyFeatures.forEach(feature => {
        if (feature.requiresSingpass) return;
        expect(hasFeatureAccess('free', feature.id)).toBe(false);
        expect(hasFeatureAccess('pro', feature.id)).toBe(false);
        expect(hasFeatureAccess('premium', feature.id)).toBe(true);
      });
    });
  });
});
