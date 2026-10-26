import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPHOON_ADVISORIES_MULTILINGUAL, NAGA_EMERGENCY_HOTLINES } from '../data/offlineData';

export const ResidentSafetyScreen: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'bikol' | 'filipino' | 'english'>('bikol');
  const advisory = TYPHOON_ADVISORIES_MULTILINGUAL[0];

  const handleCallHotline = (service: string, number: string) => {
    const cleanNumber = number.split('/')[0].replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Emergency Hotline', `Dialing: ${service}\nNumber: ${number}`);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerSection}>
        <Text style={styles.eyebrow}>RESIDENT SAFETY & RESILIENCE HUB</Text>
        <Text style={styles.screenTitle}>Naga Emergency Desk</Text>
        <Text style={styles.screenSubtitle}>Offline-First Calamity Advisories & 1-Tap Hotlines</Text>
      </View>

      <View style={styles.advisoryCard}>
        <View style={styles.advisoryTopRow}>
          <View style={styles.alertBadge}>
            <View style={styles.alertDot} />
            <Text style={styles.alertBadgeText}>{advisory.level}</Text>
          </View>
          <Text style={styles.advisoryTime}>{advisory.time}</Text>
        </View>

        <View style={styles.langSegment}>
          {(['bikol', 'filipino', 'english'] as const).map((lang) => {
            const active = selectedLang === lang;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.langBtn, active && styles.langBtnActive]}
                onPress={() => setSelectedLang(lang)}
                activeOpacity={0.75}
              >
                <Text style={[styles.langBtnText, active && styles.langBtnTextActive]}>
                  {lang === 'bikol' ? 'Bikol' : lang === 'filipino' ? 'Filipino' : 'English'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.advisoryMessageBox}>
          <Text style={styles.advisoryBodyText}>{advisory[selectedLang]}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Designated Evacuation Shelters</Text>
        <Text style={styles.sectionDesc}>Verified Naga City LGU relief facilities</Text>

        <View style={styles.shelterCard}>
          <View style={styles.shelterHeader}>
            <Text style={styles.shelterName}>Naga City Civic Center Complex</Text>
            <View style={[styles.statusBadge, styles.statusOpen]}>
              <Text style={styles.statusOpenText}>Open</Text>
            </View>
          </View>
          <Text style={styles.shelterLocation}>J. Miranda Ave., Concepcion Pequeña</Text>
          <Text style={styles.shelterCapacity}>Current Occupancy: 450 / 800 persons</Text>
        </View>

        <View style={styles.shelterCard}>
          <View style={styles.shelterHeader}>
            <Text style={styles.shelterName}>Camarines Sur National High School</Text>
            <View style={[styles.statusBadge, styles.statusStandby]}>
              <Text style={styles.statusStandbyText}>Standby</Text>
            </View>
          </View>
          <Text style={styles.shelterLocation}>Peñafrancia Ave., Naga City (East Wing)</Text>
          <Text style={styles.shelterCapacity}>Current Occupancy: 0 / 1,200 persons</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1-Tap Emergency Hotlines</Text>
        <Text style={styles.sectionDesc}>Works via direct cellular network without internet</Text>

        {NAGA_EMERGENCY_HOTLINES.map((h, idx) => (
          <View key={idx} style={styles.hotlineCard}>
            <View style={styles.hotlineInfo}>
              <Text style={styles.hotlineService}>{h.service}</Text>
              <Text style={styles.hotlineNumber}>{h.number}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCallHotline(h.service, h.number)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.callButtonText}>Call →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { paddingBottom: 32 },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  eyebrow: { color: '#BE123C', fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginBottom: 4 },
  screenTitle: { color: '#0F172A', fontSize: 21, fontWeight: '800', letterSpacing: -0.4 },
  screenSubtitle: { color: '#64748B', fontSize: 12, fontWeight: '500', marginTop: 2 },
  advisoryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  advisoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  alertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E11D48' },
  alertBadgeText: { color: '#BE123C', fontSize: 11, fontWeight: '700' },
  advisoryTime: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  langSegment: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 3,
    borderRadius: 999,
    marginBottom: 12,
  },
  langBtn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 999 },
  langBtnActive: { backgroundColor: '#05389F' },
  langBtnText: { color: '#4B5563', fontSize: 12, fontWeight: '600' },
  langBtnTextActive: { color: '#FFFFFF', fontWeight: '700' },
  advisoryMessageBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  advisoryBodyText: { color: '#1E293B', fontSize: 14, lineHeight: 21, fontWeight: '500' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: '#0F172A', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  sectionDesc: { color: '#64748B', fontSize: 12, fontWeight: '400', marginTop: 1, marginBottom: 12 },
  shelterCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  shelterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shelterName: { color: '#0F172A', fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  statusOpen: { backgroundColor: '#D1FAE5' },
  statusOpenText: { color: '#047857', fontSize: 11, fontWeight: '700' },
  statusStandby: { backgroundColor: '#FEF3C7' },
  statusStandbyText: { color: '#B45309', fontSize: 11, fontWeight: '700' },
  shelterLocation: { color: '#64748B', fontSize: 12, marginBottom: 6 },
  shelterCapacity: { color: '#334155', fontSize: 12, fontWeight: '600' },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  hotlineInfo: { flex: 1, marginRight: 12 },
  hotlineService: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  hotlineNumber: { color: '#05389F', fontSize: 13, fontWeight: '600', marginTop: 2 },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#05389F',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  callButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});