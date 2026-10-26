import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { OfflineProvider } from './src/context/OfflineContext';
import { BarangayCaptainScreen } from './src/screens/BarangayCaptainScreen';
import { ResidentSafetyScreen } from './src/screens/ResidentSafetyScreen';
import { FieldInspectionScreen } from './src/screens/FieldInspectionScreen';
import { MobileAgentScreen } from './src/screens/MobileAgentScreen';

type Tab = 'captain' | 'inspection' | 'safety' | 'agent';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('captain');

  return (
    <OfflineProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#07152b" />

        {/* Top PSA Brand Header */}
        <View style={styles.topBrand}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <View style={styles.brandTitleCol}>
            <Text style={styles.brandTitle}>PROJECT BANWAAN</Text>
            <Text style={styles.brandSub}>PSA CBMS • NAGA CITY • OFFLINE-FIRST</Text>
          </View>
        </View>
        
        {/* Main Screen Content */}
        <View style={styles.content}>
          {activeTab === 'captain' && <BarangayCaptainScreen />}
          {activeTab === 'inspection' && <FieldInspectionScreen />}
          {activeTab === 'safety' && <ResidentSafetyScreen />}
          {activeTab === 'agent' && <MobileAgentScreen />}
        </View>

        {/* Bottom Tab Bar (PSA Theme) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'captain' && styles.tabItemActive]}
            onPress={() => setActiveTab('captain')}
          >
            <Text style={styles.tabIcon}>🏛️</Text>
            <Text style={[styles.tabLabel, activeTab === 'captain' && styles.tabLabelActive]}>
              Barangay
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'inspection' && styles.tabItemActive]}
            onPress={() => setActiveTab('inspection')}
          >
            <Text style={styles.tabIcon}>📋</Text>
            <Text style={[styles.tabLabel, activeTab === 'inspection' && styles.tabLabelActive]}>
              Inspection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'safety' && styles.tabItemActive]}
            onPress={() => setActiveTab('safety')}
          >
            <Text style={styles.tabIcon}>🚨</Text>
            <Text style={[styles.tabLabel, activeTab === 'safety' && styles.tabLabelActive]}>
              Alerts & SOS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'agent' && styles.tabItemActive]}
            onPress={() => setActiveTab('agent')}
          >
            <Text style={styles.tabIcon}>🤖</Text>
            <Text style={[styles.tabLabel, activeTab === 'agent' && styles.tabLabelActive]}>
              Banwaan AI
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </OfflineProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060e1e' },
  topBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07152b',
    borderBottomWidth: 1,
    borderColor: '#0038a8',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0038a8',
    borderWidth: 1.5,
    borderColor: '#fdb813',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  logoText: { color: '#fdb813', fontWeight: '900', fontSize: 16 },
  brandTitleCol: { flex: 1 },
  brandTitle: { color: '#ffffff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  brandSub: { color: '#fdb813', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#07152b',
    borderTopWidth: 1,
    borderColor: '#0038a8',
    paddingVertical: 8,
    paddingHorizontal: 6
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8
  },
  tabItemActive: {
    backgroundColor: '#0a2540',
    borderWidth: 1,
    borderColor: '#0038a8'
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  tabLabel: {
    color: '#b8bac0',
    fontSize: 11,
    fontWeight: '600'
  },
  tabLabelActive: {
    color: '#fdb813',
    fontWeight: '900'
  }
});
