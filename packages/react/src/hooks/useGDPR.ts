import { useState, useCallback } from 'react';
import { Privata } from '@privata/core';

export interface UseGDPROptions {
  userId: string;
  onError?: (error: Error) => void;
}

export interface UseGDPRReturn {
  loading: boolean;
  error: Error | null;
  
  // Article 15 - Right to Access
  requestDataAccess: (options?: any) => Promise<any>;
  
  // Article 16 - Right to Rectification
  rectifyPersonalData: (corrections: any) => Promise<any>;
  
  // Article 17 - Right to Erasure
  erasePersonalData: (reason: string, evidence: string) => Promise<any>;
  
  // Article 18 - Right to Restriction
  restrictProcessing: (restrictions: any) => Promise<any>;
  
  // Article 20 - Right to Data Portability
  requestDataPortability: (format: string) => Promise<any>;
  
  // Article 21 - Right to Object
  objectToProcessing: (objections: any) => Promise<any>;
  
  // Article 22 - Right to Automated Decision Review
  requestAutomatedDecisionReview: (reason: string) => Promise<any>;
}

export const useGDPR = (
  privata: Privata,
  options: UseGDPROptions
): UseGDPRReturn => {
  const { userId, onError } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: Error) => {
    setError(err);
    if (onError) {
      onError(err);
    }
  }, [onError]);

  const requestDataAccess = useCallback(async (accessOptions: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.requestDataAccess(userId, accessOptions);
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const rectifyPersonalData = useCallback(async (corrections: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.rectifyPersonalData({
        dataSubjectId: userId,
        corrections,
        reason: 'User requested data correction',
        evidence: 'User request via GDPR hook',
      });
      
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const erasePersonalData = useCallback(async (reason: string, evidence: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.erasePersonalData({
        dataSubjectId: userId,
        reason,
        evidence,
      });
      
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const restrictProcessing = useCallback(async (restrictions: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.restrictProcessing({
        dataSubjectId: userId,
        restrictions,
        reason: 'User requested processing restriction',
        evidence: 'User request via GDPR hook',
      });
      
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const requestDataPortability = useCallback(async (format: string) => {
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
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.objectToProcessing({
        dataSubjectId: userId,
        objections,
        reason: 'User objected to processing',
        evidence: 'User request via GDPR hook',
      });
      
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const requestAutomatedDecisionReview = useCallback(async (reason: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await privata.requestAutomatedDecisionReview({
        dataSubjectId: userId,
        reason,
        evidence: 'User request via GDPR hook',
      });
      
      return result;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  return {
    loading,
    error,
    requestDataAccess,
    rectifyPersonalData,
    erasePersonalData,
    restrictProcessing,
    requestDataPortability,
    objectToProcessing,
    requestAutomatedDecisionReview,
  };
};

