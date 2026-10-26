import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useOffline } from '../context/OfflineContext';

export const FieldInspectionScreen: React.FC = () => {
  const { isOnline, toggleNetwork, queuedReports, submitReport, syncOutbox, selectedBarangay } = useOffline();
  const [reportType, setReportType] = useState('Rapid Damage Assessment (RDANA)');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!desc.trim()) {
      Alert.alert("Required", "Please enter field observation notes.");
      return;
    }
    setIsSubmitting(true);
    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.name,
      reportType,
      description: desc,
      latitude: 13.6218,
      longitude: 123.1948
    });
    setDesc('');
    setIsSubmitting(false);
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert("Network Offline", "Please enable network connection to sync outbox.");
      return;
    }
    const count = await syncOutbox();
    setSyncStatus(`Successfully synchronized ${count} report(s) to Naga Command Center.`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header & Network Toggle */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>FIELD INSPECTION & GEOTAG LOG</Text>
          <TouchableOpacity style={styles.netToggle} onPress={toggleNetwork}>
            <View style={[styles.netDot, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />
            <Text style={styles.netText}>{isOnline ? 'ONLINE' : 'SIMULATE OFFLINE'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Offline Outbox & Field Log</Text>
        <Text style={styles.subtitle}>Target: {selectedBarangay.name} • GPS Lat 13.6218, Lon 123.1948</Text>
      </View>

      {/* New Report Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Submit New Field Proof / Report</Text>
        
        <Text style={styles.label}>Inspection Category</Text>
        <View style={styles.typeRow}>
          {['Rapid Damage (RDANA)', 'Project Milestone', 'Sanitation Check'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, reportType === t && styles.typeBtnActive]}
              onPress={() => setReportType(t)}
            >
              <Text style={[styles.typeBtnText, reportType === t && styles.typeBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Field Findings & Notes</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Inspected 45 households along riverbank. 12 roof damages recorded..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={3}
          value={desc}
          onChangeText={setDesc}
        />

        <View style={styles.metaWatermark}>
          <Text style={styles.watermarkText}>📷 Geotag Watermark: NAGA-BRGY{selectedBarangay.id}-13.6218N-123.1948E</Text>
          <Text style={styles.watermarkText}>⏱ Timestamp: {new Date().toLocaleTimeString()} PHT</Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.submitBtnText}>
            {isOnline ? 'Submit & Upload Proof' : 'Save to Offline Outbox Queue'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Outbox Status */}
      <View style={styles.outboxSection}>
        <View style={styles.outboxHeader}>
          <Text style={styles.sectionTitle}>Local Outbox Queue ({queuedReports.length})</Text>
          <TouchableOpacity style={styles.syncBtn} onPress={handleManualSync}>
            <Text style={styles.syncBtnText}>Sync Outbox</Text>
          </TouchableOpacity>
        </View>

        {syncStatus && (
          <View style={styles.syncBanner}>
            <Text style={styles.syncBannerText}>{syncStatus}</Text>
          </View>
        )}

        {queuedReports.map((rpt) => (
          <View key={rpt.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportType}>{rpt.reportType}</Text>
              <View style={[styles.syncBadge, { backgroundColor: rpt.isSynced ? '#065f46' : '#854d0e' }]}>
                <Text style={styles.syncBadgeText}>{rpt.isSynced ? '✓ Synced' : '⏳ Queued Offline'}</Text>
              </View>
            </View>
            <Text style={styles.reportDesc}>{rpt.description}</Text>
            <Text style={styles.reportMeta}>
              {rpt.barangayName} • {rpt.timestamp} • ({rpt.latitude.toFixed(4)}, {rpt.longitude.toFixed(4)})
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, backgroundColor: '#1e293b', borderBottomWidth: 1, borderColor: '#334155' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badge: { color: '#38bdf8', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  netToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  netDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  netText: { color: '#e2e8f0', fontSize: 10, fontWeight: '700' },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 12, marginTop: 2 },
  formCard: { margin: 16, backgroundColor: '#1e293b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  formTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  label: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  typeRow: { flexDirection: 'row', marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, backgroundColor: '#334155', borderRadius: 6, marginHorizontal: 2, alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#0284c7' },
  typeBtnText: { color: '#94a3b8', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  typeBtnTextActive: { color: '#ffffff', fontWeight: '700' },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155', textAlignVertical: 'top', minHeight: 70, marginBottom: 10 },
  metaWatermark: { backgroundColor: '#0f172a', padding: 8, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  watermarkText: { color: '#64748b', fontSize: 10, fontFamily: 'monospace' },
  submitBtn: { backgroundColor: '#0284c7', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  outboxSection: { paddingHorizontal: 16, paddingBottom: 24 },
  outboxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  syncBtn: { backgroundColor: '#10b981', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  syncBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  syncBanner: { backgroundColor: '#065f46', padding: 10, borderRadius: 6, marginBottom: 10 },
  syncBannerText: { color: '#6ee7b7', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  reportCard: { backgroundColor: '#1e293b', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reportType: { color: '#38bdf8', fontSize: 13, fontWeight: '700' },
  syncBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  syncBadgeText: { color: '#fef08a', fontSize: 10, fontWeight: '700' },
  reportDesc: { color: '#e2e8f0', fontSize: 13, lineHeight: 18, marginBottom: 6 },
  reportMeta: { color: '#64748b', fontSize: 11 }
});
