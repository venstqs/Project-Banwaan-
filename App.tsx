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
import { SpatialProfileScreen } from './src/screens/SpatialProfileScreen';
import { MacosTitleBar } from './src/components/MacosTitleBar';
import { macosColors, macosTypography, sfFont } from './src/config/macosTheme';

type Tab = 'captain' | 'spatial' | 'inspection' | 'safety' | 'agent';

const TABS: { id: Tab; label: string; icon: string; shortcut: string }[] = [
  { id: 'captain', label: 'Council', icon: '🏛️', shortcut: '⌘1' },
  { id: 'spatial', label: 'Spatial', icon: '🗺️', shortcut: '⌘2' },
  { id: 'inspection', label: 'Inspector', icon: '📋', shortcut: '⌘3' },
  { id: 'safety', label: 'Alerts', icon: '🚨', shortcut: '⌘4' },
  { id: 'agent', label: 'AI', icon: '✨', shortcut: '⌘5' },
];

function MainContent() {
  const [activeTab, setActiveTab] = useState<Tab>('captain');
  const { isOnline, toggleNetwork } = useOffline();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* macOS Main Window Canvas */}
      <View style={styles.macWindow}>
        {/* macOS Title Bar with Red/Yellow/Green Traffic Lights */}
        <MacosTitleBar
          title="Project Banwaan"
          subtitle="Naga City (PSA CBMS)"
          isOnline={isOnline}
          onToggleNetwork={toggleNetwork}
        />

        {/* macOS Segmented Control Tab Switcher */}
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
                  {isActive && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Active Workspace Viewport */}
        <View style={styles.viewport}>
          {activeTab === 'captain' && <BarangayCaptainScreen />}
          {activeTab === 'spatial' && <SpatialProfileScreen />}
          {activeTab === 'inspection' && <FieldInspectionScreen />}
          {activeTab === 'safety' && <ResidentSafetyScreen />}
          {activeTab === 'agent' && <MobileAgentScreen />}
        </View>

        {/* macOS Bottom Dock Bar */}
        <View style={styles.dockBar}>
          <View style={styles.dockStatus}>
            <View style={styles.dockPulseDot} />
            <Text style={styles.dockText}>
              PSA CBMS v2.4 • RA 7160 / RA 10121 Statutory Engine
            </Text>
          </View>
          <Text style={styles.dockVersion}>macOS Sequoia Style</Text>
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: macosColors.sidebarBackground,
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 7,
    gap: 5,
  },
  segmentBtnActive: {
    backgroundColor: macosColors.cardBackgroundElevated,
    borderWidth: 1,
    borderColor: macosColors.controlBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
    color: macosColors.textPrimary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: macosColors.appleBlue,
    marginLeft: 2,
  },
  viewport: {
    flex: 1,
  },
  dockBar: {
    height: 32,
    backgroundColor: macosColors.sidebarBackground,
    borderTopWidth: 1,
    borderTopColor: macosColors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  dockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    color: macosColors.textTertiary,
  },
  dockVersion: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '600',
    color: macosColors.textTertiary,
    letterSpacing: 0.3,
  },
});
