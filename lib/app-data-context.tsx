import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppData, BankAccount, Loan, Holding, InsurancePolicy, CreditScoreData, PrivateAsset } from './types';
import { loadAppData, saveAppData, resetAppData, defaultAppData } from './store';
import { auth } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

interface AppDataContextValue {
  data: AppData;
  isLoading: boolean;
  // Bank accounts
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt'>) => Promise<void>;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  // Loans
  addLoan: (loan: Omit<Loan, 'id'>) => Promise<void>;
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  // Holdings
  addHolding: (holding: Omit<Holding, 'id'>) => Promise<void>;
  updateHolding: (id: string, updates: Partial<Holding>) => Promise<void>;
  deleteHolding: (id: string) => Promise<void>;
  // Insurance
  addInsurancePolicy: (policy: Omit<InsurancePolicy, 'id'>) => Promise<void>;
  updateInsurancePolicy: (id: string, updates: Partial<InsurancePolicy>) => Promise<void>;
  deleteInsurancePolicy: (id: string) => Promise<void>;
  // Credit score
  updateCreditScore: (score: Partial<CreditScoreData>) => Promise<void>;
  // Private Assets
  addPrivateAsset: (asset: Omit<PrivateAsset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrivateAsset: (id: string, updates: Partial<PrivateAsset>) => Promise<void>;
  deletePrivateAsset: (id: string) => Promise<void>;
  // User Profile
  updateUserProfile: (updates: Partial<AppData['userProfile']>) => Promise<void>;
  // Utility
  refreshData: () => Promise<void>;
  resetData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultAppData);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const loaded = await loadAppData();
      setData(loaded);
    } catch (error) {
      console.error('Error loading data:', error);
      setData(defaultAppData);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        refreshData();
      } else {
        // User logged out - reset to default data
        setData(defaultAppData);
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, [refreshData]);

  const persist = useCallback(async (newData: AppData) => {
    setData(newData);
    await saveAppData(newData);
  }, []);

  // Bank accounts
  const addBankAccount = useCallback(async (account: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAccount: BankAccount = { ...account, id: generateId(), createdAt: new Date().toISOString().split('T')[0] };
    await persist({ ...data, bankAccounts: [...data.bankAccounts, newAccount] });
  }, [data, persist]);

  const updateBankAccount = useCallback(async (id: string, updates: Partial<BankAccount>) => {
    await persist({ ...data, bankAccounts: data.bankAccounts.map(a => a.id === id ? { ...a, ...updates } : a) });
  }, [data, persist]);

  const deleteBankAccount = useCallback(async (id: string) => {
    await persist({ ...data, bankAccounts: data.bankAccounts.filter(a => a.id !== id) });
  }, [data, persist]);

  // Loans
  const addLoan = useCallback(async (loan: Omit<Loan, 'id'>) => {
    const newLoan: Loan = { ...loan, id: generateId() };
    await persist({ ...data, loans: [...data.loans, newLoan] });
  }, [data, persist]);

  const updateLoan = useCallback(async (id: string, updates: Partial<Loan>) => {
    await persist({ ...data, loans: data.loans.map(l => l.id === id ? { ...l, ...updates } : l) });
  }, [data, persist]);

  const deleteLoan = useCallback(async (id: string) => {
    await persist({ ...data, loans: data.loans.filter(l => l.id !== id) });
  }, [data, persist]);

  // Holdings
  const addHolding = useCallback(async (holding: Omit<Holding, 'id'>) => {
    const newHolding: Holding = { ...holding, id: generateId() };
    await persist({ ...data, holdings: [...data.holdings, newHolding] });
  }, [data, persist]);

  const updateHolding = useCallback(async (id: string, updates: Partial<Holding>) => {
    await persist({ ...data, holdings: data.holdings.map(h => h.id === id ? { ...h, ...updates } : h) });
  }, [data, persist]);

  const deleteHolding = useCallback(async (id: string) => {
    await persist({ ...data, holdings: data.holdings.filter(h => h.id !== id) });
  }, [data, persist]);

  // Insurance
  const addInsurancePolicy = useCallback(async (policy: Omit<InsurancePolicy, 'id'>) => {
    const newPolicy: InsurancePolicy = { ...policy, id: generateId() };
    await persist({ ...data, insurancePolicies: [...data.insurancePolicies, newPolicy] });
  }, [data, persist]);

  const updateInsurancePolicy = useCallback(async (id: string, updates: Partial<InsurancePolicy>) => {
    await persist({ ...data, insurancePolicies: data.insurancePolicies.map(p => p.id === id ? { ...p, ...updates } : p) });
  }, [data, persist]);

  const deleteInsurancePolicy = useCallback(async (id: string) => {
    await persist({ ...data, insurancePolicies: data.insurancePolicies.filter(p => p.id !== id) });
  }, [data, persist]);

  // Credit score
  const updateCreditScore = useCallback(async (score: Partial<CreditScoreData>) => {
    await persist({ ...data, creditScore: { ...data.creditScore, ...score } });
  }, [data, persist]);

  // Private Assets
  const addPrivateAsset = useCallback(async (asset: Omit<PrivateAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newAsset: PrivateAsset = { ...asset, id: generateId(), createdAt: now, updatedAt: now };
    await persist({ ...data, privateAssets: [...data.privateAssets, newAsset] });
  }, [data, persist]);

  const updatePrivateAsset = useCallback(async (id: string, updates: Partial<PrivateAsset>) => {
    const now = new Date().toISOString().split('T')[0];
    await persist({
      ...data,
      privateAssets: data.privateAssets.map(a => a.id === id ? { ...a, ...updates, updatedAt: now } : a),
    });
  }, [data, persist]);

  const deletePrivateAsset = useCallback(async (id: string) => {
    await persist({ ...data, privateAssets: data.privateAssets.filter(a => a.id !== id) });
  }, [data, persist]);

  // User Profile
  const updateUserProfile = useCallback(async (updates: Partial<AppData['userProfile']>) => {
    await persist({ ...data, userProfile: { ...data.userProfile, ...updates } });
  }, [data, persist]);

  const resetData = useCallback(async () => {
    await resetAppData();
    const fresh = await loadAppData();
    setData(fresh);
  }, []);

  return (
    <AppDataContext.Provider value={{
      data, isLoading,
      addBankAccount, updateBankAccount, deleteBankAccount,
      addLoan, updateLoan, deleteLoan,
      addHolding, updateHolding, deleteHolding,
      addInsurancePolicy, updateInsurancePolicy, deleteInsurancePolicy,
      updateCreditScore,
      addPrivateAsset, updatePrivateAsset, deletePrivateAsset,
      updateUserProfile,
      refreshData, resetData,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
