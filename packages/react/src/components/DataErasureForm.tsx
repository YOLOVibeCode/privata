import React, { useState } from 'react';
import { Privata } from '@privata/core';

export interface DataErasureFormProps {
  userId: string;
  privata: Privata;
  onErasureComplete?: (result: any) => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  showConfirmation?: boolean;
}

export interface ErasureRequest {
  reason: string;
  evidence: string;
  dataTypes: {
    personalInfo: boolean;
    healthInfo: boolean;
    activityLogs: boolean;
    consentHistory: boolean;
    auditLogs: boolean;
  };
  confirmationText: string;
}

export const DataErasureForm: React.FC<DataErasureFormProps> = ({
  userId,
  privata,
  onErasureComplete,
  onClose,
  className = '',
  style = {},
  showConfirmation = true,
}) => {
  const [erasureRequest, setErasureRequest] = useState<ErasureRequest>({
    reason: '',
    evidence: '',
    dataTypes: {
      personalInfo: true,
      healthInfo: true,
      activityLogs: false,
      consentHistory: false,
      auditLogs: false,
    },
    confirmationText: '',
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirmation' | 'processing' | 'complete'>('form');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ErasureRequest, value: any) => {
    setErasureRequest(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDataTypeChange = (dataType: keyof ErasureRequest['dataTypes'], value: boolean) => {
    setErasureRequest(prev => ({
      ...prev,
      dataTypes: {
        ...prev.dataTypes,
        [dataType]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!erasureRequest.reason.trim()) {
        setError('Please provide a reason for data deletion');
        return;
      }

      if (!erasureRequest.evidence.trim()) {
        setError('Please provide evidence for your request');
        return;
      }

      if (showConfirmation) {
        setStep('confirmation');
        return;
      }

      await processErasure();
    } catch (error) {
      console.error('Erasure request failed:', error);
      setError('Failed to process erasure request');
    } finally {
      setLoading(false);
    }
  };

  const processErasure = async () => {
    try {
      setStep('processing');
      setLoading(true);

      // Process data erasure through Privata
      const result = await privata.erasePersonalData({
        dataSubjectId: userId,
        reason: erasureRequest.reason,
        evidence: erasureRequest.evidence,
      }, {
        dataTypes: erasureRequest.dataTypes,
      });

      setStep('complete');
      
      if (onErasureComplete) {
        onErasureComplete(result);
      }
    } catch (error) {
      console.error('Data erasure failed:', error);
      setError('Failed to erase data. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmErasure = () => {
    processErasure();
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  const isFormValid = () => {
    return (
      erasureRequest.reason.trim() !== '' &&
      erasureRequest.evidence.trim() !== '' &&
      Object.values(erasureRequest.dataTypes).some(Boolean)
    );
  };

  const getSelectedDataTypes = () => {
    return Object.entries(erasureRequest.dataTypes)
      .filter(([_, selected]) => selected)
      .map(([type, _]) => type);
  };

  if (step === 'confirmation') {
    return (
      <div className={`data-erasure-confirmation ${className}`} style={style}>
        <div className="confirmation-modal">
          <div className="confirmation-header">
            <h3>⚠️ Confirm Data Deletion</h3>
            <p>This action cannot be undone. Please review your request carefully.</p>
          </div>

          <div className="confirmation-content">
            <div className="confirmation-summary">
              <h4>Data to be deleted:</h4>
              <ul>
                {getSelectedDataTypes().map(type => (
                  <li key={type}>
                    {type === 'personalInfo' && 'Personal Information (Name, Email, Phone, Address)'}
                    {type === 'healthInfo' && 'Health Information (Medical Records, Diagnoses, Medications)'}
                    {type === 'activityLogs' && 'Activity Logs (User Actions and Interactions)'}
                    {type === 'consentHistory' && 'Consent History (Privacy Preferences and Consent Records)'}
                    {type === 'auditLogs' && 'Audit Logs (System Access and Security Records)'}
                  </li>
                ))}
              </ul>
            </div>

            <div className="confirmation-details">
              <h4>Reason:</h4>
              <p>{erasureRequest.reason}</p>
              
              <h4>Evidence:</h4>
              <p>{erasureRequest.evidence}</p>
            </div>

            <div className="confirmation-warning">
              <p><strong>Warning:</strong> This action will permanently delete your data and cannot be undone. 
              You will lose access to all services and will need to create a new account if you wish to use our services again.</p>
            </div>
          </div>

          <div className="confirmation-footer">
            <button
              onClick={() => setStep('form')}
              className="confirmation-button confirmation-button-cancel"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirmErasure}
              disabled={loading}
              className="confirmation-button confirmation-button-confirm"
            >
              {loading ? 'Processing...' : 'Confirm Deletion'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className={`data-erasure-processing ${className}`} style={style}>
        <div className="processing-modal">
          <div className="processing-content">
            <div className="processing-spinner">🔄</div>
            <h3>Processing Data Deletion</h3>
            <p>Your data is being securely deleted. This may take a few minutes.</p>
            <div className="processing-steps">
              <div className="processing-step">✓ Validating request</div>
              <div className="processing-step">✓ Removing personal information</div>
              <div className="processing-step">✓ Removing health information</div>
              <div className="processing-step">⏳ Finalizing deletion</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className={`data-erasure-complete ${className}`} style={style}>
        <div className="complete-modal">
          <div className="complete-content">
            <div className="complete-icon">✅</div>
            <h3>Data Deletion Complete</h3>
            <p>Your data has been successfully deleted from our systems.</p>
            <div className="complete-details">
              <p>• All personal information has been removed</p>
              <p>• All health information has been removed</p>
              <p>• Your account has been deactivated</p>
              <p>• You will receive a confirmation email shortly</p>
            </div>
            <button
              onClick={handleCancel}
              className="complete-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-erasure-form ${className}`} style={style}>
      <div className="erasure-form-modal">
        <div className="erasure-form-header">
          <h3>🗑️ Request Data Deletion</h3>
          <p>Request the deletion of your personal data (Right to be Forgotten - GDPR Article 17)</p>
          <button
            onClick={handleCancel}
            className="close-button"
          >
            ×
          </button>
        </div>

        <div className="erasure-form-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-section">
            <h4>Reason for Deletion</h4>
            <p>Please explain why you want your data deleted:</p>
            <textarea
              value={erasureRequest.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="e.g., I no longer wish to use this service, I want to start fresh, I have privacy concerns..."
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="form-section">
            <h4>Evidence</h4>
            <p>Please provide evidence for your request:</p>
            <textarea
              value={erasureRequest.evidence}
              onChange={(e) => handleInputChange('evidence', e.target.value)}
              placeholder="e.g., This is my personal request, I am the data subject, I have verified my identity..."
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="form-section">
            <h4>Data Types to Delete</h4>
            <p>Select which types of data you want to delete:</p>
            
            <div className="data-type-options">
              <label className="data-type-option">
                <input
                  type="checkbox"
                  checked={erasureRequest.dataTypes.personalInfo}
                  onChange={(e) => handleDataTypeChange('personalInfo', e.target.checked)}
                />
                <div className="data-type-info">
                  <span className="data-type-name">Personal Information</span>
                  <span className="data-type-description">Name, email, phone, address, and other personal details</span>
                </div>
              </label>

              <label className="data-type-option">
                <input
                  type="checkbox"
                  checked={erasureRequest.dataTypes.healthInfo}
                  onChange={(e) => handleDataTypeChange('healthInfo', e.target.checked)}
                />
                <div className="data-type-info">
                  <span className="data-type-name">Health Information</span>
                  <span className="data-type-description">Medical records, diagnoses, treatments, and health data</span>
                </div>
              </label>

              <label className="data-type-option">
                <input
                  type="checkbox"
                  checked={erasureRequest.dataTypes.activityLogs}
                  onChange={(e) => handleDataTypeChange('activityLogs', e.target.checked)}
                />
                <div className="data-type-info">
                  <span className="data-type-name">Activity Logs</span>
                  <span className="data-type-description">Your activity history and system interactions</span>
                </div>
              </label>

              <label className="data-type-option">
                <input
                  type="checkbox"
                  checked={erasureRequest.dataTypes.consentHistory}
                  onChange={(e) => handleDataTypeChange('consentHistory', e.target.checked)}
                />
                <div className="data-type-info">
                  <span className="data-type-name">Consent History</span>
                  <span className="data-type-description">Your privacy preferences and consent records</span>
                </div>
              </label>

              <label className="data-type-option">
                <input
                  type="checkbox"
                  checked={erasureRequest.dataTypes.auditLogs}
                  onChange={(e) => handleDataTypeChange('auditLogs', e.target.checked)}
                />
                <div className="data-type-info">
                  <span className="data-type-name">Audit Logs</span>
                  <span className="data-type-description">System access and security records</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4>Important Information</h4>
            <div className="important-info">
              <p>• <strong>This action cannot be undone</strong> - Once deleted, your data cannot be recovered</p>
              <p>• <strong>Account deactivation</strong> - Your account will be deactivated after data deletion</p>
              <p>• <strong>Service access</strong> - You will lose access to all services and features</p>
              <p>• <strong>Legal requirements</strong> - Some data may be retained for legal compliance</p>
            </div>
          </div>
        </div>

        <div className="erasure-form-footer">
          <button
            onClick={handleCancel}
            className="form-button form-button-cancel"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
            className="form-button form-button-submit"
          >
            {loading ? 'Processing...' : 'Request Data Deletion'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataErasureForm;

