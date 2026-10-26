import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useOffline } from '../context/OfflineContext';
import { macosColors, sfFont } from '../config/macosTheme';

export const FieldInspectionScreen: React.FC = () => {
  const {
    isOnline,
    toggleNetwork,
    queuedReports,
    submitReport,
    syncOutbox,
    selectedBarangay,
    mobileRole,
    endorseOrQueueProposal,
  } = useOffline();

  const isCaptain = mobileRole === 'barangay_captain';

  const defaultCategory = isCaptain
    ? 'Rapid Damage (RDANA)'
    : 'Drainage / Flood Clog';

  const [reportType, setReportType] = useState(defaultCategory);
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState<'Routine' | 'Priority' | 'Critical'>('Priority');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [longitude, latitude] = selectedBarangay.center;

  const captainCategories = [
    'Rapid Damage (RDANA)',
    'Infrastructure / CEO Audit',
    'Sanitation / WASH Audit',
    'AIP Project Milestone',
  ];

  const citizenCategories = [
    'Drainage / Flood Clog',
    'Broken Streetlight',
    'Pothole / Road Hazard',
    'Water Supply Shortage',
    'Public Health Concern',
  ];

  const activeCategories = isCaptain ? captainCategories : citizenCategories;

  const handleSubmit = async () => {
    if (!desc.trim()) {
      Alert.alert(
        'Required Note',
        isCaptain
          ? 'Please enter inspection observations & evidence.'
          : 'Please describe the community issue or concern.'
      );
      return;
    }

    setIsSubmitting(true);
    const roleTag = isCaptain ? 'Punong Barangay / Field Inspector' : 'Citizen Resident';

    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.displayName,
      reportType: `[${severity.toUpperCase()}] ${reportType}`,
      description: desc,
      latitude: selectedBarangay.center[1],
      longitude: selectedBarangay.center[0],
      reporterRole: roleTag,
    });

    // If Captain logs an infrastructure or damage report, also queue as candidate proposal
    if (isCaptain && (reportType.includes('Infrastructure') || reportType.includes('RDANA'))) {
      await endorseOrQueueProposal({
        barangay: selectedBarangay.displayName,
        office: reportType.includes('RDANA') ? 'DRRMO' : 'CEO',
        title: `Field Remediation: ${reportType} (${selectedBarangay.realName})`,
        problem: desc,
        statute: reportType.includes('RDANA')
          ? 'RA 10121 Philippine DRRM Act Sec. 12'
          : 'RA 7160 Local Government Code Sec. 17',
        section: 'Engineering Remediation & Rehabilitation',
        sdgs: ['SDG 9 Industry & Infrastructure', 'SDG 11 Sustainable Cities'],
        budget: reportType.includes('RDANA') ? 450000 : 350000,
      });
    }

    setDesc('');
    setIsSubmitting(false);

    Alert.alert(
      isOnline ? 'Report Forwarded' : 'Queued in Offline Outbox',
      isOnline
        ? `Successfully submitted to the Naga City Command Center (${isCaptain ? 'LGU Executive Deck' : 'Citizen Services'}).`
        : `Stored in local encrypted outbox. It will auto-sync once connection to LGU server is re-established.`
    );
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert(
        'Network Offline',
        'Please toggle to Online Sync mode to transmit pending field outbox reports to the Naga Command Center.'
      );
      return;
    }
    const count = await syncOutbox();
    setSyncStatus(`Successfully synchronized ${count} report(s) with Naga City Server.`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header Card */}
      <View style={styles.whiteCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>
              {isCaptain ? 'OFFICIAL FIELD AUDIT & RDANA' : 'SUMBONG SA BARANGAY • CITIZEN DESK'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.netToggle}
            onPress={toggleNetwork}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.netDot,
                { backgroundColor: isOnline ? macosColors.appleGreen : macosColors.appleYellow },
              ]}
            />
            <Text style={styles.netText}>{isOnline ? 'Online Sync' : 'Simulated Offline'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
          {isCaptain ? 'Barangay Inspector Console' : 'Community Resident Feedback'}
        </Text>
        <Text style={styles.subtitle}>
          Active Barangay: <Text style={{ fontWeight: '700', color: macosColors.appleBlue }}>{selectedBarangay.displayName}</Text> • Centroid {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
        </Text>

        {!isCaptain && (
          <View style={styles.privacyBanner}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              <Text style={{ fontWeight: '700' }}>RA 10173 Protected:</Text> Individual household identity is confidential. Only empirical issues & geotags are forwarded to Sangguniang Barangay.
            </Text>
          </View>
        )}
      </View>

      {/* 2. Report Composer Card */}
      <View style={styles.whiteCard}>
        <View style={styles.composerHeader}>
          <Text style={styles.composerIcon}>{isCaptain ? '📋' : '📢'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.composerTitle}>
              {isCaptain ? 'Log Formal Field Verification & Evidence' : 'Report Community Issue / Hazard'}
            </Text>
            <Text style={styles.composerSub}>
              {isCaptain
                ? 'Creates statutory record for AIP 2026 project monitoring & damage claims.'
                : 'Alerts Punong Barangay and City Hall engineers for swift repair.'}
            </Text>
          </View>
        </View>

        {/* Severity Selector */}
        <Text style={styles.inputLabel}>PRIORITY / SEVERITY LEVEL</Text>
        <View style={styles.severityRow}>
          {(['Routine', 'Priority', 'Critical'] as const).map((sev) => {
            const isSelected = severity === sev;
            const color =
              sev === 'Critical' ? '#dc2626' : sev === 'Priority' ? '#d97706' : '#16a34a';
            return (
              <TouchableOpacity
                key={sev}
                style={[
                  styles.severityBtn,
                  isSelected && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => setSeverity(sev)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.severityBtnText,
                    isSelected && styles.severityBtnTextActive,
                  ]}
                >
                  {sev === 'Critical' ? '🚨 ' : sev === 'Priority' ? '⚡ ' : '🌱 '}
                  {sev}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Selector */}
        <Text style={styles.inputLabel}>
          {isCaptain ? 'AUDIT CLASSIFICATION' : 'ISSUE TYPE'}
        </Text>
        <View style={styles.typeRow}>
          {activeCategories.map((t) => {
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

        {/* Description / Findings Input */}
        <Text style={styles.inputLabel}>
          {isCaptain ? 'OBSERVATION FINDINGS & STATUTORY EVIDENCE' : 'ISSUE DETAILS & SPECIFIC LOCATION'}
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder={
            isCaptain
              ? 'e.g. Conducted ocular inspection of Zone 3 river embankment. 15 light-roof households exposed to flash flooding. Recommended retaining wall repair.'
              : 'e.g. Clogged culvert along Zone 4 causing knee-deep water after 30 minutes of rain. Affecting around 20 families.'
          }
          placeholderTextColor={macosColors.textTertiary}
          multiline
          numberOfLines={4}
          value={desc}
          onChangeText={setDesc}
        />

        {/* Geotag & Metadata Card */}
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Barangay Centroid</Text>
            <Text style={styles.metaVal}>
              {selectedBarangay.realName} ({latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E)
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Reporter Persona</Text>
            <Text style={styles.metaVal}>
              {isCaptain ? '🏛️ Punong Barangay' : '👥 Verified Citizen'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Transmission Channel</Text>
            <Text style={styles.metaVal}>
              {isOnline ? 'Direct HTTPS API' : 'Local SQLite / Outbox Queue'}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting
              ? 'TRANSMITTING...'
              : isCaptain
              ? '📝 Log Formal Audit & Geotag'
              : '🚀 Isumbong sa Barangay (Submit)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Outbox & Sync Manager Card */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Field Reports & Outbox</Text>
            <Text style={styles.sectionSub}>
              {queuedReports.length} queued item(s) awaiting cloud transmission
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.syncBtn,
              (!isOnline || queuedReports.length === 0) && styles.syncBtnDisabled,
            ]}
            onPress={handleManualSync}
            disabled={!isOnline || queuedReports.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.syncBtnText}>Sync Outbox ↗</Text>
          </TouchableOpacity>
        </View>

        {syncStatus && (
          <View style={styles.syncAlert}>
            <Text style={styles.syncAlertText}>{syncStatus}</Text>
          </View>
        )}

        {queuedReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>All field reports synchronized with Naga Command Center.</Text>
          </View>
        ) : (
          <View style={styles.outboxList}>
            {queuedReports.map((item) => (
              <View key={item.id} style={styles.outboxItem}>
                <View style={styles.outboxTop}>
                  <Text style={styles.outboxType}>{item.reportType}</Text>
                  <View
                    style={[
                      styles.outboxBadge,
                      item.isSynced ? styles.outboxBadgeSynced : styles.outboxBadgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.outboxBadgeText,
                        item.isSynced ? styles.badgeTextSynced : styles.badgeTextPending,
                      ]}
                    >
                      {item.isSynced ? 'SYNCED' : 'QUEUED OFFLINE'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.outboxDesc}>{item.description}</Text>
                <View style={styles.outboxFoot}>
                  <Text style={styles.outboxMeta}>
                    📍 {item.barangayName} • {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.outboxRole}>{item.reporterRole}</Text>
                </View>
              </View>
            ))}
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
    paddingBottom: 28,
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: macosColors.appleBlueSubtle,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: macosColors.appleBlueBorder,
  },
  badgePillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  netToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
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
    color: macosColors.textSecondary,
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
    fontSize: 12,
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  privacyBanner: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 6,
  },
  privacyIcon: {
    fontSize: 13,
  },
  privacyText: {
    fontFamily: sfFont,
    fontSize: 10.5,
    color: '#1e40af',
    flex: 1,
    lineHeight: 15,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  composerIcon: {
    fontSize: 22,
    marginTop: 1,
  },
  composerTitle: {
    fontFamily: sfFont,
    fontSize: 15,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  composerSub: {
    fontFamily: sfFont,
    fontSize: 11,
    color: macosColors.textSecondary,
    marginTop: 1,
  },
  inputLabel: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: macosColors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.3,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  severityBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  severityBtnTextActive: {
    color: '#ffffff',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  typeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontFamily: sfFont,
    fontSize: 12,
    color: macosColors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  metaBox: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaKey: {
    fontFamily: sfFont,
    fontSize: 10.5,
    color: macosColors.textSecondary,
  },
  metaVal: {
    fontFamily: sfFont,
    fontSize: 10.5,
    fontWeight: '600',
    color: macosColors.textPrimary,
  },
  submitBtn: {
    marginTop: 12,
    backgroundColor: macosColors.appleBlue,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: sfFont,
    fontSize: 15,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  sectionSub: {
    fontFamily: sfFont,
    fontSize: 11,
    color: macosColors.textSecondary,
    marginTop: 1,
  },
  syncBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  syncBtnText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  syncAlert: {
    backgroundColor: '#ecfdf5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 8,
  },
  syncAlertText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  emptyBox: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  emptyIcon: {
    fontSize: 20,
  },
  emptyText: {
    fontFamily: sfFont,
    fontSize: 11,
    color: macosColors.textSecondary,
  },
  outboxList: {
    gap: 8,
  },
  outboxItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  outboxTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  outboxType: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.textPrimary,
    flex: 1,
  },
  outboxBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  outboxBadgePending: {
    backgroundColor: '#fef3c7',
  },
  outboxBadgeSynced: {
    backgroundColor: '#dcfce7',
  },
  outboxBadgeText: {
    fontFamily: sfFont,
    fontSize: 8.5,
    fontWeight: '800',
  },
  badgeTextPending: {
    color: '#b45309',
  },
  badgeTextSynced: {
    color: '#15803d',
  },
  outboxDesc: {
    fontFamily: sfFont,
    fontSize: 11,
    color: macosColors.textSecondary,
    marginBottom: 6,
    lineHeight: 16,
  },
  outboxFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outboxMeta: {
    fontFamily: sfFont,
    fontSize: 9.5,
    color: macosColors.textTertiary,
  },
  outboxRole: {
    fontFamily: sfFont,
    fontSize: 9.5,
    fontWeight: '600',
    color: macosColors.appleBlue,
  },
});
