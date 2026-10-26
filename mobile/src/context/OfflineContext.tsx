import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SAMPLE_BARANGAYS_OFFLINE, OfflineBarangay, BARANGAY_CATEGORIES } from '../data/offlineData';
import {
  FIELD_REPORT_ENDPOINT,
  FIELD_REPORTS_LIST_ENDPOINT,
  PROPOSALS_ENDPOINT,
} from '../config/api';

export type MobileRole = 'barangay_captain' | 'citizen';

export interface QueuedReport {
  id: string;
  barangayId: number;
  barangayName: string;
  reportType: string;
  description: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  reporterRole: string;
  isSynced: boolean;
}

export interface MobileProposal {
  id: string;
  barangay: string;
  office: string;
  title: string;
  problem: string;
  statute: string;
  section: string;
  sdgs: string[];
  budget: number;
  status: 'PENDING' | 'APPROVED' | 'FUNDED' | 'REJECTED';
  confidence: number;
  createdBy?: string;
}

interface OfflineContextType {
  isOnline: boolean;
  toggleNetwork: () => void;
  mobileRole: MobileRole;
  setMobileRole: (role: MobileRole) => void;
  selectedCategoryFilter: string;
  handleSelectCategory: (category: string) => void;
  cycleBarangay: (direction: 'next' | 'prev') => void;
  calamitySimActive: boolean;
  setCalamitySimActive: (active: boolean) => void;
  queuedReports: QueuedReport[];
  submitReport: (
    report: Omit<QueuedReport, 'id' | 'timestamp' | 'isSynced' | 'reporterRole'> & { reporterRole?: string }
  ) => Promise<void>;
  syncOutbox: () => Promise<number>;
  proposals: MobileProposal[];
  endorseOrQueueProposal: (draft: {
    barangay: string;
    office: string;
    title: string;
    problem: string;
    statute: string;
    section?: string;
    sdgs: string[];
    budget: number;
  }) => Promise<void>;
  refreshLiveSync: () => Promise<void>;
  selectedBarangay: OfflineBarangay;
  setSelectedBarangayId: (id: number) => void;
  allBarangays: OfflineBarangay[];
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const DEFAULT_BARANGAY =
  SAMPLE_BARANGAYS_OFFLINE.find((b) => b.id === 16) ??
  SAMPLE_BARANGAYS_OFFLINE.find((b) => b.id === 3) ??
  SAMPLE_BARANGAYS_OFFLINE[0];

const INITIAL_PROPOSALS: MobileProposal[] = [
  {
    id: 'PROP-NAGA-2026-CEO-002',
    barangay: 'Mabolo (Brgy 16)',
    office: 'CEO',
    title: 'Piped Water Reticulation Mainline Extension & Communal Sanitation Block',
    problem: 'High refilling station dependency and unimproved toilet facilities across 1,779 responding households.',
    statute: 'RA 7160 (Local Government Code)',
    section: 'Section 17 (b) (1)',
    sdgs: ['SDG 6 Clean Water & Sanitation', 'SDG 9 Industry & Infrastructure'],
    budget: 1250000,
    status: 'PENDING',
    confidence: 0.93,
    createdBy: 'CEO Infrastructure Agent',
  },
  {
    id: 'PROP-NAGA-2026-CHO-003',
    barangay: 'Mabolo (Brgy 16)',
    office: 'CHO',
    title: 'Food Insecurity Verification Mission & Water Bacteriological Testing',
    problem: 'Extreme food-insecurity reading outlier (1,459 worried households) and water quality risk requires clinical validation.',
    statute: 'RA 11223 (Universal Health Care Act)',
    section: 'Section 19',
    sdgs: ['SDG 2 Zero Hunger', 'SDG 3 Good Health'],
    budget: 280000,
    status: 'PENDING',
    confidence: 0.91,
    createdBy: 'CHO Health Agent',
  },
  {
    id: 'PROP-NAGA-2026-DRRMO-001',
    barangay: 'Bagumbayan Sur (Brgy 3)',
    office: 'DRRMO',
    title: 'Comprehensive BDRRM Plan Formulation & 24/7 Hotline Activation',
    problem: 'Barangay has 1,508 households but lacks a written DRRM plan and emergency hotline, exposing residents to river surge.',
    statute: 'RA 10121',
    section: 'Section 12 (c) (6)',
    sdgs: ['SDG 11 Sustainable Cities', 'SDG 13 Climate Action'],
    budget: 185000,
    status: 'APPROVED',
    confidence: 0.96,
    createdBy: 'DRRMO Statutory Agent',
  },
  {
    id: 'PROP-NAGA-2026-SWO-004',
    barangay: 'Abella (Brgy 1)',
    office: 'SWO',
    title: 'Digital Cash-Aid Payout Enrollment & NEET Youth Skills Placement',
    problem: '33.4% unbanked households (356 HHs) and 137 NEET youth requiring targeted social safety net integration.',
    statute: 'RA 11310 (4Ps Act)',
    section: 'Section 13',
    sdgs: ['SDG 1 No Poverty', 'SDG 8 Decent Work'],
    budget: 340000,
    status: 'PENDING',
    confidence: 0.94,
    createdBy: 'SWO Social Welfare Agent',
  },
];

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [mobileRole, setMobileRole] = useState<MobileRole>('barangay_captain');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [calamitySimActive, setCalamitySimActive] = useState<boolean>(false);
  const [allBarangays] = useState<OfflineBarangay[]>(SAMPLE_BARANGAYS_OFFLINE);
  const [selectedBarangay, setSelectedBarangay] = useState<OfflineBarangay>(DEFAULT_BARANGAY);
  const [proposals, setProposals] = useState<MobileProposal[]>(INITIAL_PROPOSALS);
  const [queuedReports, setQueuedReports] = useState<QueuedReport[]>([
    {
      id: 'RPT-NAGA-0001',
      barangayId: 16,
      barangayName: 'Mabolo (Brgy 16)',
      reportType: 'Shelter Inspection',
      description: 'Inspected secondary school evacuation facility. Roof flashing intact, generator fuel refilled.',
      timestamp: '14:30 PHT',
      latitude: 13.6202,
      longitude: 123.1808,
      reporterRole: 'Barangay Captain',
      isSynced: true,
    },
    {
      id: 'RPT-NAGA-0002',
      barangayId: 3,
      barangayName: 'Bagumbayan Sur (Brgy 3)',
      reportType: 'Flood Clearance',
      description: 'Naga River tributary overflow clearance verified. Culvert clearing crew deployed.',
      timestamp: '15:15 PHT',
      latitude: 13.6235,
      longitude: 123.1905,
      reporterRole: 'Citizen Resident',
      isSynced: false,
    },
  ]);

