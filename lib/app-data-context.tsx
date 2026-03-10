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

  // Load data on auth state change
  const loadUserData = useCallback(async (authenticated: boolean) => {
    setIsLoading(true);
    try {
      if (authenticated) {
        console.log('User authenticated, loading data from Firestore');
        const loaded = await loadAppData();
        setData(loaded);
      } else {
        console.log('User not authenticated, using default data');
        setData(defaultAppData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to default data on error
      setData(defaultAppData);
    }
    setIsLoading(false);
  }, []);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed, user:', user ? user.uid : 'none');
      const authenticated = !!user;
      setIsAuthenticated(authenticated);
      loadUserData(authenticated);
    });
    return unsubscribe;
  }, [loadUserData]);

  // Persist data to Firestore/AsyncStorage
  const persist = useCallback(async (newData: AppData) => {
    console.log('Persisting data, bank accounts count:', newData.bankAccounts.length);
    setData(newData);
    try {
      await saveAppData(newData);
      console.log('Data persisted successfully');
    } catch (error) {
      console.error('Error persisting data:', error);
      throw error;
    }
  }, []);

  // Bank accounts
  const addBankAccount = useCallback(async (account: Omit<BankAccount, 'id' | 'createdAt'>) => {
    console.log('Adding bank account:', account.bankName);
    const newAccount: BankAccount = { 
      ...account, 
      id: generateId(), 
      createdAt: new Date().toISOString().split('T')[0] 
    };
    const newData = { ...data, bankAccounts: [...data.bankAccounts, newAccount] };
    await persist(newData);
  }, [data, persist]);

  const updateBankAccount = useCallback(async (id: string, updates: Partial<BankAccount>) => {
    console.log('Updating bank account with id:', id);
    const updated = data.bankAccounts.map(a => a.id === id ? { ...a, ...updates } : a);
    const newData = { ...data, bankAccounts: updated };
    await persist(newData);
  }, [data, persist]);

  const deleteBankAccount = useCallback(async (id: string) => {
    console.log('Deleting bank account with id:', id);
    console.log('Current accounts before delete:', data.bankAccounts.length);
    const filtered = data.bankAccounts.filter(a => a.id !== id);
    console.log('Accounts after delete:', filtered.length);
    const newData = { ...data, bankAccounts: filtered };
    await persist(newData);
  }, [data, persist]);

  // Loans
  const addLoan = useCallback(async (loan: Omit<Loan, 'id'>) => {
    const newLoan: Loan = { ...loan, id: generateId() };
    const newData = { ...data, loans: [...data.loans, newLoan] };
    await persist(newData);
  }, [data, persist]);

  const updateLoan = useCallback(async (id: string, updates: Partial<Loan>) => {
    const updated = data.loans.map(l => l.id === id ? { ...l, ...updates } : l);
    const newData = { ...data, loans: updated };
    await persist(newData);
  }, [data, persist]);

  const deleteLoan = useCallback(async (id: string) => {
    const filtered = data.loans.filter(l => l.id !== id);
    const newData = { ...data, loans: filtered };
    await persist(newData);
  }, [data, persist]);

  // Holdings
  const addHolding = useCallback(async (holding: Omit<Holding, 'id'>) => {
    const newHolding: Holding = { ...holding, id: generateId() };
    const newData = { ...data, holdings: [...data.holdings, newHolding] };
    await persist(newData);
  }, [data, persist]);

  const updateHolding = useCallback(async (id: string, updates: Partial<Holding>) => {
    const updated = data.holdings.map(h => h.id === id ? { ...h, ...updates } : h);
    const newData = { ...data, holdings: updated };
    await persist(newData);
  }, [data, persist]);

  const deleteHolding = useCallback(async (id: string) => {
    const filtered = data.holdings.filter(h => h.id !== id);
    const newData = { ...data, holdings: filtered };
    await persist(newData);
  }, [data, persist]);

  // Insurance
  const addInsurancePolicy = useCallback(async (policy: Omit<InsurancePolicy, 'id'>) => {
    const newPolicy: InsurancePolicy = { ...policy, id: generateId() };
    const newData = { ...data, insurancePolicies: [...data.insurancePolicies, newPolicy] };
    await persist(newData);
  }, [data, persist]);

  const updateInsurancePolicy = useCallback(async (id: string, updates: Partial<InsurancePolicy>) => {
    const updated = data.insurancePolicies.map(p => p.id === id ? { ...p, ...updates } : p);
    const newData = { ...data, insurancePolicies: updated };
    await persist(newData);
  }, [data, persist]);

  const deleteInsurancePolicy = useCallback(async (id: string) => {
    const filtered = data.insurancePolicies.filter(p => p.id !== id);
    const newData = { ...data, insurancePolicies: filtered };
    await persist(newData);
  }, [data, persist]);

  // Credit score
  const updateCreditScore = useCallback(async (score: Partial<CreditScoreData>) => {
    const newData = { ...data, creditScore: { ...data.creditScore, ...score } };
    await persist(newData);
  }, [data, persist]);

  // Private Assets
  const addPrivateAsset = useCallback(async (asset: Omit<PrivateAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newAsset: PrivateAsset = { ...asset, id: generateId(), createdAt: now, updatedAt: now };
    const newData = { ...data, privateAssets: [...data.privateAssets, newAsset] };
    await persist(newData);
  }, [data, persist]);

  const updatePrivateAsset = useCallback(async (id: string, updates: Partial<PrivateAsset>) => {
    const now = new Date().toISOString().split('T')[0];
    const updated = data.privateAssets.map(a => a.id === id ? { ...a, ...updates, updatedAt: now } : a);
    const newData = { ...data, privateAssets: updated };
    await persist(newData);
  }, [data, persist]);

  const deletePrivateAsset = useCallback(async (id: string) => {
    const filtered = data.privateAssets.filter(a => a.id !== id);
    const newData = { ...data, privateAssets: filtered };
    await persist(newData);
  }, [data, persist]);

  // User Profile
  const updateUserProfile = useCallback(async (updates: Partial<AppData['userProfile']>) => {
    const newData = { ...data, userProfile: { ...data.userProfile, ...updates } };
    await persist(newData);
  }, [data, persist]);

  const refreshData = useCallback(async () => {
    await loadUserData(isAuthenticated);
  }, [isAuthenticated, loadUserData]);

  const resetData = useCallback(async () => {
    await resetAppData();
    setData(defaultAppData);
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
