import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_BARANGAYS_OFFLINE, OfflineBarangay } from '../data/offlineData';

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

interface OfflineContextType {
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
  const [isOnline, setIsOnline] = useState<boolean>(false); // Default offline for disaster-first demonstration
  const [allBarangays] = useState<OfflineBarangay[]>(SAMPLE_BARANGAYS_OFFLINE);
  const [selectedBarangay, setSelectedBarangay] = useState<OfflineBarangay>(SAMPLE_BARANGAYS_OFFLINE[1]); // Default Barangay 3
  const [queuedReports, setQueuedReports] = useState<QueuedReport[]>([
    {
      id: "OFFLINE-RPT-001",
      barangayId: 3,
      barangayName: "Barangay 3",
      reportType: "Shelter Inspection",
      description: "Inspected secondary school evacuation facility. Roof flashing intact, generator fuel refilled.",
      timestamp: "2026-10-26 14:30 PHT",
      latitude: 13.6218,
      longitude: 123.1948,
      isSynced: false
    }
  ]);

  const toggleNetwork = () => {
    setIsOnline((prev) => !prev);
  };

  const setSelectedBarangayId = (id: number) => {
    const found = allBarangays.find((b) => b.id === id);
    if (found) setSelectedBarangay(found);
  };

  const submitReport = async (reportData: Omit<QueuedReport, 'id' | 'timestamp' | 'isSynced'>) => {
    const newReport: QueuedReport = {
      ...reportData,
      id: `OFFLINE-RPT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString() + " PHT",
      isSynced: isOnline // If already online, mark as synced immediately
    };

    setQueuedReports((prev) => [newReport, ...prev]);

    // If online, send to server
    if (isOnline) {
      try {
        await fetch('http://localhost:8000/api/mobile/field-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barangay_id: newReport.barangayId,
            barangay_name: newReport.barangayName,
            report_type: newReport.reportType,
            description: newReport.description,
            latitude: newReport.latitude,
            longitude: newReport.longitude,
            offline_created_at: newReport.timestamp
          })
        });
      } catch (err) {
        console.warn("Server unreachable, stored in local offline outbox");
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
              body: JSON.stringify({
                barangay_id: rpt.barangayId,
                barangay_name: rpt.barangayName,
                report_type: rpt.reportType,
                description: rpt.description,
                latitude: rpt.latitude,
                longitude: rpt.longitude,
                offline_created_at: rpt.timestamp
              })
            });
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
    <OfflineContext.Provider
      value={{
        isOnline,
        toggleNetwork,
        queuedReports,
        submitReport,
        syncOutbox,
        selectedBarangay,
        setSelectedBarangayId,
        allBarangays
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error("useOffline must be used within an OfflineProvider");
  return context;
};
