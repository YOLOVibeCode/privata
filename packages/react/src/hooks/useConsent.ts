import { useState, useCallback, useEffect } from 'react';
import { Privata } from '@privata/core';

export interface UseConsentOptions {
  userId?: string;
  autoLoad?: boolean;
  onError?: (error: Error) => void;
}

export interface ConsentData {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  thirdParty: boolean;
  timestamp: Date;
  version: string;
}

export interface UseConsentReturn {
  consent: ConsentData | null;
  loading: boolean;
  error: Error | null;
  updateConsent: (newConsent: ConsentData) => Promise<void>;
  acceptAll: () => Promise<void>;
  rejectAll: () => Promise<void>;
  hasConsent: (type: keyof ConsentData) => boolean;
  isConsentValid: () => boolean;
}

export const useConsent = (
  privata: Privata,
  options: UseConsentOptions = {}
): UseConsentReturn => {
  const { userId, autoLoad = true, onError } = options;
  
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: Error) => {
    setError(err);
    if (onError) {
      onError(err);
    }
  }, [onError]);

  const loadConsent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (userId) {
        // Load consent for authenticated user
        const userData = await privata.requestDataAccess(userId, {
          includeConsent: true,
        });
        
        if (userData?.consent) {
          setConsent(userData.consent);
        }
      } else {
        // Load consent for anonymous user from localStorage
        const storedConsent = localStorage.getItem('privata-consent');
        if (storedConsent) {
          const parsedConsent = JSON.parse(storedConsent);
          setConsent(parsedConsent);
        }
      }
    } catch (err) {
      handleError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const saveConsent = useCallback(async (newConsent: ConsentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const consentData = {
        ...newConsent,
        timestamp: new Date(),
        version: '1.0',
      };

      if (userId) {
        // Save consent for authenticated user
        await privata.restrictProcessing({
          dataSubjectId: userId,
          restrictions: {
            consent: consentData,
          },
          reason: 'User consent preferences',
          evidence: 'User consent via React hook',
        });
      } else {
        // Save consent for anonymous user
        localStorage.setItem('privata-consent', JSON.stringify(consentData));
      }

      setConsent(consentData);
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError]);

  const updateConsent = useCallback(async (newConsent: ConsentData) => {
    await saveConsent(newConsent);
  }, [saveConsent]);

  const acceptAll = useCallback(async () => {
    const allConsent: ConsentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
      thirdParty: true,
      timestamp: new Date(),
      version: '1.0',
    };
    
    await saveConsent(allConsent);
  }, [saveConsent]);

  const rejectAll = useCallback(async () => {
    const minimalConsent: ConsentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
      thirdParty: false,
      timestamp: new Date(),
      version: '1.0',
    };
    
    await saveConsent(minimalConsent);
  }, [saveConsent]);

  const hasConsent = useCallback((type: keyof ConsentData) => {
    if (!consent) return false;
    return consent[type] === true;
  }, [consent]);

  const isConsentValid = useCallback(() => {
    if (!consent) return false;
    
    // Check if consent is not too old (e.g., within 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return consent.timestamp > oneYearAgo;
  }, [consent]);

  // Auto-load consent on mount
  useEffect(() => {
    if (autoLoad) {
      loadConsent();
    }
  }, [autoLoad, loadConsent]);

  return {
    consent,
    loading,
    error,
    updateConsent,
    acceptAll,
    rejectAll,
    hasConsent,
    isConsentValid,
  };
};