  const toggleNetwork = () => {
    setIsOnline((prev) => !prev);
  };

  const setSelectedBarangayId = useCallback(
    (id: number) => {
      const found = allBarangays.find((b) => b.id === id);
      if (found) {
        setSelectedBarangay(found);
        const targetCat = BARANGAY_CATEGORIES[id]?.id;
        if (selectedCategoryFilter !== 'all' && targetCat && targetCat !== selectedCategoryFilter) {
          setSelectedCategoryFilter('all');
        }
      }
    },
    [allBarangays, selectedCategoryFilter]
  );

  const handleSelectCategory = useCallback(
    (category: string) => {
      setSelectedCategoryFilter(category);
      if (category === 'all') return;
      const currentCat = BARANGAY_CATEGORIES[selectedBarangay.id]?.id;
      if (currentCat !== category) {
        const defaultRepresentative: Record<string, number> = {
          upland: 18,
          cbd: 27,
          poblacion: 3,
          growth: 9,
          riverine: 16,
        };
        const targetId = defaultRepresentative[category];
        if (targetId) {
          const found = allBarangays.find((b) => b.id === targetId);
          if (found) setSelectedBarangay(found);
        }
      }
    },
    [selectedBarangay.id, allBarangays]
  );

  const cycleBarangay = useCallback(
    (direction: 'next' | 'prev') => {
      const idx = allBarangays.findIndex((b) => b.id === selectedBarangay.id);
      if (idx === -1) return;
      const nextIdx =
        direction === 'next'
          ? (idx + 1) % allBarangays.length
          : (idx - 1 + allBarangays.length) % allBarangays.length;
      setSelectedBarangayId(allBarangays[nextIdx].id);
    },
    [allBarangays, selectedBarangay.id, setSelectedBarangayId]
  );

