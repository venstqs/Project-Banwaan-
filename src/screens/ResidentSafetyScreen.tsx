import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { TYPHOON_ADVISORIES_MULTILINGUAL, NAGA_EMERGENCY_HOTLINES } from '../data/offlineData';
import { useOffline } from '../context/OfflineContext';
import { macosColors, macosTypography, sfFont } from '../config/macosTheme';

export const ResidentSafetyScreen: React.FC = () => {
  const { isOnline } = useOffline();
  const [selectedLang, setSelectedLang] = useState<'bikol' | 'filipino' | 'english'>('bikol');
  const advisory = TYPHOON_ADVISORIES_MULTILINGUAL[0];

  const handleCallHotline = (service: string, number: string) => {
    const cleanNumber = number.split('/')[0].replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert("Emergency Hotline", `Dialing: ${service}\nNumber: ${number}`);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>RESIDENT SAFETY & RESILIENCE</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Offline-Ready</Text>
          </View>
        </View>

        <Text style={styles.title}>Naga Emergency & Disaster Desk</Text>
        <Text style={styles.subtitle}>
          Real-time multilingual weather bulletins & 1-tap direct cellular hotlines
        </Text>
      </View>

      {/* Typhoon Alert Banner (macOS Vibrant Glass Card) */}
      <View style={styles.alertCard}>
        <View style={styles.alertTop}>
          <View style={styles.alertLevelBadge}>
            <Text style={styles.alertLevelText}>{advisory.level}</Text>
          </View>
          <Text style={styles.alertTime}>{advisory.time}</Text>
        </View>

        {/* macOS Language Segmented Switcher */}
        <View style={styles.langSegmentWrapper}>
          {(['bikol', 'filipino', 'english'] as const).map((lang) => {
            const isSelected = selectedLang === lang;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.langBtn, isSelected && styles.langBtnActive]}
                onPress={() => setSelectedLang(lang)}
                activeOpacity={0.7}
              >
                <Text style={[styles.langBtnText, isSelected && styles.langBtnTextActive]}>
                  {lang === 'bikol' ? 'Bikol Naga' : lang === 'filipino' ? 'Filipino' : 'English'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Multilingual Advisory Body */}
        <View style={styles.advisoryTextBox}>
          <Text style={styles.advisoryBodyText}>{advisory[selectedLang]}</Text>
        </View>
      </View>

      {/* Evacuation Shelters Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>🏫</Text>
            <Text style={styles.sectionTitle}>Nearest Evacuation Shelters</Text>
          </View>
          <Text style={styles.sectionSubBadge}>Naga City Central</Text>
        </View>

        <View style={styles.sheltersList}>
          <View style={styles.shelterCard}>
            <View style={styles.shelterTop}>
              <Text style={styles.shelterName}>Naga City Civic Center Evacuation Complex</Text>
              <View style={[styles.shelterStatusBadge, { backgroundColor: macosColors.appleGreenSubtle }]}>
                <Text style={[styles.shelterStatusText, { color: macosColors.appleGreen }]}>OPEN & READY</Text>
              </View>
            </View>
            <Text style={styles.shelterLocation}>📍 J. Miranda Ave., Concepcion Pequeña</Text>
            <View style={styles.shelterFooter}>
              <View style={styles.capacityBarWrapper}>
                <View style={[styles.capacityBar, { width: '56%' }]} />
              </View>
              <Text style={styles.shelterCap}>Occupancy: 450 / 800 (56%)</Text>
            </View>
          </View>

          <View style={styles.shelterCard}>
            <View style={styles.shelterTop}>
              <Text style={styles.shelterName}>Camarines Sur National High School (East Wing)</Text>
              <View style={[styles.shelterStatusBadge, { backgroundColor: macosColors.appleYellowSubtle }]}>
                <Text style={[styles.shelterStatusText, { color: macosColors.appleYellow }]}>ON STANDBY</Text>
              </View>
            </View>
            <Text style={styles.shelterLocation}>📍 Peñafrancia Ave., Naga City</Text>
            <View style={styles.shelterFooter}>
              <View style={styles.capacityBarWrapper}>
                <View style={[styles.capacityBar, { width: '0%' }]} />
              </View>
              <Text style={styles.shelterCap}>Occupancy: 0 / 1,200 (Ready on Signal 3)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 1-Tap Offline Emergency Hotlines Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>📞</Text>
            <Text style={styles.sectionTitle}>1-Tap Offline Emergency Hotlines</Text>
          </View>
          <Text style={[styles.sectionSubBadge, { color: macosColors.appleGreen }]}>Direct Cellular</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Direct telephone dialers function via standard cellular towers even during blackout or data disconnect:
        </Text>

        <View style={styles.hotlinesGrid}>
          {NAGA_EMERGENCY_HOTLINES.map((h, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.hotlineItem}
              onPress={() => handleCallHotline(h.service, h.number)}
              activeOpacity={0.7}
            >
              <View style={styles.hotlineLeft}>
                <Text style={styles.hotlineService}>{h.service}</Text>
                <Text style={styles.hotlineNumber}>{h.number}</Text>
              </View>
              <View style={styles.callPill}>
                <Text style={styles.callPillText}>CALL ↗</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: macosColors.appleRedSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  badgeText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleRed,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: macosColors.controlBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: macosColors.appleGreen,
  },
  statusText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
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
  alertCard: {
    backgroundColor: 'rgba(255, 69, 58, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.25)',
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertLevelBadge: {
    backgroundColor: macosColors.appleRed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertLevelText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  alertTime: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.appleRed,
  },
  langSegmentWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    padding: 2,
    marginBottom: 12,
  },
  langBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: macosColors.cardBackgroundElevated,
    borderWidth: 1,
    borderColor: macosColors.controlBorder,
  },
  langBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  langBtnTextActive: {
    color: macosColors.textPrimary,
    fontWeight: '700',
  },
  advisoryTextBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  advisoryBodyText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '500',
    color: macosColors.textPrimary,
    lineHeight: 18,
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
    marginBottom: 6,
  },
  sectionTitleRow: {
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
  sectionSubBadge: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textTertiary,
  },
  sectionDesc: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginBottom: 12,
  },
  sheltersList: {
    gap: 10,
  },
  shelterCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  shelterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  shelterName: {
    flex: 1,
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  shelterStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shelterStatusText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
  },
  shelterLocation: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginBottom: 8,
  },
  shelterFooter: {
    gap: 4,
  },
  capacityBarWrapper: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityBar: {
    height: '100%',
    backgroundColor: macosColors.appleBlue,
    borderRadius: 2,
  },
  shelterCap: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '600',
    color: macosColors.textTertiary,
  },
  hotlinesGrid: {
    gap: 8,
  },
  hotlineItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotlineLeft: {
    flex: 1,
  },
  hotlineService: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  hotlineNumber: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.appleYellow,
    marginTop: 1,
  },
  callPill: {
    backgroundColor: macosColors.appleGreen,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  callPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
});
