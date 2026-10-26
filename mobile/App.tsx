import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OfflineProvider, useOffline } from './src/context/OfflineContext';
import { BarangayCaptainScreen } from './src/screens/BarangayCaptainScreen';
import { ResidentSafetyScreen } from './src/screens/ResidentSafetyScreen';
import { FieldInspectionScreen } from './src/screens/FieldInspectionScreen';
import { MobileAgentScreen } from './src/screens/MobileAgentScreen';

type Tab = 'captain' | 'inspection' | 'safety' | 'agent';

const MainShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('captain');
  const { isOnline, toggleNetwork } = useOffline();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          {/* Official Banwaan Logo Asset */}
          <Image
            source={require('./assets/banwaan.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Project Banwaan</Text>
              <View style={styles.versionTag}>
                <Text style={styles.versionTagText}>v2.4</Text>
              </View>
            </View>
            <Text style={styles.brandSub}>PSA CBMS • Naga City</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.networkPill, isOnline ? styles.netOnline : styles.netOffline]}
          onPress={toggleNetwork}
          activeOpacity={0.75}
        >
          <View style={[styles.netDot, { backgroundColor: isOnline ? '#10B981' : '#F59E0B' }]} />
          <Text style={[styles.netText, { color: isOnline ? '#047857' : '#B45309' }]}>
            {isOnline ? '27 Barangays Mapped' : 'Offline Mode'}
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
        <TabButton
          active={activeTab === 'captain'}
          icon="business-outline"
          activeIcon="business"
          label="Barangay"
          onPress={() => setActiveTab('captain')}
        />
        <TabButton
          active={activeTab === 'inspection'}
          icon="camera-outline"
          activeIcon="camera"
          label="Geotag"
          onPress={() => setActiveTab('inspection')}
        />
        <TabButton
          active={activeTab === 'safety'}
          icon="shield-checkmark-outline"
          activeIcon="shield-checkmark"
          label="Alerts"
          onPress={() => setActiveTab('safety')}
        />
        <TabButton
          active={activeTab === 'agent'}
          icon="sparkles-outline"
          activeIcon="sparkles"
          label="Banwaan AI"
          onPress={() => setActiveTab('agent')}
        />
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
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ active, icon, activeIcon, label, onPress }) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconPill, active && styles.iconPillActive]}>
      <Ionicons name={active ? activeIcon : icon} size={20} color={active ? '#FFFFFF' : '#64748B'} />
    </View>
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandTitle: { color: '#0F172A', fontWeight: '700', fontSize: 15, letterSpacing: -0.3 },
  versionTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  versionTagText: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  brandSub: { color: '#64748B', fontSize: 11, fontWeight: '500', marginTop: 1 },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  netOnline: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  netOffline: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  netDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  netText: { fontSize: 11, fontWeight: '600' },
  contentArea: { flex: 1, backgroundColor: '#F8FAFC' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  iconPill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },
  iconPillActive: {
    backgroundColor: '#05389F',
  },
  tabLabel: { color: '#64748B', fontSize: 11, fontWeight: '500', marginTop: 3 },
  tabLabelActive: { color: '#05389F', fontWeight: '700' },
});