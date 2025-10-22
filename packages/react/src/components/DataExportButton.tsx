import React, { useState } from 'react';
import { Privata } from '@privata/core';

export interface DataExportButtonProps {
  userId: string;
  privata: Privata;
  onExportComplete?: (exportData: any) => void;
  onExportError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  exportFormats?: ExportFormat[];
}

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  mimeType: string;
  extension: string;
}

export interface ExportOptions {
  format: string;
  includePII: boolean;
  includePHI: boolean;
  includeAuditLogs: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  customFields?: string[];
}

const DEFAULT_EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data format',
    mimeType: 'application/json',
    extension: 'json',
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Spreadsheet format',
    mimeType: 'text/csv',
    extension: 'csv',
  },
  {
    id: 'xml',
    name: 'XML',
    description: 'Extensible markup language',
    mimeType: 'application/xml',
    extension: 'xml',
  },
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Human-readable report',
    mimeType: 'application/pdf',
    extension: 'pdf',
  },
];

export const DataExportButton: React.FC<DataExportButtonProps> = ({
  userId,
  privata,
  onExportComplete,
  onExportError,
  className = '',
  style = {},
  variant = 'primary',
  size = 'medium',
  showProgress = true,
  exportFormats = DEFAULT_EXPORT_FORMATS,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includePII: true,
    includePHI: true,
    includeAuditLogs: true,
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Request data portability through Privata
      const exportData = await privata.requestDataPortability({
        dataSubjectId: userId,
        format: exportOptions.format.toUpperCase(),
        deliveryMethod: 'download',
      }, {
        includePII: exportOptions.includePII,
        includePHI: exportOptions.includePHI,
        includeAuditLogs: exportOptions.includeAuditLogs,
        dateRange: exportOptions.dateRange,
        customFields: exportOptions.customFields,
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      // Create and download the file
      const selectedFormat = exportFormats.find(f => f.id === exportOptions.format);
      if (selectedFormat) {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: selectedFormat.mimeType,
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-data-export-${new Date().toISOString().split('T')[0]}.${selectedFormat.extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      if (onExportComplete) {
        onExportComplete(exportData);
      }

      // Reset after a short delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setShowOptions(false);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
      
      if (onExportError) {
        onExportError(error as Error);
      }
    }
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getButtonText = () => {
    if (isExporting) {
      return showProgress ? `Exporting... ${Math.round(exportProgress)}%` : 'Exporting...';
    }
    return 'Export My Data';
  };

  const getButtonIcon = () => {
    if (isExporting) {
      return showProgress ? '⏳' : '🔄';
    }
    return '📥';
  };

  return (
    <div className={`data-export-container ${className}`} style={style}>
      <button
        onClick={() => setShowOptions(true)}
        disabled={isExporting}
        className={`data-export-button data-export-button-${variant} data-export-button-${size}`}
      >
        <span className="button-icon">{getButtonIcon()}</span>
        <span className="button-text">{getButtonText()}</span>
      </button>

      {/* Export Options Modal */}
      {showOptions && (
        <div className="export-options-overlay">
          <div className="export-options-modal">
            <div className="export-options-header">
              <h3>📥 Export Your Data</h3>
              <p>Choose what data to export and in what format</p>
              <button
                onClick={() => setShowOptions(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <div className="export-options-content">
              {/* Format Selection */}
              <div className="export-option-group">
                <h4>Export Format</h4>
                <div className="format-options">
                  {exportFormats.map(format => (
                    <label key={format.id} className="format-option">
                      <input
                        type="radio"
                        name="format"
                        value={format.id}
                        checked={exportOptions.format === format.id}
                        onChange={(e) => handleOptionChange('format', e.target.value)}
                      />
                      <div className="format-info">
                        <span className="format-name">{format.name}</span>
                        <span className="format-description">{format.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Selection */}
              <div className="export-option-group">
                <h4>Data to Include</h4>
                
                <label className="export-option">
                  <input
                    type="checkbox"
                    checked={exportOptions.includePII}
                    onChange={(e) => handleOptionChange('includePII', e.target.checked)}
                  />
                  <span>Personal Information (PII)</span>
                  <p>Name, email, phone, address, and other personal details</p>
                </label>

                <label className="export-option">
                  <input
                    type="checkbox"
                    checked={exportOptions.includePHI}
                    onChange={(e) => handleOptionChange('includePHI', e.target.checked)}
                  />
                  <span>Health Information (PHI)</span>
                  <p>Medical records, diagnoses, treatments, and health data</p>
                </label>

                <label className="export-option">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAuditLogs}
                    onChange={(e) => handleOptionChange('includeAuditLogs', e.target.checked)}
                  />
                  <span>Activity Logs</span>
                  <p>Your activity history and system interactions</p>
                </label>
              </div>

              {/* Date Range */}
              <div className="export-option-group">
                <h4>Date Range (Optional)</h4>
                <div className="date-range-inputs">
                  <label>
                    From:
                    <input
                      type="date"
                      value={exportOptions.dateRange?.start?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleOptionChange('dateRange', {
                        ...exportOptions.dateRange,
                        start: e.target.value ? new Date(e.target.value) : undefined,
                        end: exportOptions.dateRange?.end,
                      })}
                    />
                  </label>
                  <label>
                    To:
                    <input
                      type="date"
                      value={exportOptions.dateRange?.end?.toISOString().split('T')[0] || ''}
                      onChange={(e) => handleOptionChange('dateRange', {
                        ...exportOptions.dateRange,
                        start: exportOptions.dateRange?.start,
                        end: e.target.value ? new Date(e.target.value) : undefined,
                      })}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="export-options-footer">
              <button
                onClick={() => setShowOptions(false)}
                className="export-button export-button-cancel"
              >
                Cancel
              </button>
              
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="export-button export-button-export"
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>

            {/* Progress Bar */}
            {isExporting && showProgress && (
              <div className="export-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(exportProgress)}% Complete</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataExportButton;

