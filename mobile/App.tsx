import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OfflineProvider, useOffline } from './src/context/OfflineContext';
import { BarangayCaptainScreen } from './src/screens/BarangayCaptainScreen';
import { ResidentSafetyScreen } from './src/screens/ResidentSafetyScreen';
import { FieldInspectionScreen } from './src/screens/FieldInspectionScreen';
import { MobileAgentScreen } from './src/screens/MobileAgentScreen';

type Tab = 'captain' | 'inspection' | 'safety' | 'agent';

const MainShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('captain');
  const { isOnline, toggleNetwork, queuedReports } = useOffline();
  const pendingSyncCount = queuedReports.filter((r) => !r.isSynced).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Project Banwaan</Text>
            <Text style={styles.brandSub}>PSA CBMS • Naga City</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.networkPill, isOnline ? styles.netOnline : styles.netOffline]}
          onPress={toggleNetwork}
          activeOpacity={0.75}
        >
          <View style={[styles.netDot, { backgroundColor: isOnline ? '#10B981' : '#F59E0B' }]} />
          <Text style={[styles.netText, { color: isOnline ? '#065F46' : '#B45309' }]}>
            {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {activeTab === 'captain' && <BarangayCaptainScreen />}
        {activeTab === 'inspection' && <FieldInspectionScreen />}
        {activeTab === 'safety' && <ResidentSafetyScreen />}
        {activeTab === 'agent' && <MobileAgentScreen />}
      </View>

      <View style={styles.tabBar}>
        <TabButton active={activeTab === 'captain'} icon="business-outline" activeIcon="business" label="Barangay" onPress={() => setActiveTab('captain')} />
        <TabButton active={activeTab === 'inspection'} icon="camera-outline" activeIcon="camera" label="Geotag" onPress={() => setActiveTab('inspection')} />
        <TabButton active={activeTab === 'safety'} icon="shield-checkmark-outline" activeIcon="shield-checkmark" label="Alerts" onPress={() => setActiveTab('safety')} />
        <TabButton active={activeTab === 'agent'} icon="sparkles-outline" activeIcon="sparkles" label="Banwaan AI" onPress={() => setActiveTab('agent')} />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <OfflineProvider>
      <MainShell />
    </OfflineProvider>
  );
}

interface TabButtonProps {
  active: boolean;
  icon: any;
  activeIcon: any;
  label: string;
  badge?: number;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ active, icon, activeIcon, label, badge, onPress }) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.iconWrapper}>
      <Ionicons name={active ? activeIcon : icon} size={22} color={active ? '#2563EB' : '#64748B'} />
      {badge !== undefined && (
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
  brandTitle: { color: '#0F172A', fontWeight: '800', fontSize: 16 },
  brandSub: { color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 1 },
  networkPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  netOnline: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  netOffline: { backgroundColor: '#FEF9E7', borderColor: '#FDE68A' },
  netDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  netText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  contentArea: { flex: 1, backgroundColor: '#F8FAFC' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 8 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  iconWrapper: { position: 'relative' },
  badgePill: { position: 'absolute', top: -4, right: -10, backgroundColor: '#E11D48', borderRadius: 8, minWidth: 16, height: 16, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  tabLabel: { color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 4 },
  tabLabelActive: { color: '#2563EB', fontWeight: '700' },
});