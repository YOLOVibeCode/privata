import { useState, useCallback } from 'react';
import { Privata } from '@privata/core';

export interface UseDataExportOptions {
  userId: string;
  onError?: (error: Error) => void;
  onSuccess?: (exportData: any) => void;
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

export interface UseDataExportReturn {
  loading: boolean;
  error: Error | null;
  progress: number;
  exportData: any;
  exportData: (options: ExportOptions) => Promise<any>;
  downloadExport: (data: any, filename: string, format: string) => void;
  getExportFormats: () => Array<{ id: string; name: string; mimeType: string; extension: string }>;
}

export const useDataExport = (
  privata: Privata,
  options: UseDataExportOptions
): UseDataExportReturn => {
  const { userId, onError, onSuccess } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [exportData, setExportData] = useState<any>(null);

  const handleError = useCallback((err: Error) => {
    setError(err);
    if (onError) {
      onError(err);
    }
  }, [onError]);

  const handleSuccess = useCallback((data: any) => {
    setExportData(data);
    if (onSuccess) {
      onSuccess(data);
    }
  }, [onSuccess]);

  const exportData = useCallback(async (exportOptions: ExportOptions) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      setExportData(null);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Request data portability through Privata
      const data = await privata.requestDataPortability({
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
      setProgress(100);

      handleSuccess(data);
      return data;
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, privata, handleError, handleSuccess]);

  const downloadExport = useCallback((data: any, filename: string, format: string) => {
    try {
      const mimeTypes: Record<string, string> = {
        json: 'application/json',
        csv: 'text/csv',
        xml: 'application/xml',
        pdf: 'application/pdf',
      };

      const mimeType = mimeTypes[format] || 'application/json';
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: mimeType });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      handleError(err as Error);
    }
  }, [handleError]);

  const getExportFormats = useCallback(() => {
    return [
      {
        id: 'json',
        name: 'JSON',
        mimeType: 'application/json',
        extension: 'json',
      },
      {
        id: 'csv',
        name: 'CSV',
        mimeType: 'text/csv',
        extension: 'csv',
      },
      {
        id: 'xml',
        name: 'XML',
        mimeType: 'application/xml',
        extension: 'xml',
      },
      {
        id: 'pdf',
        name: 'PDF Report',
        mimeType: 'application/pdf',
        extension: 'pdf',
      },
    ];
  }, []);

  return {
    loading,
    error,
    progress,
    exportData,
    exportData,
    downloadExport,
    getExportFormats,
  };
};

