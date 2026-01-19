import { useState, useEffect, useCallback } from 'react';
import { 
  verifyAllIntegrity, 
  getQuarantinedRecords, 
  getIntegrityLogs,
  QuarantinedRecord,
  IntegrityReport,
  IntegrityLog,
} from '@/lib/offlineStorage';
import { createEmptyReport } from '@/lib/dataIntegrity';

export type IntegrityStatus = 'healthy' | 'issues' | 'critical' | 'unknown';

export interface UseDataIntegrityReturn {
  isVerifying: boolean;
  lastVerification: Date | null;
  integrityStatus: IntegrityStatus;
  lastReport: IntegrityReport | null;
  quarantinedCount: number;
  logs: IntegrityLog[];
  runIntegrityCheck: () => Promise<IntegrityReport>;
  viewQuarantinedRecords: () => Promise<QuarantinedRecord[]>;
  refreshLogs: () => Promise<void>;
}

export const useDataIntegrity = (): UseDataIntegrityReturn => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerification, setLastVerification] = useState<Date | null>(null);
  const [lastReport, setLastReport] = useState<IntegrityReport | null>(null);
  const [quarantinedCount, setQuarantinedCount] = useState(0);
  const [logs, setLogs] = useState<IntegrityLog[]>([]);

  const getStatus = (report: IntegrityReport | null): IntegrityStatus => {
    if (!report) return 'unknown';
    if (report.corruptedRecords > 0 || report.quarantinedRecords > 0) return 'critical';
    if (report.repairedRecords > 0) return 'issues';
    return 'healthy';
  };

  const runIntegrityCheck = useCallback(async (): Promise<IntegrityReport> => {
    setIsVerifying(true);
    try {
      const report = await verifyAllIntegrity();
      setLastReport(report);
      setLastVerification(new Date());
      const quarantined = await getQuarantinedRecords();
      setQuarantinedCount(quarantined.length);
      return report;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const viewQuarantinedRecords = useCallback(async (): Promise<QuarantinedRecord[]> => {
    return getQuarantinedRecords();
  }, []);

  const refreshLogs = useCallback(async () => {
    const recentLogs = await getIntegrityLogs(50);
    setLogs(recentLogs);
  }, []);

  useEffect(() => {
    // Run lightweight check on mount
    runIntegrityCheck();
    refreshLogs();
  }, [runIntegrityCheck, refreshLogs]);

  return {
    isVerifying,
    lastVerification,
    integrityStatus: getStatus(lastReport),
    lastReport,
    quarantinedCount,
    logs,
    runIntegrityCheck,
    viewQuarantinedRecords,
    refreshLogs,
  };
};
