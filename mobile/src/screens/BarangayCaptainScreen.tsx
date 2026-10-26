import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../context/OfflineContext';

export const getMviTier = (mvi: number) => {
  if (mvi > 70.0) {
    return { tier: 'CRITICAL VULNERABILITY', shortLabel: 'CRITICAL', bg: '#FFE4E6', border: '#FECDD3', text: '#9F1239', accent: '#E11D48' };
  }
  if (mvi > 50.0) {
    return { tier: 'MODERATE VULNERABILITY', shortLabel: 'MODERATE', bg: '#FEF9E7', border: '#FDE68A', text: '#B45309', accent: '#F59E0B' };
  }
  return { tier: 'LOW VULNERABILITY', shortLabel: 'RESILIENT', bg: '#D1FAE5', border: '#A7F3D0', text: '#065F46', accent: '#10B981' };
};

export const BarangayCaptainScreen: React.FC = () => {
  const { selectedBarangay, setSelectedBarangayId, allBarangays, queuedReports, submitReport } = useOffline();
  const [endorsedKeys, setEndorsedKeys] = useState<string[]>([]);

  const isProgramEndorsed = (programTitle: string) => {
    const key = `${selectedBarangay.id}::${programTitle}`;
    if (endorsedKeys.includes(key)) return true;
    return queuedReports.some((r) => r.barangayId === selectedBarangay.id && r.reportType === 'Program Endorsement' && r.description.includes(programTitle));
  };

  const handleEndorseProgram = async (programTitle: string) => {
    if (isProgramEndorsed(programTitle)) return;
    const key = `${selectedBarangay.id}::${programTitle}`;
    setEndorsedKeys((prev) => [...prev, key]);

    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.name,
      reportType: 'Program Endorsement',
      description: `Barangay Council formally endorses LGU program: ${programTitle} for AIP 2026 inclusion.`,
      latitude: 13.6218,
      longitude: 123.1948,
    });
  };

  const currentTier = getMviTier(selectedBarangay.vulnerability_index);
  const endorsedCountForBarangay = selectedBarangay.recommended_programs.filter((p) => isProgramEndorsed(p.program)).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerSection}>
        <View style={styles.headerTopRow}>
          <Text style={styles.eyebrow}>BARANGAY CAPTAIN PORTAL</Text>
          <View style={[styles.mviBadge, { backgroundColor: currentTier.bg, borderColor: currentTier.border }]}>
            <View style={[styles.mviDot, { backgroundColor: currentTier.accent }]} />
            <Text style={[styles.mviBadgeText, { color: currentTier.text }]}>{currentTier.shortLabel}</Text>
          </View>
        </View>

        <Text style={styles.screenTitle}>{selectedBarangay.name}</Text>
        <Text style={styles.screenSubtitle}>CBMS Vulnerability & AIP Alignment Profile</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScrollContent}>
          {allBarangays.map((b) => {
            const active = selectedBarangay.id === b.id;
            const bTier = getMviTier(b.vulnerability_index);
            return (
              <TouchableOpacity key={b.id} style={[styles.pill, active && styles.pillActive]} onPress={() => setSelectedBarangayId(b.id)} activeOpacity={0.75}>
                <View style={[styles.pillDot, { backgroundColor: bTier.accent }]} />
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: currentTier.bg, borderColor: currentTier.border }]}>
          <Text style={[styles.statLabel, { color: currentTier.text }]}>MVI Score</Text>
          <Text style={[styles.statValue, { color: currentTier.text }]}>{selectedBarangay.vulnerability_index}</Text>
          <Text style={[styles.statHint, { color: currentTier.text }]}>{currentTier.shortLabel}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Households</Text>
          <Text style={styles.statValue}>{selectedBarangay.total_households.toLocaleString()}</Text>
          <Text style={styles.statHint}>Surveyed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Population</Text>
          <Text style={styles.statValue}>{selectedBarangay.total_population.toLocaleString()}</Text>
          <Text style={styles.statHint}>Residents</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority Barangay Deficits</Text>
        <Text style={styles.sectionDesc}>Empirical gaps derived from PSA CBMS indicators</Text>
        <View style={styles.cardGroup}>
          {selectedBarangay.top_needs.map((need, idx) => (
            <View key={idx} style={[styles.needRow, idx === selectedBarangay.top_needs.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.needIndexBadge}><Text style={styles.needIndexText}>{idx + 1}</Text></View>
              <Text style={styles.needText}>{need}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Recommended Action Plans</Text>
            <Text style={styles.sectionDesc}>Endorse programs to queue for the 2026 City AIP</Text>
          </View>
          {endorsedCountForBarangay > 0 && (
            <View style={styles.endorsedCounterBadge}>
              <Text style={styles.endorsedCounterText}>{endorsedCountForBarangay}/{selectedBarangay.recommended_programs.length} ENDORSED</Text>
            </View>
          )}
        </View>

        {selectedBarangay.recommended_programs.map((prog, idx) => {
          const endorsed = isProgramEndorsed(prog.program);
          return (
            <View key={idx} style={[styles.progCard, endorsed && styles.progCardEndorsed]}>
              <View style={styles.progTopRow}>
                <View style={styles.officeBadge}><Text style={styles.officeBadgeText}>{prog.office}</Text></View>
                <Text style={styles.sdgText}>{prog.sdg}</Text>
              </View>
              <Text style={styles.progTitle}>{prog.program}</Text>
              <Text style={styles.progStatute}>Legal Mandate: {prog.statute}</Text>
              <View style={styles.progFooter}>
                <View>
                  <Text style={styles.budgetLabel}>ESTIMATED BUDGET</Text>
                  <Text style={styles.budgetValue}>{prog.estimated_budget}</Text>
                </View>
                <TouchableOpacity style={[styles.endorseBtn, endorsed && styles.endorseBtnDone]} onPress={() => handleEndorseProgram(prog.program)} disabled={endorsed} activeOpacity={0.8}>
                  <Ionicons name={endorsed ? 'checkmark-circle' : 'paper-plane-outline'} size={16} color={endorsed ? '#065F46' : '#FFFFFF'} style={{ marginRight: 6 }} />
                  <Text style={[styles.endorseBtnText, endorsed && styles.endorseBtnTextDone]}>{endorsed ? 'Endorsed' : 'Endorse Plan'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { paddingBottom: 32 },
  headerSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  eyebrow: { color: '#2563EB', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  mviBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  mviDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  mviBadgeText: { fontSize: 10, fontWeight: '800' },
  screenTitle: { color: '#0F172A', fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  screenSubtitle: { color: '#475569', fontSize: 13, fontWeight: '500', marginTop: 2, marginBottom: 14 },
  pillScrollContent: { paddingRight: 8, gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  pillActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  pillDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  pillText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  statLabel: { color: '#64748B', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  statValue: { color: '#0F172A', fontSize: 20, fontWeight: '800', marginTop: 4 },
  statHint: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginTop: 2 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  sectionDesc: { color: '#475569', fontSize: 13, fontWeight: '500', marginTop: 2, marginBottom: 12 },
  endorsedCounterBadge: { backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#A7F3D0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  endorsedCounterText: { color: '#065F46', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardGroup: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14 },
  needRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  needIndexBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  needIndexText: { color: '#2563EB', fontSize: 12, fontWeight: '800' },
  needText: { flex: 1, color: '#1E293B', fontSize: 14, fontWeight: '600' },
  progCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  progCardEndorsed: { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' },
  progTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  officeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  officeBadgeText: { color: '#1D4ED8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  sdgText: { color: '#065F46', fontSize: 11, fontWeight: '700' },
  progTitle: { color: '#0F172A', fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  progStatute: { color: '#64748B', fontSize: 12, fontWeight: '500', marginBottom: 14 },
  progFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  budgetLabel: { color: '#64748B', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  budgetValue: { color: '#0F172A', fontSize: 15, fontWeight: '800', marginTop: 1 },
  endorseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  endorseBtnDone: { backgroundColor: '#D1FAE5', borderWidth: 1, borderColor: '#A7F3D0' },
  endorseBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  endorseBtnTextDone: { color: '#065F46' },
});