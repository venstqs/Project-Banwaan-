import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OfflineProvider, useOffline } from './src/context/OfflineContext';
import { BarangayCaptainScreen } from './src/screens/BarangayCaptainScreen';
import { ResidentSafetyScreen } from './src/screens/ResidentSafetyScreen';
import { FieldInspectionScreen } from './src/screens/FieldInspectionScreen';
import { MobileAgentScreen } from './src/screens/MobileAgentScreen';
import { MacosTitleBar } from './src/components/MacosTitleBar';
import { macosColors, macosTypography, sfFont } from './src/config/macosTheme';

type Tab = 'captain' | 'inspection' | 'safety' | 'agent';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'captain', label: 'Overview', icon: '🏛️' },
  { id: 'inspection', label: 'Inspector', icon: '📋' },
  { id: 'safety', label: 'Emergency', icon: '🚨' },
  { id: 'agent', label: 'Statutory AI', icon: '✨' },
];

function MainContent() {
  const [activeTab, setActiveTab] = useState<Tab>('captain');
  const { isOnline, toggleNetwork } = useOffline();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* macOS Main Window Canvas */}
      <View style={styles.macWindow}>
        {/* macOS Title Bar with Red/Yellow/Green Traffic Lights */}
        <MacosTitleBar
          title="Project Banwaan"
          subtitle="Naga City (PSA CBMS)"
          isOnline={isOnline}
          onToggleNetwork={toggleNetwork}
        />

        {/* OrchestrateIQ Segmented Pill Tab Switcher */}
        <View style={styles.segmentedControlWrapper}>
          <View style={styles.segmentedControl}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.segmentIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.segmentText,
                      isActive && styles.segmentTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Active Workspace Viewport */}
        <View style={styles.viewport}>
          {activeTab === 'captain' && <BarangayCaptainScreen />}
          {activeTab === 'inspection' && <FieldInspectionScreen />}
          {activeTab === 'safety' && <ResidentSafetyScreen />}
          {activeTab === 'agent' && <MobileAgentScreen />}
        </View>

        {/* macOS Bottom Dock Bar */}
        <View style={styles.dockBar}>
          <View style={styles.dockStatus}>
            <View style={styles.dockPulseDot} />
            <Text style={styles.dockText}>
              PSA CBMS v2.4 • RA 7160 & RA 10121 Statutory Engine
            </Text>
          </View>
          <View style={styles.dockPill}>
            <Text style={styles.dockPillText}>LGU Naga</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <OfflineProvider>
      <MainContent />
    </OfflineProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: macosColors.windowBackground,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  macWindow: {
    flex: 1,
    backgroundColor: macosColors.windowBackground,
    flexDirection: 'column',
  },
  segmentedControlWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    padding: 3.5,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 20,
    gap: 5,
  },
  segmentBtnActive: {
    backgroundColor: macosColors.appleBlue,
    shadowColor: '#05389f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentIcon: {
    fontSize: 13,
  },
  segmentText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textSecondary,
    letterSpacing: -0.2,
  },
  segmentTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  viewport: {
    flex: 1,
    backgroundColor: macosColors.windowBackground,
  },
  dockBar: {
    height: 36,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: macosColors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dockPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: macosColors.appleGreen,
  },
  dockText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textSecondary,
  },
  dockPill: {
    backgroundColor: macosColors.nagaGoldSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: macosColors.nagaGoldBorder,
  },
  dockPillText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: '#854d0e',
  },
});
