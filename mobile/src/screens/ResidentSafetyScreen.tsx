import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { TYPHOON_ADVISORIES_MULTILINGUAL, NAGA_EMERGENCY_HOTLINES } from '../data/offlineData';
import { useOffline } from '../context/OfflineContext';

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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.badge}>RESIDENT SAFETY & RESILIENCE HUB</Text>
        <Text style={styles.title}>Naga Emergency Desk</Text>
        <Text style={styles.subtitle}>Offline-First Calamity Alerts & Barangay Directory</Text>
      </View>

      {/* Typhoon Advisory Banner with PSA Gold & Deep Red */}
      <View style={styles.advisoryCard}>
        <View style={styles.advisoryHeader}>
          <View style={styles.alertIcon} />
          <Text style={styles.advisoryLevel}>{advisory.level}</Text>
        </View>
        <Text style={styles.advisoryTime}>{advisory.time}</Text>

        {/* Language Tabs */}
        <View style={styles.langTabs}>
          {(['bikol', 'filipino', 'english'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.langTab, selectedLang === lang && styles.langTabActive]}
              onPress={() => setSelectedLang(lang)}
            >
              <Text style={[styles.langTabText, selectedLang === lang && styles.langTabTextActive]}>
                {lang === 'bikol' ? 'Bikol' : lang === 'filipino' ? 'Filipino' : 'English'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message in Selected Language */}
        <View style={styles.messageBox}>
          <Text style={styles.advisoryBody}>{advisory[selectedLang]}</Text>
        </View>
      </View>

      {/* Evacuation Centers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearest Evacuation Shelters (Naga City)</Text>
        <View style={styles.shelterCard}>
          <Text style={styles.shelterName}>Naga City Civic Center Evacuation Complex</Text>
          <Text style={styles.shelterLocation}>J. Miranda Ave., Concepcion Pequeña</Text>
          <View style={styles.shelterMeta}>
            <Text style={styles.shelterStatus}>Status: OPEN & READY</Text>
            <Text style={styles.shelterCap}>Capacity: 450 / 800</Text>
          </View>
        </View>
        <View style={styles.shelterCard}>
          <Text style={styles.shelterName}>Camarines Sur National High School (East Wing)</Text>
          <Text style={styles.shelterLocation}>Peñafrancia Ave., Naga City</Text>
          <View style={styles.shelterMeta}>
            <Text style={styles.shelterStatus}>Status: ON STANDBY</Text>
            <Text style={styles.shelterCap}>Capacity: 0 / 1200</Text>
          </View>
        </View>
      </View>

      {/* Emergency Hotlines */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1-Tap Offline Emergency Hotlines</Text>
        <Text style={styles.sectionDesc}>Direct cellular dialing (works even without internet):</Text>
        {NAGA_EMERGENCY_HOTLINES.map((h, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.hotlineCard}
            onPress={() => handleCallHotline(h.service, h.number)}
          >
            <View style={styles.hotlineInfo}>
              <Text style={styles.hotlineService}>{h.service}</Text>
              <Text style={styles.hotlineNumber}>{h.number}</Text>
            </View>
            <View style={styles.callButton}>
              <Text style={styles.callButtonText}>CALL</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060e1e' },
  header: { padding: 20, backgroundColor: '#07152b', borderBottomWidth: 1, borderColor: '#0038a8' },
  badge: { color: '#fdb813', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  title: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#b8bac0', fontSize: 12, marginTop: 2 },
  advisoryCard: { margin: 16, backgroundColor: '#7f1d1d', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ef4444' },
  advisoryHeader: { flexDirection: 'row', alignItems: 'center' },
  alertIcon: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fdb813', marginRight: 8 },
  advisoryLevel: { color: '#fecaca', fontSize: 14, fontWeight: '900' },
  advisoryTime: { color: '#fca5a5', fontSize: 11, marginTop: 2, marginBottom: 12 },
  langTabs: { flexDirection: 'row', backgroundColor: '#450a0a', padding: 4, borderRadius: 8, marginBottom: 10 },
  langTab: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
  langTabActive: { backgroundColor: '#0038a8' },
  langTabText: { color: '#fca5a5', fontSize: 12, fontWeight: '600' },
  langTabTextActive: { color: '#ffffff', fontWeight: '900' },
  messageBox: { backgroundColor: '#450a0a', padding: 12, borderRadius: 8 },
  advisoryBody: { color: '#fff', fontSize: 14, lineHeight: 20 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  sectionDesc: { color: '#b8bac0', fontSize: 12, marginBottom: 10 },
  shelterCard: { backgroundColor: '#07152b', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#0038a8' },
  shelterName: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  shelterLocation: { color: '#b8bac0', fontSize: 12, marginTop: 2 },
  shelterMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  shelterStatus: { color: '#10b981', fontSize: 11, fontWeight: '800' },
  shelterCap: { color: '#fdb813', fontSize: 11, fontWeight: '700' },
  hotlineCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#07152b', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#0038a8' },
  hotlineInfo: { flex: 1 },
  hotlineService: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  hotlineNumber: { color: '#fdb813', fontSize: 12, marginTop: 2, fontWeight: '700' },
  callButton: { backgroundColor: '#0038a8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#fdb813' },
  callButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '900' }
});
