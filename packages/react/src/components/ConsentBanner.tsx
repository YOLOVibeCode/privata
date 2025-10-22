import React, { useState, useEffect } from 'react';
import { Privata } from '@privata/core';

export interface ConsentBannerProps {
  userId?: string;
  privata: Privata;
  onConsentChange?: (consent: ConsentData) => void;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onCustomize?: () => void;
  className?: string;
  style?: React.CSSProperties;
  position?: 'top' | 'bottom' | 'center';
  theme?: 'light' | 'dark' | 'auto';
  showDetails?: boolean;
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

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  userId,
  privata,
  onConsentChange,
  onAcceptAll,
  onRejectAll,
  onCustomize,
  className = '',
  style = {},
  position = 'bottom',
  theme = 'light',
  showDetails = true,
}) => {
  const [consent, setConsent] = useState<ConsentData>({
    necessary: true, // Always true - required for basic functionality
    analytics: false,
    marketing: false,
    personalization: false,
    thirdParty: false,
    timestamp: new Date(),
    version: '1.0',
  });

  const [showBanner, setShowBanner] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user has already given consent
  useEffect(() => {
    checkExistingConsent();
  }, [userId]);

  const checkExistingConsent = async () => {
    try {
      if (userId) {
        // Check if user has existing consent
        const userData = await privata.requestDataAccess(userId, {});
        if (userData?.consent) {
          setConsent(userData.consent);
          setShowBanner(false);
        } else {
          setShowBanner(true);
        }
      } else {
        // Check localStorage for anonymous consent
        const storedConsent = localStorage.getItem('privata-consent');
        if (storedConsent) {
          const parsedConsent = JSON.parse(storedConsent);
          setConsent(parsedConsent);
          setShowBanner(false);
        } else {
          setShowBanner(true);
        }
      }
    } catch (error) {
      console.error('Failed to check existing consent:', error);
      setShowBanner(true);
    }
  };

  const saveConsent = async (newConsent: ConsentData) => {
    try {
      setLoading(true);
      
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
          evidence: 'User consent via consent banner',
        });
      } else {
        // Save consent for anonymous user
        localStorage.setItem('privata-consent', JSON.stringify(consentData));
      }

      setConsent(consentData);
      setShowBanner(false);
      
      if (onConsentChange) {
        onConsentChange(consentData);
      }
    } catch (error) {
      console.error('Failed to save consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = () => {
    const allConsent: ConsentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
      thirdParty: true,
      timestamp: new Date(),
      version: '1.0',
    };
    
    saveConsent(allConsent);
    
    if (onAcceptAll) {
      onAcceptAll();
    }
  };

  const handleRejectAll = () => {
    const minimalConsent: ConsentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
      thirdParty: false,
      timestamp: new Date(),
      version: '1.0',
    };
    
    saveConsent(minimalConsent);
    
    if (onRejectAll) {
      onRejectAll();
    }
  };

  const handleCustomize = () => {
    setShowDetailsPanel(true);
    
    if (onCustomize) {
      onCustomize();
    }
  };

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    setConsent(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveCustomConsent = () => {
    saveConsent(consent);
    setShowDetailsPanel(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Main Consent Banner */}
      <div 
        className={`consent-banner consent-banner-${position} consent-banner-${theme} ${className}`}
        style={style}
      >
        <div className="consent-banner-content">
          <div className="consent-banner-header">
            <h3>🍪 We Value Your Privacy</h3>
            <p>
              We use cookies and similar technologies to provide, protect, and improve our services. 
              Your privacy choices will be respected.
            </p>
          </div>

          <div className="consent-banner-actions">
            <button
              onClick={handleRejectAll}
              className="consent-button consent-button-reject"
              disabled={loading}
            >
              Reject All
            </button>
            
            <button
              onClick={handleCustomize}
              className="consent-button consent-button-customize"
              disabled={loading}
            >
              Customize
            </button>
            
            <button
              onClick={handleAcceptAll}
              className="consent-button consent-button-accept"
              disabled={loading}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Consent Panel */}
      {showDetailsPanel && (
        <div className="consent-details-overlay">
          <div className="consent-details-panel">
            <div className="consent-details-header">
              <h3>Privacy Preferences</h3>
              <button
                onClick={() => setShowDetailsPanel(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <div className="consent-details-content">
              <div className="consent-category">
                <h4>Necessary Cookies</h4>
                <p>Essential for the website to function properly</p>
                <label className="consent-toggle">
                  <input
                    type="checkbox"
                    checked={consent.necessary}
                    disabled
                  />
                  <span className="toggle-slider"></span>
                  Always Active
                </label>
              </div>

              <div className="consent-category">
                <h4>Analytics Cookies</h4>
                <p>Help us understand how visitors interact with our website</p>
                <label className="consent-toggle">
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  {consent.analytics ? 'Enabled' : 'Disabled'}
                </label>
              </div>

              <div className="consent-category">
                <h4>Marketing Cookies</h4>
                <p>Used to deliver personalized advertisements</p>
                <label className="consent-toggle">
                  <input
                    type="checkbox"
                    checked={consent.marketing}
                    onChange={(e) => handleConsentChange('marketing', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  {consent.marketing ? 'Enabled' : 'Disabled'}
                </label>
              </div>

              <div className="consent-category">
                <h4>Personalization Cookies</h4>
                <p>Remember your preferences and settings</p>
                <label className="consent-toggle">
                  <input
                    type="checkbox"
                    checked={consent.personalization}
                    onChange={(e) => handleConsentChange('personalization', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  {consent.personalization ? 'Enabled' : 'Disabled'}
                </label>
              </div>

              <div className="consent-category">
                <h4>Third-Party Cookies</h4>
                <p>Cookies from third-party services we use</p>
                <label className="consent-toggle">
                  <input
                    type="checkbox"
                    checked={consent.thirdParty}
                    onChange={(e) => handleConsentChange('thirdParty', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  {consent.thirdParty ? 'Enabled' : 'Disabled'}
                </label>
              </div>
            </div>

            <div className="consent-details-footer">
              <button
                onClick={() => setShowDetailsPanel(false)}
                className="consent-button consent-button-cancel"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveCustomConsent}
                className="consent-button consent-button-save"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsentBanner;

