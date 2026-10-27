import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useOffline } from '../context/OfflineContext';

// Safe Ionicons loader to support both Expo root and mobile directory configurations
let Ionicons: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Ionicons = require('@expo/vector-icons').Ionicons;
} catch {
  Ionicons = null;
}

export const getMviTier = (mvi: number) => {
  if (mvi > 70.0) {
    return {
      tier: 'High Risk Level',
      shortLabel: 'High Risk Level',
      bg: '#FFE4E6',
      border: '#FECDD3',
      text: '#BE123C',
      accent: '#E11D48',
    };
  }
  if (mvi > 50.0) {
    return {
      tier: 'Moderate Risk Level',
      shortLabel: 'Moderate Risk',
      bg: '#FEF3C7',
      border: '#FDE68A',
      text: '#B45309',
      accent: '#F59E0B',
    };
  }
  return {
    tier: 'Low Risk Level',
    shortLabel: 'Low Risk',
    bg: '#D1FAE5',
    border: '#A7F3D0',
    text: '#047857',
    accent: '#10B981',
  };
};

export const getClupCategory = (name: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('mabolo') || n.includes('sabang') || n.includes('calauag') || n.includes('san felipe')) {
    return {
      short: 'Riverine Flood Delta',
      full: 'RIVERINE & HIGH FLOOD-HAZARD DELTA',
      icon: '🌊',
      bg: '#FFEDD5',
      text: '#C2410C',
      badgeBg: '#EA580C',
    };
  }
  if (n.includes('panicuason') || n.includes('carolina') || n.includes('pacol') || n.includes('cararayan') || n.includes('san isidro')) {
    return {
      short: 'Upland Watershed',
      full: 'UPLAND WATERSHED & AGRO-FORESTRY',
      icon: '⛰️',
      bg: '#FEF9C3',
      text: '#854D0E',
      badgeBg: '#B59410',
    };
  }
  if (n.includes('triangulo') || n.includes('tabuco') || n.includes('san francisco') || n.includes('dinaga') || n.includes('santa cruz') || n.includes('igualdad')) {
    return {
      short: 'CBD Commercial',
      full: 'CENTRAL BUSINESS DISTRICT (CBD CORE)',
      icon: '🏢',
      bg: '#DBEAFE',
      text: '#1E40AF',
      badgeBg: '#05389F',
    };
  }
  if (n.includes('concepcion') || n.includes('del rosario') || n.includes('balatas')) {
    return {
      short: 'Growth Corridor',
      full: 'SUBURBAN GROWTH & INSTITUTIONAL CORRIDOR',
      icon: '🏥',
      bg: '#E0F2FE',
      text: '#0369A1',
      badgeBg: '#0284C7',
    };
  }
  return {
    short: 'Poblacion Heritage',
    full: 'POBLACION URBAN & HERITAGE CORE',
    icon: '🏛️',
    bg: '#F3E8FF',
    text: '#6B21A8',
    badgeBg: '#7C3AED',
  };
};

// Standardizes any SDG input into discrete "SDG #" badges, ensuring minimum 3 alignments
export const parseSdgBadges = (rawSdg: string): string[] => {
  if (!rawSdg) return ['SDG 11', 'SDG 13', 'SDG 1'];
  const matches = rawSdg.match(/\d+/g);
  let badges: string[] = [];
  if (matches && matches.length > 0) {
    const uniqueNums = Array.from(new Set(matches.map(Number)));
    badges = uniqueNums.map((num) => `SDG ${num}`);
  } else {
    badges = [rawSdg.trim()];
  }
  // User Requirement: Minimum of 3 SDG alignments generated and shown
  const priorityFallbacks = ['SDG 11', 'SDG 13', 'SDG 1', 'SDG 9', 'SDG 6', 'SDG 3', 'SDG 8', 'SDG 10', 'SDG 2'];
  for (const fb of priorityFallbacks) {
    if (badges.length >= 3) break;
    if (!badges.includes(fb)) {
      badges.push(fb);
    }
  }
  return badges;
};

