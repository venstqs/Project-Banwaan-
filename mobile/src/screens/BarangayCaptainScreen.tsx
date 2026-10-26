import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useOffline } from '../context/OfflineContext';

export const BarangayCaptainScreen: React.FC = () => {
  const { selectedBarangay, setSelectedBarangayId, allBarangays, isOnline, submitReport } = useOffline();
  const [requestSent, setRequestSent] = useState<string | null>(null);

  const handleEndorseProgram = async (programTitle: string) => {
    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.name,
      reportType: "Program Endorsement",
      description: `Barangay Council formally endorses LGU program: ${programTitle} for AIP 2026 inclusion.`,
      latitude: 13.6218,
      longitude: 123.1948
    });
    setRequestSent(programTitle);
    setTimeout(() => setRequestSent(null), 4000);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Barangay Header with PSA Blue & Gold */}
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <Text style={styles.roleBadge}>BARANGAY CAPTAIN PORTAL</Text>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10b981' : '#fdb813' }]} />
          <Text style={styles.statusText}>{isOnline ? 'Online Sync Active' : 'Offline Mode (Local Cache)'}</Text>
        </View>
        <Text style={styles.title}>{selectedBarangay.name}</Text>
        <Text style={styles.subtitle}>Naga City, Camarines Sur • PSA CBMS Profile Summary</Text>

        {/* Barangay Selector Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
          {allBarangays.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.pill, selectedBarangay.id === b.id && styles.pillActive]}
              onPress={() => setSelectedBarangayId(b.id)}
            >
              <Text style={[styles.pillText, selectedBarangay.id === b.id && styles.pillTextActive]}>
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vulnerability & Key Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Vulnerability Index</Text>
          <Text style={[styles.statValue, { color: selectedBarangay.vulnerability_index > 65 ? '#ef4444' : '#fdb813' }]}>
            {selectedBarangay.vulnerability_index}
          </Text>
          <Text style={styles.statSub}>PCA Dimension Score</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Households</Text>
          <Text style={styles.statValue}>{selectedBarangay.total_households.toLocaleString()}</Text>
          <Text style={styles.statSub}>Surveyed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Population</Text>
          <Text style={styles.statValue}>{selectedBarangay.total_population.toLocaleString()}</Text>
          <Text style={styles.statSub}>Residents</Text>
        </View>
      </View>

      {/* Top Needs & Gaps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identified Barangay Needs & Deficits</Text>
        <Text style={styles.sectionDesc}>
          Empirical gaps identified from PSA CBMS indicator analysis:
        </Text>
        {selectedBarangay.top_needs.map((need, idx) => (
          <View key={idx} style={styles.needCard}>
            <View style={styles.needBullet} />
            <Text style={styles.needText}>{need}</Text>
          </View>
        ))}
      </View>

      {/* Recommended LGU Laws & Programs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended City Programs & Statutory Backing</Text>
        <Text style={styles.sectionDesc}>
          Tailored to address your barangay's specific indicators, backed by statutory mandates:
        </Text>

        {requestSent && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Official Endorsement Queued ({requestSent})</Text>
          </View>
        )}

        {selectedBarangay.recommended_programs.map((prog, idx) => (
          <View key={idx} style={styles.progCard}>
            <View style={styles.progHeader}>
              <Text style={styles.progOfficeBadge}>{prog.office}</Text>
              <Text style={styles.progSdg}>{prog.sdg}</Text>
            </View>
            <Text style={styles.progTitle}>{prog.program}</Text>
            <Text style={styles.progStatute}>Legal Mandate: {prog.statute}</Text>
            <View style={styles.progFooter}>
              <Text style={styles.progBudget}>Est. Budget: {prog.estimated_budget}</Text>
              <TouchableOpacity
                style={styles.endorseBtn}
                onPress={() => handleEndorseProgram(prog.program)}
              >
                <Text style={styles.endorseBtnText}>Endorse to Mayor</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060e1e' },
  cardHeader: { padding: 20, backgroundColor: '#07152b', borderBottomWidth: 1, borderColor: '#0038a8' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  roleBadge: { color: '#fdb813', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 12, marginRight: 6 },
  statusText: { color: '#b8bac0', fontSize: 11 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#b8bac0', fontSize: 13, marginTop: 2, marginBottom: 16 },
  pillScroll: { flexDirection: 'row', marginTop: 4 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#091a38', marginRight: 8, borderWidth: 1, borderColor: '#0038a8' },
  pillActive: { backgroundColor: '#0038a8', borderColor: '#fdb813' },
  pillText: { color: '#b8bac0', fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#fdb813', fontWeight: '900' },
  statsRow: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  statBox: { flex: 1, backgroundColor: '#07152b', padding: 14, borderRadius: 12, marginHorizontal: 4, borderWidth: 1, borderColor: '#0038a8' },
  statLabel: { color: '#b8bac0', fontSize: 10, textTransform: 'uppercase', fontWeight: '700' },
  statValue: { color: '#ffffff', fontSize: 20, fontWeight: '900', marginTop: 4 },
  statSub: { color: '#94a3b8', fontSize: 10, marginTop: 2 },
  section: { padding: 16 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  sectionDesc: { color: '#b8bac0', fontSize: 12, marginTop: 4, marginBottom: 12 },
  needCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#07152b', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#0038a8' },
  needBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fdb813', marginRight: 10 },
  needText: { color: '#e2e8f0', fontSize: 13, fontWeight: '500' },
  progCard: { backgroundColor: '#07152b', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#0038a8' },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progOfficeBadge: { backgroundColor: '#0038a8', color: '#fff', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#fdb813' },
  progSdg: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  progTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800', marginBottom: 6 },
  progStatute: { color: '#b8bac0', fontSize: 12, marginBottom: 12 },
  progFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#0038a8', paddingTop: 10 },
  progBudget: { color: '#fdb813', fontSize: 13, fontWeight: '900' },
  endorseBtn: { backgroundColor: '#0038a8', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#fdb813' },
  endorseBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  successBanner: { backgroundColor: '#065f46', padding: 12, borderRadius: 8, marginBottom: 12 },
  successText: { color: '#6ee7b7', fontSize: 12, fontWeight: '700', textAlign: 'center' }
});
