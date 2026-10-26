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
      {/* macOS Inspector Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>FIELD GEOTAG AUDIT</Text>
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

        <Text style={styles.title}>Offline Field Outbox & Geotag Log</Text>
        <Text style={styles.subtitle}>
          Active Barangay: {selectedBarangay.name} • Centroid {latitude.toFixed(6)}°N, {longitude.toFixed(6)}°E
        </Text>
      </View>

      {/* New Field Report Composer Card */}
      <View style={styles.composerCard}>
        <View style={styles.composerHeader}>
          <Text style={styles.composerIcon}>📝</Text>
          <Text style={styles.composerTitle}>Log Field Inspection & Proof</Text>
        </View>

        <Text style={styles.label}>INSPECTION PROTOCOL</Text>
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

        <Text style={styles.label}>OBSERVATION FINDINGS & PROOF</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Validated 45 households along flood zone. 12 roof damages verified..."
          placeholderTextColor={macosColors.textTertiary}
          multiline
          numberOfLines={4}
          value={desc}
          onChangeText={setDesc}
        />

        {/* macOS Metadata Inspector Box */}
        <View style={styles.metaInspector}>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>GPS Tag</Text>
            <Text style={styles.metaVal}>
              NAGA-BRGY{selectedBarangay.id} ({latitude.toFixed(4)}N, {longitude.toFixed(4)}E)
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Timestamp</Text>
            <Text style={styles.metaVal}>
              {new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} PHT
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Local Storage</Text>
            <Text style={[styles.metaVal, { color: macosColors.appleGreen }]}>
              Encrypted Local SQLite Cache Active
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
            {isOnline ? 'Upload Geotagged Report to Central Server' : 'Queue to Offline SQLite Outbox'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Outbox Status & Queue List */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionIcon}>📦</Text>
            <Text style={styles.sectionTitle}>Queued Offline Outbox</Text>
          </View>
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
            <Text style={styles.emptyTitle}>Outbox All Synced</Text>
            <Text style={styles.emptySub}>
              All offline reports and field audits have synchronized with the City Hall Central Server.
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
                {isOnline ? `Sync ${queuedReports.length} Reports to City Hall Now` : 'Network Offline (Cannot Sync)'}
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
    gap: 14,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: macosColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  headerTop: {
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: macosColors.applePurpleSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(191, 90, 242, 0.3)',
  },
  badgeText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.applePurple,
    letterSpacing: 0.5,
  },
  netToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: macosColors.controlBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: macosColors.controlBorder,
    gap: 6,
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
    fontWeight: '700',
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
  composerCard: {
    backgroundColor: macosColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
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
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  label: {
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: macosColors.controlBackground,
    borderWidth: 1,
    borderColor: macosColors.controlBorder,
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
    backgroundColor: macosColors.inputBackground,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: macosColors.inputBorder,
    color: macosColors.textPrimary,
    fontSize: 12,
    minHeight: 75,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  metaInspector: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
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
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#0a84ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  submitBtnText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionCard: {
    backgroundColor: macosColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  queueCountBadge: {
    backgroundColor: macosColors.controlBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
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
    borderColor: 'rgba(48, 209, 88, 0.3)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  syncBannerText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.appleGreen,
    textAlign: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  emptyEmoji: {
    fontSize: 24,
    color: macosColors.appleGreen,
    fontWeight: '800',
    marginBottom: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
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
    backgroundColor: macosColors.appleYellowSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontFamily: sfFont,
    fontSize: 8,
    fontWeight: '700',
    color: macosColors.appleYellow,
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
    borderTopColor: macosColors.cardBorder,
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
    backgroundColor: macosColors.appleGreen,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  syncNowBtnText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
});
