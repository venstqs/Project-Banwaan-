import React, { createContext, useContext, useState } from 'react';
import { SAMPLE_BARANGAYS_OFFLINE, OfflineBarangay } from '../data/offlineData';
import { FIELD_REPORT_ENDPOINT } from '../config/api';

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

const DEFAULT_BARANGAY =
  SAMPLE_BARANGAYS_OFFLINE.find((b) => b.id === 3) ?? SAMPLE_BARANGAYS_OFFLINE[0];

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(false); // Default offline for disaster-first demonstration
  const [allBarangays] = useState<OfflineBarangay[]>(SAMPLE_BARANGAYS_OFFLINE);
  const [selectedBarangay, setSelectedBarangay] = useState<OfflineBarangay>(DEFAULT_BARANGAY);
  const [queuedReports, setQueuedReports] = useState<QueuedReport[]>([
    {
      id: "OFFLINE-RPT-001",
      barangayId: DEFAULT_BARANGAY.id,
      barangayName: DEFAULT_BARANGAY.name,
      reportType: "Shelter Inspection",
      description: "Inspected secondary school evacuation facility. Roof flashing intact, generator fuel refilled.",
      timestamp: "2026-10-26 14:30 PHT",
      latitude: DEFAULT_BARANGAY.center[1],
      longitude: DEFAULT_BARANGAY.center[0],
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
      isSynced: false
    };

    setQueuedReports((prev) => [newReport, ...prev]);

    // Only mark as synced after the server confirms the write.
    if (isOnline) {
      try {
        const res = await fetch(FIELD_REPORT_ENDPOINT, {
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
        if (res.ok) {
          setQueuedReports((prev) =>
            prev.map((rpt) => (rpt.id === newReport.id ? { ...rpt, isSynced: true } : rpt))
          );
        }
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
            const res = await fetch(FIELD_REPORT_ENDPOINT, {
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
            if (!res.ok) return rpt;
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
