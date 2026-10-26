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
      <View style={styles.whiteCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>RESIDENT SAFETY DESK</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Offline Direct Dial</Text>
          </View>
        </View>

        <Text style={styles.title}>Naga Emergency & Disaster Desk</Text>
        <Text style={styles.subtitle}>
          Multilingual weather advisories & 1-tap cellular hotlines (no internet required).
        </Text>
      </View>

      {/* Typhoon Advisory Alert Banner */}
      <View style={styles.alertCard}>
        <View style={styles.alertTop}>
          <View style={styles.alertLevelBadge}>
            <Text style={styles.alertLevelText}>{advisory.level}</Text>
          </View>
          <Text style={styles.alertTime}>{advisory.time}</Text>
        </View>

        {/* Language Segmented Control */}
        <View style={styles.langSegment}>
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

        {/* Advisory Body */}
        <View style={styles.advisoryTextBox}>
          <Text style={styles.advisoryBodyText}>{advisory[selectedLang]}</Text>
        </View>
      </View>

      {/* Evacuation Shelters Section */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearest Evacuation Shelters</Text>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeText}>Naga Civic Complex</Text>
          </View>
        </View>

        <View style={styles.sheltersList}>
          <View style={styles.shelterCard}>
            <View style={styles.shelterTop}>
              <Text style={styles.shelterName}>Naga City Civic Center Evacuation Complex</Text>
              <View style={styles.openBadge}>
                <Text style={styles.openBadgeText}>OPEN</Text>
              </View>
            </View>
            <Text style={styles.shelterLocation}>📍 J. Miranda Ave., Concepcion Pequeña</Text>
            <View style={styles.capacityBarWrapper}>
              <View style={[styles.capacityBar, { width: '56%' }]} />
            </View>
            <Text style={styles.shelterCap}>Occupancy: 450 / 800 (56% Filled)</Text>
          </View>

          <View style={styles.shelterCard}>
            <View style={styles.shelterTop}>
              <Text style={styles.shelterName}>Camarines Sur National High School (East Wing)</Text>
              <View style={styles.standbyBadge}>
                <Text style={styles.standbyBadgeText}>STANDBY</Text>
              </View>
            </View>
            <Text style={styles.shelterLocation}>📍 Peñafrancia Ave., Naga City</Text>
            <View style={styles.capacityBarWrapper}>
              <View style={[styles.capacityBar, { width: '0%' }]} />
            </View>
            <Text style={styles.shelterCap}>Capacity: 1,200 (Signal 3 Ready)</Text>
          </View>
        </View>
      </View>

      {/* 1-Tap Emergency Hotlines Section */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1-Tap Offline Emergency Hotlines</Text>
          <View style={[styles.subBadge, { backgroundColor: macosColors.appleGreenSubtle }]}>
            <Text style={[styles.subBadgeText, { color: '#065f46' }]}>Direct Cellular</Text>
          </View>
        </View>

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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgePill: {
    backgroundColor: macosColors.appleRedSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: macosColors.appleRedBorder,
  },
  badgePillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleRed,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
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
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertLevelBadge: {
    backgroundColor: macosColors.appleRed,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertLevelText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  alertTime: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleRed,
  },
  langSegment: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 3,
    marginBottom: 10,
  },
  langBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 14,
  },
  langBtnActive: {
    backgroundColor: macosColors.appleBlue,
    shadowColor: '#05389f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  langBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  langBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  advisoryTextBox: {
    backgroundColor: '#f8f9fc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  advisoryBodyText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '500',
    color: macosColors.textPrimary,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  subBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  subBadgeText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  sheltersList: {
    gap: 10,
  },
  shelterCard: {
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  openBadge: {
    backgroundColor: macosColors.appleGreenSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  openBadgeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: '#065f46',
  },
  standbyBadge: {
    backgroundColor: macosColors.nagaGoldSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  standbyBadgeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: '#854d0e',
  },
  shelterLocation: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginBottom: 6,
  },
  capacityBarWrapper: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
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
    backgroundColor: '#f8f9fc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    fontWeight: '600',
    color: macosColors.appleBlue,
    marginTop: 1,
  },
  callPill: {
    backgroundColor: macosColors.appleBlue,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  callPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
});
