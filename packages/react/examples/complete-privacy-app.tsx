import React, { useState, useEffect } from 'react';
import { Privata } from '@privata/core';
import {
  ConsentBanner,
  PrivacyDashboard,
  DataExportButton,
  GDPRSettings,
  DataErasureForm,
  usePrivata,
  useConsent,
  useGDPR,
  useHIPAA
} from '@privata/react';

// Example: Complete Privacy-First Healthcare Application
function CompletePrivacyApp() {
  const [userId, setUserId] = useState<string>('user123');
  const [showErasureForm, setShowErasureForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize Privata
  const privata = new Privata({
    database: {
      identity: {
        us: 'mongodb://localhost/identity_us',
        eu: 'mongodb://localhost/identity_eu'
      },
      clinical: {
        us: 'mongodb://localhost/clinical_us',
        eu: 'mongodb://localhost/clinical_eu'
      }
    }
  });

  // Use Privata hooks
  const { userData, loading, error } = usePrivata(privata, { userId });
  const { consent, updateConsent, acceptAll, rejectAll } = useConsent(privata, { userId });
  const { requestDataAccess, erasePersonalData } = useGDPR(privata, { userId });
  const { requestPHIAccess, reportBreach } = useHIPAA(privata, { userId });

  // Handle data export
  const handleDataExport = async () => {
    try {
      const exportData = await requestDataAccess({
        includePII: true,
        includePHI: true,
        includeAuditLogs: true
      });
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Data export completed successfully');
    } catch (error) {
      console.error('Data export failed:', error);
    }
  };

  // Handle data erasure
  const handleDataErasure = async (erasureRequest: any) => {
    try {
      await erasePersonalData(
        erasureRequest.reason,
        erasureRequest.evidence
      );
      
      console.log('Data erasure completed successfully');
      setShowErasureForm(false);
    } catch (error) {
      console.error('Data erasure failed:', error);
    }
  };

  // Handle consent changes
  const handleConsentChange = (newConsent: any) => {
    updateConsent(newConsent);
    console.log('Consent updated:', newConsent);
  };

  // Handle breach reporting
  const handleBreachReport = async () => {
    try {
      await reportBreach({
        description: 'Potential data breach detected',
        affectedRecords: 1,
        severity: 'low',
        discoveredAt: new Date()
      });
      
      console.log('Breach report submitted successfully');
    } catch (error) {
      console.error('Breach report failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">Loading your privacy data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <div className="error-message">
          Failed to load privacy data: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="complete-privacy-app">
      {/* Header */}
      <header className="app-header">
        <h1>🏥 Healthcare Privacy Dashboard</h1>
        <p>Complete GDPR/HIPAA compliance with Privata</p>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Privacy Dashboard */}
        <section className="dashboard-section">
          <PrivacyDashboard
            userId={userId}
            privata={privata}
            showAdvanced={true}
            onDataChange={(data) => {
              console.log('Privacy data updated:', data);
            }}
          />
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <DataExportButton
              userId={userId}
              privata={privata}
              variant="primary"
              size="medium"
              onExportComplete={(data) => {
                console.log('Data export completed:', data);
              }}
            />
            
            <button
              onClick={() => setShowSettings(true)}
              className="action-button"
            >
              ⚙️ Privacy Settings
            </button>
            
            <button
              onClick={() => setShowErasureForm(true)}
              className="action-button action-button-danger"
            >
              🗑️ Request Data Deletion
            </button>
            
            <button
              onClick={handleBreachReport}
              className="action-button action-button-warning"
            >
              🚨 Report Breach
            </button>
          </div>
        </section>

        {/* User Data Summary */}
        <section className="data-summary">
          <h2>Your Data Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Personal Information</h3>
              <p>Name: {userData?.name || 'Not available'}</p>
              <p>Email: {userData?.email || 'Not available'}</p>
              <p>Phone: {userData?.phone || 'Not provided'}</p>
            </div>
            
            <div className="summary-card">
              <h3>Health Information</h3>
              <p>Medical Record: {userData?.medicalRecordNumber || 'Not available'}</p>
              <p>Last Visit: {userData?.lastVisit || 'Not available'}</p>
              <p>Conditions: {userData?.conditions?.length || 0}</p>
            </div>
            
            <div className="summary-card">
              <h3>Consent Status</h3>
              <p>Analytics: {consent?.analytics ? '✅' : '❌'}</p>
              <p>Marketing: {consent?.marketing ? '✅' : '❌'}</p>
              <p>Personalization: {consent?.personalization ? '✅' : '❌'}</p>
            </div>
          </div>
        </section>

        {/* GDPR Rights */}
        <section className="gdpr-rights">
          <h2>Your GDPR Rights</h2>
          <div className="rights-grid">
            <div className="right-card">
              <h3>Article 15 - Right to Access</h3>
              <p>Access your personal data</p>
              <button onClick={handleDataExport}>
                📥 Export My Data
              </button>
            </div>
            
            <div className="right-card">
              <h3>Article 17 - Right to Erasure</h3>
              <p>Delete your personal data</p>
              <button onClick={() => setShowErasureForm(true)}>
                🗑️ Delete My Data
              </button>
            </div>
            
            <div className="right-card">
              <h3>Article 20 - Right to Portability</h3>
              <p>Transfer your data</p>
              <button onClick={handleDataExport}>
                📤 Transfer My Data
              </button>
            </div>
            
            <div className="right-card">
              <h3>Article 21 - Right to Object</h3>
              <p>Object to data processing</p>
              <button onClick={() => setShowSettings(true)}>
                ⚙️ Manage Preferences
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>🔒 Your privacy is protected by Privata - GDPR/HIPAA compliant</p>
      </footer>

      {/* Consent Banner */}
      <ConsentBanner
        privata={privata}
        position="bottom"
        theme="light"
        onConsentChange={handleConsentChange}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
      />

      {/* Modals */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <GDPRSettings
              userId={userId}
              privata={privata}
              onSettingsChange={(settings) => {
                console.log('Settings updated:', settings);
                setShowSettings(false);
              }}
            />
            <button
              onClick={() => setShowSettings(false)}
              className="modal-close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showErasureForm && (
        <DataErasureForm
          userId={userId}
          privata={privata}
          onErasureComplete={handleDataErasure}
          onClose={() => setShowErasureForm(false)}
        />
      )}
    </div>
  );
}

export default CompletePrivacyApp;

