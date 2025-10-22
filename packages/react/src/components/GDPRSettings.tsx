import React, { useState, useEffect } from 'react';
import { Privata } from '@privata/core';

export interface GDPRSettingsProps {
  userId: string;
  privata: Privata;
  onSettingsChange?: (settings: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface PrivacySettings {
  dataProcessing: {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
    research: boolean;
  };
  dataSharing: {
    thirdParties: boolean;
    partners: boolean;
    affiliates: boolean;
  };
  communication: {
    email: boolean;
    sms: boolean;
    push: boolean;
    phone: boolean;
  };
  dataRetention: {
    duration: number; // in months
    autoDelete: boolean;
  };
}

export const GDPRSettings: React.FC<GDPRSettingsProps> = ({
  userId,
  privata,
  onSettingsChange,
  className = '',
  style = {}
}) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataProcessing: {
      analytics: true,
      marketing: false,
      personalization: true,
      research: false,
    },
    dataSharing: {
      thirdParties: false,
      partners: false,
      affiliates: false,
    },
    communication: {
      email: true,
      sms: false,
      push: true,
      phone: false,
    },
    dataRetention: {
      duration: 24, // 24 months
      autoDelete: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing settings
  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load user's privacy settings from Privata
      const userSettings = await privata.requestDataAccess(userId, {});
      if (userSettings?.privacySettings) {
        setSettings(userSettings.privacySettings);
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // Update privacy settings through Privata
      await privata.restrictProcessing({
        dataSubjectId: userId,
        restrictions: {
          dataProcessing: settings.dataProcessing,
          dataSharing: settings.dataSharing,
          communication: settings.communication,
          dataRetention: settings.dataRetention,
        },
        reason: 'User updated privacy settings',
        evidence: 'User consent via GDPR settings interface',
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category: keyof PrivacySettings, key: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  if (loading && !settings) {
    return (
      <div className={`gdpr-settings-loading ${className}`} style={style}>
        <div className="loading-spinner">Loading privacy settings...</div>
      </div>
    );
  }

  return (
    <div className={`gdpr-settings ${className}`} style={style}>
      <div className="gdpr-settings-header">
        <h2>Privacy Settings</h2>
        <p>Manage your data processing preferences and privacy rights</p>
      </div>

      <div className="gdpr-settings-content">
        {/* Data Processing Preferences */}
        <section className="settings-section">
          <h3>Data Processing</h3>
          <p>Control how your data is processed and used</p>
          
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.dataProcessing.analytics}
                onChange={(e) => handleSettingChange('dataProcessing', 'analytics', e.target.checked)}
              />
              Analytics and Performance
            </label>
            <p className="setting-description">
              Allow processing of your data for analytics and performance monitoring
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.dataProcessing.marketing}
                onChange={(e) => handleSettingChange('dataProcessing', 'marketing', e.target.checked)}
              />
              Marketing and Advertising
            </label>
            <p className="setting-description">
              Allow processing of your data for marketing and advertising purposes
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.dataProcessing.personalization}
                onChange={(e) => handleSettingChange('dataProcessing', 'personalization', e.target.checked)}
              />
              Personalization
            </label>
            <p className="setting-description">
              Allow processing of your data for personalizing your experience
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.dataProcessing.research}
                onChange={(e) => handleSettingChange('dataProcessing', 'research', e.target.checked)}
              />
              Research and Development
            </label>
            <p className="setting-description">
              Allow processing of your data for research and development purposes
            </p>
          </div>
        </section>

        {/* Data Sharing Preferences */}
        <section className="settings-section">
          <h3>Data Sharing</h3>
          <p>Control who your data is shared with</p>
          
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.dataSharing.thirdParties}
                onChange={(e) => handleSettingChange('dataSharing', 'thirdParties', e.target.checked)}
              />
              Third-Party Services
            </label>
            <p className="setting-description">
              Allow sharing of your data with third-party service providers
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.dataSharing.partners}
                onChange={(e) => handleSettingChange('dataSharing', 'partners', e.target.checked)}
              />
              Business Partners
            </label>
            <p className="setting-description">
              Allow sharing of your data with business partners
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.dataSharing.affiliates}
                onChange={(e) => handleSettingChange('dataSharing', 'affiliates', e.target.checked)}
              />
              Affiliated Companies
            </label>
            <p className="setting-description">
              Allow sharing of your data with affiliated companies
            </p>
          </div>
        </section>

        {/* Communication Preferences */}
        <section className="settings-section">
          <h3>Communication</h3>
          <p>Control how we communicate with you</p>
          
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.communication.email}
                onChange={(e) => handleSettingChange('communication', 'email', e.target.checked)}
              />
              Email Communications
            </label>
            <p className="setting-description">
              Receive important updates and notifications via email
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.communication.sms}
                onChange={(e) => handleSettingChange('communication', 'sms', e.target.checked)}
              />
              SMS Notifications
            </label>
            <p className="setting-description">
              Receive important updates and notifications via SMS
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.communication.push}
                onChange={(e) => handleSettingChange('communication', 'push', e.target.checked)}
              />
              Push Notifications
            </label>
            <p className="setting-description">
              Receive push notifications on your device
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.communication.phone}
                onChange={(e) => handleSettingChange('communication', 'phone', e.target.checked)}
              />
              Phone Calls
            </label>
            <p className="setting-description">
              Allow us to contact you via phone for important matters
            </p>
          </div>
        </section>

        {/* Data Retention Settings */}
        <section className="settings-section">
          <h3>Data Retention</h3>
          <p>Control how long your data is kept</p>
          
          <div className="setting-item">
            <label>
              Data Retention Period (months):
              <select
                value={settings.dataRetention.duration}
                onChange={(e) => handleSettingChange('dataRetention', 'duration', parseInt(e.target.value))}
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
                <option value={60}>60 months</option>
              </select>
            </label>
            <p className="setting-description">
              How long your data should be retained before automatic deletion
            </p>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.dataRetention.autoDelete}
                onChange={(e) => handleSettingChange('dataRetention', 'autoDelete', e.target.checked)}
              />
              Automatic Data Deletion
            </label>
            <p className="setting-description">
              Automatically delete your data after the retention period expires
            </p>
          </div>
        </section>
      </div>

      <div className="gdpr-settings-footer">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="save-button"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        
        {saved && (
          <div className="save-success">
            ✅ Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default GDPRSettings;