  const refreshLiveSync = useCallback(async () => {
    if (!isOnline) return;
    try {
      const [propsRes, rptsRes] = await Promise.all([
        fetch(PROPOSALS_ENDPOINT),
        fetch(FIELD_REPORTS_LIST_ENDPOINT),
      ]);
      if (propsRes.ok) {
        const propsData = await propsRes.json();
        if (Array.isArray(propsData) && propsData.length > 0) {
          setProposals(
            propsData.map((p: any) => ({
              id: p.id,
              barangay: p.barangay,
              office: p.office,
              title: p.title,
              problem: p.problem_statement || p.problem || '',
              statute: p.statutory_basis?.law || p.statute || 'RA 7160',
              section: p.statutory_basis?.section || p.section || 'Section 17',
              sdgs: p.sdgs || ['SDG 11 Sustainable Cities'],
              budget: Number(p.estimated_budget_php || p.budget || 250000),
              status: p.status === 'PROPOSED' ? 'PENDING' : p.status,
              confidence: p.confidence_score || p.confidence || 0.94,
              createdBy: p.created_by,
            }))
          );
        }
      }
      if (rptsRes.ok) {
        const rptsData = await rptsRes.json();
        if (Array.isArray(rptsData) && rptsData.length > 0) {
          const syncedFromServer: QueuedReport[] = rptsData.map((r: any) => ({
            id: r.id,
            barangayId: r.barangay_id || 16,
            barangayName: r.barangay_name || 'Naga City',
            reportType: r.report_type || 'Field Inspection',
            description: r.description || '',
            timestamp: r.offline_created_at || 'Synced',
            latitude: r.latitude || 13.6218,
            longitude: r.longitude || 123.1948,
            reporterRole: r.reporter_role || 'Barangay Captain',
            isSynced: true,
          }));
          setQueuedReports((prev) => {
            const unsynced = prev.filter((item) => !item.isSynced);
            return [...unsynced, ...syncedFromServer];
          });
        }
      }
    } catch {
      // Fallback to local state when backend is unreachable
    }
  }, [isOnline]);

  useEffect(() => {
    refreshLiveSync();
  }, [refreshLiveSync]);

  const submitReport = async (
    reportData: Omit<QueuedReport, 'id' | 'timestamp' | 'isSynced' | 'reporterRole'> & { reporterRole?: string }
  ) => {
    const roleLabel =
      reportData.reporterRole ||
      (mobileRole === 'barangay_captain' ? 'Barangay Captain' : 'Citizen Resident');
    const newReport: QueuedReport = {
      ...reportData,
      reporterRole: roleLabel,
      id: `RPT-MOB-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' PHT',
      isSynced: false,
    };

    setQueuedReports((prev) => [newReport, ...prev]);

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
            offline_created_at: newReport.timestamp,
            reporter_role: roleLabel,
          }),
        });
        if (res.ok) {
          setQueuedReports((prev) =>
            prev.map((rpt) => (rpt.id === newReport.id ? { ...rpt, isSynced: true } : rpt))
          );
          await refreshLiveSync();
        }
      } catch {
        // Stored in offline outbox
      }
    }
  };

  const endorseOrQueueProposal = async (draft: {
    barangay: string;
    office: string;
    title: string;
    problem: string;
    statute: string;
    section?: string;
    sdgs: string[];
    budget: number;
  }) => {
    const newProp: MobileProposal = {
      id: `PROP-CAP-${Date.now().toString().slice(-4)}`,
      barangay: draft.barangay,
      office: draft.office.toUpperCase(),
      title: draft.title,
      problem: draft.problem,
      statute: draft.statute,
      section: draft.section || 'Sec. 389 / Sec. 17',
      sdgs: draft.sdgs,
      budget: draft.budget,
      status: 'PENDING',
      confidence: 0.96,
      createdBy: `Punong Barangay (${selectedBarangay.realName})`,
    };

    setProposals((prev) => [newProp, ...prev]);

    if (isOnline) {
      try {
        await fetch(PROPOSALS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newProp.id,
            barangay: newProp.barangay,
            office: newProp.office,
            title: newProp.title,
            problem_statement: newProp.problem,
            statutory_basis: {
              law: newProp.statute,
              section: newProp.section,
              citation: 'Endorsed via Project Banwaan Mobile App by Punong Barangay.',
            },
            sdgs: newProp.sdgs,
            estimated_budget_php: newProp.budget,
            confidence_score: newProp.confidence,
            created_by: newProp.createdBy,
          }),
        });
        await refreshLiveSync();
      } catch {
        // Optimistic local proposal retained
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
                offline_created_at: rpt.timestamp,
                reporter_role: rpt.reporterRole,
              }),
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
    await refreshLiveSync();
    return syncedCount;
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        toggleNetwork,
        mobileRole,
        setMobileRole,
        selectedCategoryFilter,
        handleSelectCategory,
        cycleBarangay,
        calamitySimActive,
        setCalamitySimActive,
        queuedReports,
        submitReport,
        syncOutbox,
        proposals,
        endorseOrQueueProposal,
        refreshLiveSync,
        selectedBarangay,
        setSelectedBarangayId,
        allBarangays,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within an OfflineProvider');
  return context;
};
