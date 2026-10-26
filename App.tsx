import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Platform,
  Modal,
  TextInput,
  ScrollView,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OfflineProvider, useOffline } from './src/context/OfflineContext';
import { BarangayCaptainScreen } from './src/screens/BarangayCaptainScreen';
import { ResidentSafetyScreen } from './src/screens/ResidentSafetyScreen';
import { FieldInspectionScreen } from './src/screens/FieldInspectionScreen';
import { MobileAgentScreen } from './src/screens/MobileAgentScreen';
import { SpatialProfileScreen } from './src/screens/SpatialProfileScreen';
import { MacosTitleBar } from './src/components/MacosTitleBar';
import {
  VERIFIED_HOTLINES_DETAILED,
  SEARCHABLE_INDICATORS,
  STATUTORY_MANDATES,
} from './src/data/offlineData';
import { macosColors, sfFont } from './src/config/macosTheme';

type Tab = 'captain' | 'spatial' | 'inspection' | 'safety' | 'agent';

function MainContent() {
  const [activeTab, setActiveTab] = useState<Tab>('captain');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'hotlines' | 'indicators' | 'barangays' | 'laws'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    isOnline,
    toggleNetwork,
    mobileRole,
    setMobileRole,
    allBarangays,
    setSelectedBarangayId,
  } = useOffline();

  const TABS = useMemo(
    () => [
      {
        id: 'captain' as Tab,
        label: mobileRole === 'barangay_captain' ? 'Council' : 'Public',
        icon: '🏛️',
      },
      { id: 'spatial' as Tab, label: 'Spatial', icon: '🗺️' },
      {
        id: 'inspection' as Tab,
        label: mobileRole === 'barangay_captain' ? 'Inspector' : 'Report',
        icon: '📋',
      },
      { id: 'safety' as Tab, label: 'Safety', icon: '🚨' },
      { id: 'agent' as Tab, label: 'AI Copilot', icon: '✨' },
    ],
    [mobileRole]
  );

  const copyToClipboard = (text: string, id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredHotlines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return VERIFIED_HOTLINES_DETAILED;
    return VERIFIED_HOTLINES_DETAILED.filter(
      (h) =>
        h.agency.toLowerCase().includes(q) ||
        h.subtext.toLowerCase().includes(q) ||
        h.primaryPhone.includes(q) ||
        (q.includes('911') && h.id === 'cdrrmo') ||
        (q.includes('police') && h.id === 'pnp') ||
        (q.includes('fire') && h.id === 'bfp') ||
        (q.includes('hospital') && h.id === 'bmc')
    );
  }, [searchQuery]);

  const filteredIndicators = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SEARCHABLE_INDICATORS;
    return SEARCHABLE_INDICATORS.filter(
      (ind) =>
        ind.name.toLowerCase().includes(q) ||
        ind.dept.toLowerCase().includes(q) ||
        ind.summary.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredBarangaysList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allBarangays.slice(0, 8);
    return allBarangays.filter(
      (b) =>
        b.realName.toLowerCase().includes(q) ||
        b.category.name.toLowerCase().includes(q) ||
        b.category.short.toLowerCase().includes(q) ||
        String(b.id) === q
    );
  }, [allBarangays, searchQuery]);

  const filteredLaws = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return STATUTORY_MANDATES;
    return STATUTORY_MANDATES.filter(
      (l) => l.code.toLowerCase().includes(q) || l.title.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Main Window Canvas */}
      <View style={styles.macWindow}>
        {/* macOS Title Bar with Red/Yellow/Green Traffic Lights + Role Switcher */}
        <MacosTitleBar
          title="Project Banwaan"
          subtitle="Naga City (PSA CBMS v2.6)"
          isOnline={isOnline}
          onToggleNetwork={toggleNetwork}
          mobileRole={mobileRole}
          onSelectRole={setMobileRole}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Segmented Pill Tab Switcher */}
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
              PSA CBMS v2.6 • RA 7160 & RA 10121 Statutory Engine
            </Text>
          </View>
          <View style={styles.dockPill}>
            <Text style={styles.dockPillText}>
              {mobileRole === 'barangay_captain' ? 'Council Mode' : 'Citizen Mode'}
            </Text>
          </View>
        </View>
      </View>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE SPOTLIGHT OMNISEARCH MODAL
         ───────────────────────────────────────────────────────────── */}
      <Modal
        visible={isSearchOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSearchOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalCard}>
            {/* Search Input Bar */}
            <View style={styles.modalSearchTop}>
              <Text style={styles.searchModalIcon}>🔍</Text>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search hotlines (911), indicators, 27 barangays, laws..."
                placeholderTextColor={macosColors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsSearchOpen(false)}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <View style={styles.modalChipsRow}>
              {[
                { id: 'all', label: 'All' },
                { id: 'hotlines', label: '🚨 Hotlines (911)' },
                { id: 'indicators', label: '📊 Indicators' },
                { id: 'barangays', label: '📍 27 Barangays' },
                { id: 'laws', label: '⚖️ Laws' },
              ].map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  style={[
                    styles.modalFilterChip,
                    searchCategory === chip.id && styles.modalFilterChipActive,
                  ]}
                  onPress={() => setSearchCategory(chip.id as any)}
                >
                  <Text
                    style={[
                      styles.modalFilterChipText,
                      searchCategory === chip.id && styles.modalFilterChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search Results List */}
            <ScrollView style={styles.modalResultsScroll} contentContainerStyle={styles.modalResultsContent}>
              {/* 1. Hotlines */}
              {(searchCategory === 'all' || searchCategory === 'hotlines') && (
                <View style={styles.resultGroup}>
                  <Text style={styles.resultGroupTitle}>🚨 Verified Naga City Emergency Hotlines</Text>
                  {filteredHotlines.map((h) => (
                    <View key={h.id} style={styles.resultCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultCardTitle}>{h.agency}</Text>
                        <Text style={styles.resultCardSub}>{h.subtext}</Text>
                        <Text style={styles.resultCardPhone}>{h.primaryPhone} | {h.landline}</Text>
                      </View>
                      <View style={styles.resultCardActions}>
                        <TouchableOpacity
                          style={styles.modalCallBtn}
                          onPress={() => Linking.openURL(`tel:${h.primaryPhone.replace(/[^0-9]/g, '')}`).catch(() => {})}
                        >
                          <Text style={styles.modalCallBtnText}>Call ↗</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.modalCopyBtn}
                          onPress={() => copyToClipboard(h.primaryPhone, h.id)}
                        >
                          <Text style={styles.modalCopyBtnText}>
                            {copiedId === h.id ? '✓' : 'Copy'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* 2. CBMS Indicators */}
              {(searchCategory === 'all' || searchCategory === 'indicators') && (
                <View style={styles.resultGroup}>
                  <Text style={styles.resultGroupTitle}>📊 PSA CBMS Vulnerability Indicators</Text>
                  {filteredIndicators.map((ind) => (
                    <View key={ind.id} style={styles.resultCard}>
                      <Text style={styles.resultEmoji}>{ind.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={styles.indTitleRow}>
                          <Text style={styles.resultCardTitle}>{ind.name}</Text>
                          <View style={styles.metricPill}>
                            <Text style={styles.metricPillText}>{ind.metric}</Text>
                          </View>
                        </View>
                        <Text style={styles.resultCardSub}>{ind.summary}</Text>
                        <Text style={styles.resultDept}>{ind.dept}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* 3. 27 Barangays */}
              {(searchCategory === 'all' || searchCategory === 'barangays') && (
                <View style={styles.resultGroup}>
                  <Text style={styles.resultGroupTitle}>📍 Naga City 27 Barangays</Text>
                  {filteredBarangaysList.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={styles.resultCard}
                      onPress={() => {
                        setSelectedBarangayId(b.id);
                        setIsSearchOpen(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultCardTitle}>
                          #{b.id} {b.realName}
                        </Text>
                        <Text style={styles.resultCardSub}>
                          {b.category.name} • {b.total_households.toLocaleString()} HHs
                        </Text>
                      </View>
                      <View style={styles.mviJumpPill}>
                        <Text style={styles.mviJumpText}>MVI {b.vulnerability_index} →</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* 4. Statutory Laws */}
              {(searchCategory === 'all' || searchCategory === 'laws') && (
                <View style={styles.resultGroup}>
                  <Text style={styles.resultGroupTitle}>⚖️ Statutory Mandates</Text>
                  {filteredLaws.map((law, idx) => (
                    <View key={idx} style={styles.resultCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultCardTitle}>{law.code}</Text>
                        <Text style={styles.resultCardSub}>{law.title}</Text>
                        <Text style={styles.resultDept}>Mandate: {law.office} • {law.sdg}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    padding: 3,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 18,
    gap: 4,
  },
  segmentBtnActive: {
    backgroundColor: macosColors.appleBlue,
    shadowColor: '#05389f',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 2,
  },
  segmentIcon: {
    fontSize: 12,
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
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: macosColors.nagaGoldBorder,
  },
  dockPillText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: '#854d0e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  searchModalCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalSearchTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  searchModalIcon: {
    fontSize: 15,
  },
  modalSearchInput: {
    flex: 1,
    fontFamily: sfFont,
    fontSize: 13,
    color: macosColors.textPrimary,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  modalChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalFilterChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalFilterChipActive: {
    backgroundColor: macosColors.appleBlue,
    borderColor: macosColors.appleBlue,
  },
  modalFilterChipText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  modalFilterChipTextActive: {
    color: '#ffffff',
  },
  modalResultsScroll: {
    flex: 1,
  },
  modalResultsContent: {
    padding: 12,
    gap: 12,
    paddingBottom: 24,
  },
  resultGroup: {
    gap: 6,
  },
  resultGroupTitle: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: macosColors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  resultEmoji: {
    fontSize: 18,
  },
  resultCardTitle: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  resultCardSub: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginTop: 1,
  },
  resultCardPhone: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleBlue,
    marginTop: 2,
  },
  resultDept: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '600',
    color: macosColors.textTertiary,
    marginTop: 2,
  },
  indTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricPill: {
    backgroundColor: '#edf3fc',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  metricPillText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  resultCardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  modalCallBtn: {
    backgroundColor: macosColors.appleBlue,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modalCallBtnText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCopyBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modalCopyBtnText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  mviJumpPill: {
    backgroundColor: '#edf3fc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mviJumpText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
});
