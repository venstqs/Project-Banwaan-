import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useOffline } from '../context/OfflineContext';
import { macosColors, macosTypography, sfFont } from '../config/macosTheme';

export const FieldInspectionScreen: React.FC = () => {
  const { isOnline, toggleNetwork, queuedReports, submitReport, syncOutbox, selectedBarangay } = useOffline();
  const [reportType, setReportType] = useState('Rapid Damage Assessment (RDANA)');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [longitude, latitude] = selectedBarangay.center;

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
      latitude: selectedBarangay.center[1],
      longitude: selectedBarangay.center[0]
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Card */}
      <View style={styles.whiteCard}>
        <View style={styles.headerTop}>
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>FIELD AUDIT & GEOTAG</Text>
            </View>
            <TouchableOpacity
              style={styles.netToggle}
              onPress={toggleNetwork}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.netDot,
                  { backgroundColor: isOnline ? macosColors.appleGreen : macosColors.appleRed },
                ]}
              />
              <Text style={styles.netText}>{isOnline ? 'Online Sync' : 'Simulated Offline'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>Field Inspector Console</Text>
        <Text style={styles.subtitle}>
          Active Barangay: {selectedBarangay.name} • Centroid {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
        </Text>
      </View>

      {/* Report Composer Card */}
      <View style={styles.whiteCard}>
        <View style={styles.composerHeader}>
          <Text style={styles.composerIcon}>📋</Text>
          <Text style={styles.composerTitle}>Log Field Inspection & Proof</Text>
        </View>

        <Text style={styles.inputLabel}>INSPECTION CATEGORY</Text>
        <View style={styles.typeRow}>
          {['Rapid Damage (RDANA)', 'Project Milestone', 'Sanitation Audit'].map((t) => {
            const isSelected = reportType === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, isSelected && styles.typeBtnActive]}
                onPress={() => setReportType(t)}
                activeOpacity={0.7}
              >
                <Text style={[styles.typeBtnText, isSelected && styles.typeBtnTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>OBSERVATION FINDINGS & EVIDENCE</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Inspected 45 households along flood zone. 12 roof damages verified..."
          placeholderTextColor={macosColors.textTertiary}
          multiline
          numberOfLines={4}
          value={desc}
          onChangeText={setDesc}
        />

        {/* Metadata Inspector Card */}
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>GPS Coordinates</Text>
            <Text style={styles.metaVal}>
              NAGA-BRGY{selectedBarangay.id} ({latitude.toFixed(4)}N, {longitude.toFixed(4)}E)
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Timestamp</Text>
            <Text style={styles.metaVal}>
              {new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })} PHT
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Storage Engine</Text>
            <Text style={[styles.metaVal, { color: macosColors.appleGreen }]}>
              Encrypted Local SQLite Outbox
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>
            {isOnline ? 'Upload Geotagged Report to Central Server' : 'Save to Offline SQLite Outbox'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Outbox Queue Section */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Queued Offline Outbox</Text>
          <View style={styles.queueCountBadge}>
            <Text style={styles.queueCountText}>{queuedReports.length} Queued</Text>
          </View>
        </View>

        {syncStatus && (
          <View style={styles.syncBanner}>
            <Text style={styles.syncBannerText}>{syncStatus}</Text>
          </View>
        )}

        {queuedReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>✓</Text>
            <Text style={styles.emptyTitle}>Outbox Synchronized</Text>
            <Text style={styles.emptySub}>
              All offline reports and field inspections have synced with the City Hall Central Server.
            </Text>
          </View>
        ) : (
          <View style={styles.queueList}>
            {queuedReports.map((item) => (
              <View key={item.id} style={styles.queueItem}>
                <View style={styles.queueItemHeader}>
                  <Text style={styles.queueItemType}>{item.reportType}</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>PENDING SYNC</Text>
                  </View>
                </View>
                <Text style={styles.queueItemDesc}>{item.description}</Text>
                <View style={styles.queueItemFooter}>
                  <Text style={styles.queueItemMeta}>
                    📍 {item.barangayName} • {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.queueItemId}>{item.id.slice(0, 8)}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.syncNowBtn}
              onPress={handleManualSync}
              activeOpacity={0.8}
            >
              <Text style={styles.syncNowBtnText}>
                {isOnline ? `Sync ${queuedReports.length} Report(s) to Central Server` : 'Network Offline (Cannot Sync)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: macosColors.windowBackground,
  },
  contentContainer: {
    padding: 14,
    gap: 12,
    paddingBottom: 24,
  },
  whiteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerTop: {
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: macosColors.applePurpleSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: macosColors.applePurpleBorder,
  },
  badgePillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.applePurple,
  },
  netToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 5,
  },
  netDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  netText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textPrimary,
  },
  title: {
    fontFamily: sfFont,
    fontSize: 20,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  composerIcon: {
    fontSize: 14,
  },
  composerTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  inputLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  typeBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeBtnActive: {
    backgroundColor: macosColors.appleBlue,
    borderColor: macosColors.appleBlue,
  },
  typeBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  typeBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textInput: {
    fontFamily: sfFont,
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: macosColors.textPrimary,
    fontSize: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  metaBox: {
    backgroundColor: '#f8f9fc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaKey: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textTertiary,
  },
  metaVal: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textSecondary,
  },
  submitBtn: {
    backgroundColor: macosColors.appleBlue,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    shadowColor: '#05389f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitBtnText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  queueCountBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  queueCountText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  syncBanner: {
    backgroundColor: macosColors.appleGreenSubtle,
    borderWidth: 1,
    borderColor: macosColors.appleGreenBorder,
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  syncBannerText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
    textAlign: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 4,
  },
  emptyEmoji: {
    fontSize: 22,
    color: macosColors.appleGreen,
    fontWeight: '800',
    marginBottom: 2,
  },
  emptyTitle: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  emptySub: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textTertiary,
    textAlign: 'center',
    maxWidth: 240,
  },
  queueList: {
    gap: 8,
  },
  queueItem: {
    backgroundColor: '#f8f9fc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  queueItemType: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.appleBlue,
  },
  pendingBadge: {
    backgroundColor: macosColors.nagaGoldSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: macosColors.nagaGoldBorder,
  },
  pendingBadgeText: {
    fontFamily: sfFont,
    fontSize: 8,
    fontWeight: '700',
    color: '#854d0e',
  },
  queueItemDesc: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginBottom: 6,
  },
  queueItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 4,
  },
  queueItemMeta: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '500',
    color: macosColors.textTertiary,
  },
  queueItemId: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '600',
    color: macosColors.textTertiary,
  },
  syncNowBtn: {
    backgroundColor: macosColors.appleBlue,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  syncNowBtnText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
