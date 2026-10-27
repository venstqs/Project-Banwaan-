import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_BARANGAYS_OFFLINE, OfflineBarangay } from '../data/offlineData';
import { initDB, fetchAllReports, insertReport, markReportSynced } from '../database/schema';

export interface QueuedReport {
  id: string;
  barangayId: number;
  barangayName: string;
  reportType: string;
  description: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  isSynced: boolean;
}

export type MobileRole = 'barangay_captain' | 'citizen';

interface OfflineContextType {
  mobileRole?: MobileRole;
  setMobileRole?: (role: MobileRole) => void;
  selectedCategoryFilter?: string;
  handleSelectCategory?: (category: string) => void;
  isOnline: boolean;
  toggleNetwork: () => void;
  queuedReports: QueuedReport[];
  submitReport: (report: Omit<QueuedReport, 'id' | 'timestamp' | 'isSynced'>) => Promise<void>;
  syncOutbox: () => Promise<number>;
  selectedBarangay: OfflineBarangay;
  setSelectedBarangayId: (id: number) => void;
  allBarangays: OfflineBarangay[];
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [allBarangays] = useState<OfflineBarangay[]>(SAMPLE_BARANGAYS_OFFLINE);
  const [selectedBarangay, setSelectedBarangay] = useState<OfflineBarangay>(SAMPLE_BARANGAYS_OFFLINE[1]);
  const [queuedReports, setQueuedReports] = useState<QueuedReport[]>([]);
  const [mobileRole, setMobileRole] = useState<MobileRole>('barangay_captain');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const handleSelectCategory = (category: string) => setSelectedCategoryFilter(category);

  useEffect(() => {
    initDB();
    const reports = fetchAllReports() as any[];
    setQueuedReports(reports.map(r => ({ ...r, isSynced: r.isSynced === 1 })));
  }, []);

  const toggleNetwork = () => setIsOnline((prev) => !prev);

  const setSelectedBarangayId = (id: number) => {
    const found = allBarangays.find((b) => b.id === id);
    if (found) setSelectedBarangay(found);
  };

  const submitReport = async (reportData: Omit<QueuedReport, 'id' | 'timestamp' | 'isSynced'>) => {
    const newReport: QueuedReport = {
      ...reportData,
      id: `OFFLINE-RPT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString() + " PHT",
      isSynced: isOnline
    };

    insertReport(newReport);
    setQueuedReports((prev) => [newReport, ...prev]);

    if (isOnline) {
      try {
        await fetch('http://localhost:8000/api/mobile/field-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        });
      } catch (err) {
        console.warn("Server unreachable, kept in SQLite outbox");
      }
    }
  };

  const syncOutbox = async () => {
    if (!isOnline) return 0;
    let syncedCount = 0;
    const updated = await Promise.all(
      queuedReports.map(async (rpt) => {
        if (!rpt.isSynced) {
          try {
            await fetch('http://localhost:8000/api/mobile/field-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rpt)
            });
            markReportSynced(rpt.id);
            syncedCount++;
            return { ...rpt, isSynced: true };
          } catch {
            return rpt;
          }
        }
        return rpt;
      })
    );
    setQueuedReports(updated);
    return syncedCount;
  };

  return (
    <OfflineContext.Provider value={{ isOnline, toggleNetwork, queuedReports, submitReport, syncOutbox, selectedBarangay, setSelectedBarangayId, allBarangays, mobileRole, setMobileRole, selectedCategoryFilter, handleSelectCategory }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error("useOffline must be used within an OfflineProvider");
  return context;
};