export const BarangayCaptainScreen: React.FC = () => {
  const {
    selectedBarangay,
    setSelectedBarangayId,
    allBarangays,
    queuedReports,
    submitReport,
    proposals,
    endorseOrQueueProposal,
  } = useOffline();

  const [endorsedKeys, setEndorsedKeys] = useState<string[]>([]);

  // Filter approved/funded projects specifically assigned to this barangay
  const approvedProjectsForBarangay = useMemo(() => {
    const bName = (selectedBarangay.displayName || selectedBarangay.name || '').toLowerCase();
    const bId = selectedBarangay.id;
    return (proposals || []).filter((p) => {
      const isApproved = p.status === 'APPROVED' || p.status === 'FUNDED';
      if (!isApproved) return false;
      const target = (p.barangay || '').toLowerCase();
      return (
        target.includes(bName) ||
        target.includes(`brgy ${bId}`) ||
        target.includes(`barangay ${bId}`) ||
        target.includes((selectedBarangay.name || '').toLowerCase())
      );
    });
  }, [proposals, selectedBarangay]);

  const isProgramEndorsed = (programTitle: string) => {
    const key = `${selectedBarangay.id}::${programTitle}`;
    if (endorsedKeys.includes(key)) return true;
    return queuedReports.some(
      (r) =>
        r.barangayId === selectedBarangay.id &&
        r.reportType === 'Program Endorsement' &&
        r.description.includes(programTitle)
    );
  };

  const handleEndorseProgram = async (prog: any) => {
    const programTitle = typeof prog === 'string' ? prog : prog.program;
    if (isProgramEndorsed(programTitle)) return;
    const key = `${selectedBarangay.id}::${programTitle}`;
    setEndorsedKeys((prev) => [...prev, key]);

    const lat = selectedBarangay.center ? selectedBarangay.center[1] : 13.6218;
    const lng = selectedBarangay.center ? selectedBarangay.center[0] : 123.1948;

    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.displayName || selectedBarangay.name,
      reportType: 'Program Endorsement',
      description: `Barangay Council formally endorses LGU program: ${programTitle} for AIP 2026 inclusion.`,
      latitude: lat,
      longitude: lng,
      reporterRole: 'Barangay Captain',
    });

    if (endorseOrQueueProposal && typeof prog === 'object') {
      const sdgBadges = parseSdgBadges(prog.sdg);
      await endorseOrQueueProposal({
        barangay: selectedBarangay.displayName || selectedBarangay.name,
        office: prog.office || 'CPDO',
        title: prog.program,
        problem: `Sangguniang Barangay formal endorsement for ${selectedBarangay.name} prioritizing empirical CBMS deficits under ${prog.statute}.`,
        statute: prog.statute || 'RA 7160',
        section: 'Sec. 389 / Sec. 17',
        sdgs: sdgBadges,
        budget: prog.budget_numeric || 350000,
      });
    }
  };

  const currentTier = getMviTier(selectedBarangay.vulnerability_index);
  const category = getClupCategory(selectedBarangay.name);

  // Dynamically merge base recommendations with all proposals created or assigned to this barangay (NO LIMIT, ALL UNIQUE)
  const recommendedList = useMemo(() => {
    const bName = (selectedBarangay.name || "").toLowerCase();
    const bId = selectedBarangay.id;
    const baseList = selectedBarangay.recommended_programs || [];

    const extraFromProposals = proposals
      .filter((p) => {
        const target = (p.assigned_barangay || p.barangay || "").toLowerCase();
        return (
          target.includes(bName) ||
          target.includes(`barangay ${bId}`) ||
          target.includes(`brgy ${bId}`) ||
          (bId === 3 && target.includes("bagumbayan sur")) ||
          (bId === 16 && target.includes("mabolo"))
        );
      })
      .map((p) => ({
        office: p.office,
        program: p.title,
        statute: `${p.statute} (${p.section})`,
        sdg: (p.sdgs || []).join(" • "),
        estimated_budget: `₱${(p.budget || 250000).toLocaleString()}`,
        budget_numeric: p.budget || 250000,
      }));

    // Deduplicate by program title to guarantee all programs in each barangay are completely unique
    const seen = new Set<string>();
    const uniquePrograms: typeof baseList = [];
    for (const item of [...baseList, ...extraFromProposals]) {
      const normalizedTitle = item.program.trim().toLowerCase();
      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        uniquePrograms.push(item);
      }
    }

    return uniquePrograms;
  }, [selectedBarangay, proposals]);

  const [programPage, setProgramPage] = useState<number>(1);
  const PROGRAMS_PER_PAGE = 3;

  useEffect(() => {
    setProgramPage(1);
  }, [selectedBarangay.id]);

  const totalProgramPages = Math.max(1, Math.ceil(recommendedList.length / PROGRAMS_PER_PAGE));
  const currentProgramPage = Math.min(programPage, totalProgramPages);
  const paginatedPrograms = useMemo(() => {
    const start = (currentProgramPage - 1) * PROGRAMS_PER_PAGE;
    return recommendedList.slice(start, start + PROGRAMS_PER_PAGE);
  }, [recommendedList, currentProgramPage]);

  const endorsedCountForBarangay = recommendedList.filter((p) =>
    isProgramEndorsed(p.program)
  ).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Barangay Filter Strip */}
      <View style={styles.filterBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScrollContent}>
          {allBarangays.map((b) => {
            const active = selectedBarangay.id === b.id;
            const bTier = getMviTier(b.vulnerability_index);
            return (
              <TouchableOpacity
                key={b.id}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelectedBarangayId(b.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.pillDot, { backgroundColor: active ? '#FFFFFF' : bTier.accent }]} />
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{b.name}</Text>
                <View style={[styles.pillScoreTag, active && styles.pillScoreTagActive]}>
                  <Text style={[styles.pillScoreText, active && styles.pillScoreTextActive]}>
                    {b.vulnerability_index}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Inspector Card */}
      <View style={styles.inspectorCard}>
        <View style={styles.inspectorHeaderRow}>
          <View style={[styles.numberBadge, { backgroundColor: category.badgeBg }]}>
            <Text style={styles.numberBadgeText}>{selectedBarangay.id}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.screenTitle}>{selectedBarangay.name}</Text>
              <Text style={styles.idSubText}>#{selectedBarangay.id}</Text>
            </View>
            <Text style={[styles.sectorSubtitle, { color: category.text }]}>{category.full}</Text>
          </View>
          <View style={[styles.categoryPastelPill, { backgroundColor: category.bg }]}>
            <Text style={styles.categoryEmoji}>{category.icon}</Text>
            <Text style={[styles.categoryPastelText, { color: category.text }]}>{category.short}</Text>
          </View>
        </View>

        {/* Risk & Empirical MVI Row */}
        <View style={styles.statusBadgesRow}>
          <View style={[styles.riskBadge, { backgroundColor: currentTier.bg, borderColor: currentTier.border }]}>
            <View style={[styles.riskDot, { backgroundColor: currentTier.accent }]} />
            <Text style={[styles.riskBadgeText, { color: currentTier.text }]}>{currentTier.shortLabel}</Text>
          </View>

          <View style={styles.empiricalMviBadge}>
            <Text style={styles.empiricalMviText}>Empirical MVI: {selectedBarangay.vulnerability_index}</Text>
          </View>
        </View>

        {/* 2-Column Households & Population Boxes */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>HOUSEHOLDS</Text>
            <Text style={styles.statValue}>{(selectedBarangay.total_households || 0).toLocaleString()} HHs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>POPULATION</Text>
            <Text style={styles.statValue}>{(selectedBarangay.total_population || 0).toLocaleString()} Pop</Text>
          </View>
        </View>

        {/* Priority Barangay Deficits */}
        <View style={styles.deficitsSection}>
          <Text style={styles.subSectionLabel}>DETECTED CBMS SIGNALS & DEFICITS</Text>
          {(selectedBarangay.top_needs || []).map((need, idx) => (
            <View
              key={idx}
              style={[styles.needRow, idx === (selectedBarangay.top_needs?.length || 0) - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.needLeft}>
                <View
                  style={[
                    styles.signalDot,
                    { backgroundColor: idx === 0 ? '#E11D48' : idx === 1 ? '#05389F' : '#EA580C' },
                  ]}
                />
                <Text style={styles.needText}>{need}</Text>
              </View>
              <Text
                style={[
                  styles.signalPriorityTag,
                  { color: idx === 0 ? '#BE123C' : idx === 1 ? '#05389F' : '#C2410C' },
                ]}
              >
                Priority #{idx + 1}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recommended Action Plans */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Recommended Action Plans</Text>
            <Text style={styles.sectionDesc}>Statutory programs aligned with 2026 City AIP & UN SDGs (Min 3 Alignments)</Text>
          </View>
          {endorsedCountForBarangay > 0 && (
            <View style={styles.endorsedCounterBadge}>
              <Text style={styles.endorsedCounterText}>
                {endorsedCountForBarangay}/{recommendedList.length} Endorsed
              </Text>
            </View>
          )}
        </View>

        {paginatedPrograms.map((prog, idx) => {
          const endorsed = isProgramEndorsed(prog.program);
          const sdgBadges = parseSdgBadges(prog.sdg);

          return (
            <View key={idx} style={[styles.progCard, endorsed && styles.progCardEndorsed]}>
              <View style={styles.progTopRow}>
                <View style={styles.officeBadge}>
                  <Text style={styles.officeBadgeText}>{prog.office}</Text>
                </View>

                {/* Standardized Discrete SDG Pills (Minimum 3 Badges) */}
                <View style={styles.sdgContainer}>
                  {sdgBadges.map((sdgLabel, sIdx) => (
                    <View key={sIdx} style={styles.sdgBadge}>
                      <Text style={styles.sdgText}>{sdgLabel}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.progTitle}>{prog.program}</Text>

              <View style={styles.statutePill}>
                {Ionicons ? (
                  <Ionicons name="scale-outline" size={12} color="#05389F" />
                ) : (
                  <Text style={{ fontSize: 12 }}>⚖️</Text>
                )}
                <Text style={styles.progStatute}>{prog.statute}</Text>
              </View>

              <View style={styles.progFooter}>
                <View>
                  <Text style={styles.budgetLabel}>ESTIMATED BUDGET</Text>
                  <Text style={styles.budgetValue}>{prog.estimated_budget}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.endorseBtn, endorsed && styles.endorseBtnDone]}
                  onPress={() => handleEndorseProgram(prog)}
                  disabled={endorsed}
                  activeOpacity={0.8}
                >
                  {Ionicons ? (
                    <Ionicons
                      name={endorsed ? 'checkmark-circle' : 'sparkles'}
                      size={15}
                      color={endorsed ? '#047857' : '#FFFFFF'}
                      style={{ marginRight: 6 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 13, marginRight: 5 }}>{endorsed ? '✓' : '✨'}</Text>
                  )}
                  <Text style={[styles.endorseBtnText, endorsed && styles.endorseBtnTextDone]}>
                    {endorsed ? 'Endorsed' : 'Endorse Plan →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {totalProgramPages > 1 && (
          <View style={styles.paginationRow}>
            <TouchableOpacity
              disabled={currentProgramPage <= 1}
              onPress={() => setProgramPage((p) => Math.max(1, p - 1))}
              style={[styles.pageBtn, currentProgramPage <= 1 && styles.pageBtnDisabled]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageBtnText, currentProgramPage <= 1 && styles.pageBtnTextDisabled]}>‹ Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfoText}>
              Page {currentProgramPage} of {totalProgramPages} ({recommendedList.length} Unique Programs)
            </Text>
            <TouchableOpacity
              disabled={currentProgramPage >= totalProgramPages}
              onPress={() => setProgramPage((p) => Math.min(totalProgramPages, p + 1))}
              style={[styles.pageBtn, currentProgramPage >= totalProgramPages && styles.pageBtnDisabled]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageBtnText, currentProgramPage >= totalProgramPages && styles.pageBtnTextDisabled]}>Next ›</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── ASSIGNED & APPROVED BARANGAY PROJECT QUEUE ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.sectionTitle}>Approved Barangay Project Queue</Text>
              <View style={[styles.assignedBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={[styles.assignedBadgeText, { color: '#047857' }]}>
                  {approvedProjectsForBarangay.length} Assigned to {selectedBarangay.name}
                </Text>
              </View>
            </View>
            <Text style={styles.sectionDesc}>
              AIP programs officially approved and assigned for {selectedBarangay.name} council execution
            </Text>
          </View>
        </View>

        {approvedProjectsForBarangay.length === 0 ? (
          <View style={styles.emptyQueueCard}>
            <Text style={styles.emptyQueueIcon}>🏛️</Text>
            <Text style={styles.emptyQueueTitle}>No Approved Projects in Queue Yet</Text>
            <Text style={styles.emptyQueueSub}>
              Endorse an action plan above for City Hall executive sign-off, or approve a proposal in the Web Deck to assign it to {selectedBarangay.name}.
            </Text>
          </View>
        ) : (
          approvedProjectsForBarangay.map((ap, apIdx) => {
            const apSdgBadges = parseSdgBadges(ap.sdgs?.join(' ') || '');
            return (
              <View key={ap.id || apIdx} style={styles.approvedCard}>
                <View style={styles.progTopRow}>
                  <View style={styles.approvedOfficeBadge}>
                    <Text style={styles.approvedOfficeText}>{ap.office}</Text>
                  </View>

                  <View style={styles.assignedBadge}>
                    <Text style={styles.assignedBadgeText}>✓ ASSIGNED TO {selectedBarangay.name.toUpperCase()}</Text>
                  </View>
                </View>

                <Text style={styles.approvedTitle}>{ap.title}</Text>
                {ap.problem ? (
                  <Text style={styles.approvedProblemText} numberOfLines={2}>
                    {ap.problem}
                  </Text>
                ) : null}

                {/* Standardized Discrete SDG Pills (Min 3) */}
                <View style={[styles.sdgContainer, { marginBottom: 10, marginTop: 6 }]}>
                  {apSdgBadges.map((sdgLabel, sIdx) => (
                    <View key={sIdx} style={[styles.sdgBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                      <Text style={[styles.sdgText, { color: '#92400E' }]}>{sdgLabel}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.statutePill}>
                  <Text style={styles.progStatute}>⚖️ {ap.statute} ({ap.section || 'Sec. 17 / Sec. 389'})</Text>
                </View>

                <View style={styles.approvedFooter}>
                  <View>
                    <Text style={styles.budgetLabel}>APPROVED ALLOTMENT</Text>
                    <Text style={[styles.budgetValue, { color: '#047857' }]}>
                      ₱{Number(ap.budget || 0).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.stagePill}>
                    <Text style={styles.stagePillText}>
                      {ap.status === 'FUNDED' ? 'Fund Disbursed' : 'Ready for Execution'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { paddingBottom: 32 },
  filterBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pillScrollContent: { paddingRight: 8, gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
    gap: 6,
  },
  pillActive: { backgroundColor: '#05389F' },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { color: '#374151', fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },
  pillScoreTag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  pillScoreTagActive: { backgroundColor: '#1E40AF' },
  pillScoreText: { color: '#4B5563', fontSize: 10, fontWeight: '700' },
  pillScoreTextActive: { color: '#FFFFFF' },

  inspectorCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inspectorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  screenTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  idSubText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  sectorSubtitle: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3, marginTop: 1 },
  categoryPastelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  categoryEmoji: { fontSize: 10 },
  categoryPastelText: { fontSize: 10, fontWeight: '700' },

  statusBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  riskDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  riskBadgeText: { fontSize: 11, fontWeight: '700' },
  empiricalMviBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  empiricalMviText: { color: '#05389F', fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  statValue: { color: '#0F172A', fontSize: 17, fontWeight: '800', marginTop: 4, letterSpacing: -0.3 },

  deficitsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  subSectionLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  needRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  needLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  signalDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  needText: { color: '#334155', fontSize: 13, fontWeight: '500', flex: 1 },
  signalPriorityTag: { fontSize: 11, fontWeight: '700' },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { color: '#0F172A', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  sectionDesc: { color: '#64748B', fontSize: 12, fontWeight: '400', marginTop: 1 },
  endorsedCounterBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  endorsedCounterText: { color: '#047857', fontSize: 11, fontWeight: '700' },

  progCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progCardEndorsed: { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' },
  progTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  officeBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  officeBadgeText: { color: '#05389F', fontSize: 10, fontWeight: '700' },

  sdgContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  sdgBadge: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  sdgText: { color: '#854D0E', fontSize: 10, fontWeight: '700' },

  progTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  statutePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
    marginBottom: 14,
  },
  progStatute: { color: '#05389F', fontSize: 11, fontWeight: '600' },
  progFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  budgetLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  budgetValue: { color: '#0F172A', fontSize: 16, fontWeight: '800', marginTop: 2 },
  endorseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#05389F',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  endorseBtnDone: { backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#A7F3D0' },
  endorseBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  endorseBtnTextDone: { color: '#047857' },

  emptyQueueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 14,
  },
  emptyQueueIcon: { fontSize: 26, marginBottom: 8 },
  emptyQueueTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 4 },
  emptyQueueSub: { fontSize: 11, color: '#64748B', textAlign: 'center', lineHeight: 16 },

  approvedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  approvedOfficeBadge: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  approvedOfficeText: { color: '#15803D', fontSize: 10, fontWeight: '800' },
  assignedBadge: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  assignedBadgeText: { color: '#047857', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },

  approvedTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  approvedProblemText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },
  approvedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  stagePill: {
    backgroundColor: '#05389F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  stagePillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageBtn: {
    backgroundColor: '#05389F',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  pageBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  pageBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pageBtnTextDisabled: {
    color: '#94A3B8',
  },
  pageInfoText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
});
