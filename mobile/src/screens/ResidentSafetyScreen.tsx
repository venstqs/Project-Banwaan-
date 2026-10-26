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
            <Ionicons name="warning" size={14} color="#9F1239" />
            <Text style={styles.alertBadgeText}>{advisory.level}</Text>
          </View>
          <Text style={styles.advisoryTime}>{advisory.time}</Text>
        </View>

        <View style={styles.langSegment}>
          {(['bikol', 'filipino', 'english'] as const).map((lang) => {
            const active = selectedLang === lang;
            return (
              <TouchableOpacity key={lang} style={[styles.langBtn, active && styles.langBtnActive]} onPress={() => setSelectedLang(lang)} activeOpacity={0.75}>
                <Text style={[styles.langBtnText, active && styles.langBtnTextActive]}>{lang === 'bikol' ? 'Bikol' : lang === 'filipino' ? 'Filipino' : 'English'}</Text>
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
              <Text style={styles.statusOpenText}>OPEN</Text>
            </View>
          </View>
          <Text style={styles.shelterLocation}>J. Miranda Ave., Concepcion Pequeña</Text>
          <Text style={styles.shelterCapacity}>Current Occupancy: 450 / 800 persons</Text>
        </View>

        <View style={styles.shelterCard}>
          <View style={styles.shelterHeader}>
            <Text style={styles.shelterName}>Camarines Sur National High School</Text>
            <View style={[styles.statusBadge, styles.statusStandby]}>
              <Text style={styles.statusStandbyText}>STANDBY</Text>
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
            <TouchableOpacity style={styles.callButton} onPress={() => handleCallHotline(h.service, h.number)} activeOpacity={0.8}>
              <Ionicons name="call" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.callButtonText}>Call</Text>
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
  headerSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  eyebrow: { color: '#E11D48', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  screenTitle: { color: '#0F172A', fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  screenSubtitle: { color: '#475569', fontSize: 13, fontWeight: '500', marginTop: 2 },
  advisoryCard: { margin: 16, padding: 16, backgroundColor: '#FFE4E6', borderRadius: 12, borderWidth: 1, borderColor: '#FECDD3' },
  advisoryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 },
  alertBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, gap: 6, borderWidth: 1, borderColor: '#FECDD3' },
  alertBadgeText: { color: '#9F1239', fontSize: 12, fontWeight: '800' },
  advisoryTime: { color: '#9F1239', fontSize: 11, fontWeight: '700' },
  langSegment: { flexDirection: 'row', backgroundColor: '#FECDD3', padding: 3, borderRadius: 8, marginBottom: 12 },
  langBtn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 6 },
  langBtnActive: { backgroundColor: '#FFFFFF' },
  langBtnText: { color: '#9F1239', fontSize: 12, fontWeight: '600' },
  langBtnTextActive: { color: '#E11D48', fontWeight: '800' },
  advisoryMessageBox: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#FECDD3' },
  advisoryBodyText: { color: '#1E293B', fontSize: 14, lineHeight: 21, fontWeight: '500' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  sectionDesc: { color: '#475569', fontSize: 13, fontWeight: '500', marginTop: 2, marginBottom: 12 },
  shelterCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  shelterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  shelterName: { color: '#0F172A', fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  statusOpen: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  statusOpenText: { color: '#065F46', fontSize: 10, fontWeight: '800' },
  statusStandby: { backgroundColor: '#FEF9E7', borderColor: '#FDE68A' },
  statusStandbyText: { color: '#B45309', fontSize: 10, fontWeight: '800' },
  shelterLocation: { color: '#64748B', fontSize: 12, marginBottom: 6 },
  shelterCapacity: { color: '#334155', fontSize: 12, fontWeight: '700' },
  hotlineCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 },
  hotlineInfo: { flex: 1, marginRight: 12 },
  hotlineService: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  hotlineNumber: { color: '#2563EB', fontSize: 13, fontWeight: '700', marginTop: 2 },
  callButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  callButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});