// Privata React Components - GDPR/HIPAA Compliance UI Library
// Complete React ecosystem for healthcare data compliance

// Core Components
export { GDPRSettings } from './components/GDPRSettings';
export { ConsentBanner } from './components/ConsentBanner';
export { DataExportButton } from './components/DataExportButton';
export { PrivacyDashboard } from './components/PrivacyDashboard';
export { DataErasureForm } from './components/DataErasureForm';

// Re-export types
export type { GDPRSettingsProps, PrivacySettings } from './components/GDPRSettings';
export type { ConsentBannerProps, ConsentData } from './components/ConsentBanner';
export type { DataExportButtonProps, ExportFormat, ExportOptions } from './components/DataExportButton';
export type { PrivacyDashboardProps, PrivacyData } from './components/PrivacyDashboard';
export type { DataErasureFormProps, ErasureRequest } from './components/DataErasureForm';

// React Hooks for Privata
export { usePrivata } from './hooks/usePrivata';
export { useGDPR } from './hooks/useGDPR';
export { useHIPAA } from './hooks/useHIPAA';
export { useConsent } from './hooks/useConsent';
export { useDataExport } from './hooks/useDataExport';

// Utility functions
export { createPrivataInstance } from './utils/createPrivataInstance';
export { withPrivataProvider } from './utils/withPrivataProvider';

// Default export for easy importing
export default {
  GDPRSettings,
  ConsentBanner,
  DataExportButton,
  PrivacyDashboard,
  DataErasureForm,
  usePrivata,
  useGDPR,
  useHIPAA,
  useConsent,
  useDataExport,
  createPrivataInstance,
  withPrivataProvider,
};

