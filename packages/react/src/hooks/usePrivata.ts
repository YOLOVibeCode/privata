import { useState, useEffect, useCallback } from 'react';
import { Privata } from '@privata/core';

export interface UsePrivataOptions {
  userId?: string;
  autoLoad?: boolean;
  onError?: (error: Error) => void;
}

export interface UsePrivataReturn {
  privata: Privata | null;
  loading: boolean;
  error: Error | null;
  userData: any;
  refreshData: () => Promise<void>;
  requestDataAccess: (options?: any) => Promise<any>;
  rectifyPersonalData: (corrections: any) => Promise<any>;
  erasePersonalData: (reason: string, evidence: string) => Promise<any>;
  restrictProcessing: (restrictions: any) => Promise<any>;
  requestDataPortability: (format: string) => Promise<any>;
  objectToProcessing: (objections: any) => Promise<any>;
  requestAutomatedDecisionReview: (reason: string) => Promise<any>;
}

export const usePrivata = (
  privataInstance: Privata,
  options: UsePrivataOptions = {}
): UsePrivataReturn => {
  const { userId, autoLoad = true, onError } = options;
  
  const [privata] = useState<Privata>(privataInstance);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const handleError = useCallback((err: Error) => {
    setError(err);
    if (onError) {
      onError(err);
    }
  }, [onError]);

  const refreshData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await privata.requestDataAccess(userId, {});
      setUserData(data);
    } catch (err) {
      handleError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const requestDataAccess = useCallback(async (options: any = {}) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await privata.requestDataAccess(userId, options);
      setUserData(data);
      return data;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const rectifyPersonalData = useCallback(async (corrections: any) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.rectifyPersonalData({
        dataSubjectId: userId,
        corrections,
        reason: 'User requested data correction',
        evidence: 'User request via React hook',
      });
      
      await refreshData();
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError, refreshData]);

  const erasePersonalData = useCallback(async (reason: string, evidence: string) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.erasePersonalData({
        dataSubjectId: userId,
        reason,
        evidence,
      });
      
      setUserData(null);
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const restrictProcessing = useCallback(async (restrictions: any) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.restrictProcessing({
        dataSubjectId: userId,
        restrictions,
        reason: 'User requested processing restriction',
        evidence: 'User request via React hook',
      });
      
      await refreshData();
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError, refreshData]);

  const requestDataPortability = useCallback(async (format: string) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.requestDataPortability({
        dataSubjectId: userId,
        format,
        deliveryMethod: 'download',
      });
      
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const objectToProcessing = useCallback(async (objections: any) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.objectToProcessing({
        dataSubjectId: userId,
        objections,
        reason: 'User objected to processing',
        evidence: 'User request via React hook',
      });
      
      await refreshData();
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError, refreshData]);

  const requestAutomatedDecisionReview = useCallback(async (reason: string) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.requestAutomatedDecisionReview({
        dataSubjectId: userId,
        reason,
        evidence: 'User request via React hook',
      });
      
      await refreshData();
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError, refreshData]);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad && userId) {
      refreshData();
    }
  }, [autoLoad, userId, refreshData]);

  return {
    privata,
    loading,
    error,
    userData,
    refreshData,
    requestDataAccess,
    rectifyPersonalData,
    erasePersonalData,
    restrictProcessing,
    requestDataPortability,
    objectToProcessing,
    requestAutomatedDecisionReview,
  };
};

