import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useOffline } from '../context/OfflineContext';
import { macosColors, macosTypography, sfFont } from '../config/macosTheme';

export const BarangayCaptainScreen: React.FC = () => {
  const { selectedBarangay, setSelectedBarangayId, allBarangays, isOnline, submitReport } = useOffline();
  const [requestSent, setRequestSent] = useState<string | null>(null);

  const handleEndorseProgram = async (programTitle: string) => {
    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.name,
      reportType: "Program Endorsement",
      description: `Barangay Council formally endorses LGU program: ${programTitle} for AIP 2026 inclusion.`,
      latitude: selectedBarangay.center[1],
      longitude: selectedBarangay.center[0]
    });
    setRequestSent(programTitle);
    setTimeout(() => setRequestSent(null), 4000);
  };

  const isCritical = selectedBarangay.vulnerability_index > 65;
  const categoryName = (typeof selectedBarangay.category === 'object' ? selectedBarangay.category?.name : selectedBarangay.category) || selectedBarangay.category_name || "Barangay Unit";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Banner Card (White with Header + Barangay Selector) */}
      <View style={styles.whiteCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleCol}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{categoryName}</Text>
              </View>
              <View style={styles.statusChip}>
                <View style={styles.statusDot} />
                <Text style={styles.statusChipText}>
                  {isOnline ? "Setup Complete • Live" : "Offline Cache • Active"}
                </Text>
              </View>
            </View>

            <Text style={styles.mainTitle}>{selectedBarangay.name}</Text>
            <Text style={styles.subTitle}>
              All indicators inferred from PSA Community-Based Monitoring System.
            </Text>
          </View>

          <View style={styles.mviPill}>
            <Text style={styles.mviPillLabel}>MVI</Text>
            <Text style={styles.mviPillVal}>{selectedBarangay.vulnerability_index}</Text>
          </View>
        </View>

        {/* Horizontal Barangay Scroller */}
        <View style={styles.selectorWrapper}>
          <Text style={styles.selectorLabel}>BARANGAY NAVIGATOR (27 TOTAL)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillScroller}
          >
            {allBarangays.map((b) => {
              const isSelected = selectedBarangay.id === b.id;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setSelectedBarangayId(b.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Signature Sunshine Yellow Card (Directly from Reference Image) */}
      <View style={styles.yellowFeatureCard}>
        <View style={styles.yellowHeader}>
          <View>
            <Text style={styles.yellowTitle}>
              {isCritical ? "Priority Calamity Hotspot" : "Statutory Action Queue"}
            </Text>
            <Text style={styles.yellowSub}>
              {isCritical
                ? `High vulnerable delta requiring urgent DRRM roof retrofit and drainage.`
                : `Annual Investment Program (AIP) council resolution ready for Mayor review.`}
            </Text>
          </View>
          <View style={styles.yellowBadge}>
            <Text style={styles.yellowBadgeText}>Do first</Text>
          </View>
        </View>

        <View style={styles.yellowActionRow}>
          <View style={styles.yellowTag}>
            <Text style={styles.yellowTagText}>⚖️ RA 7160 Sec 106</Text>
          </View>
          <View style={styles.yellowTag}>
            <Text style={styles.yellowTagText}>⏱ AIP 2026</Text>
          </View>
          <TouchableOpacity
            style={styles.yellowButton}
            onPress={() => handleEndorseProgram(selectedBarangay.recommended_programs[0]?.program || "AIP Capital Interventions")}
            activeOpacity={0.8}
          >
            <Text style={styles.yellowButtonText}>Endorse Now →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Detected 4-Grid Diagnostic Cards (Matching Reference Image) */}
      <View style={styles.gridContainer}>
        <View style={styles.gridCard}>
          <View style={[styles.gridIconCircle, { backgroundColor: macosColors.appleBlueSubtle }]}>
            <Text style={styles.gridEmoji}>👥</Text>
          </View>
          <Text style={styles.gridVal}>{selectedBarangay.total_population.toLocaleString()}</Text>
          <Text style={styles.gridLabel}>Residents</Text>
          <Text style={styles.gridSub}>{selectedBarangay.total_households.toLocaleString()} Households</Text>
        </View>

        <View style={styles.gridCard}>
          <View style={[styles.gridIconCircle, { backgroundColor: macosColors.applePurpleSubtle }]}>
            <Text style={styles.gridEmoji}>💧</Text>
          </View>
          <Text style={[styles.gridVal, { color: macosColors.appleBlue }]}>
            {selectedBarangay.infrastructure_ceo?.drinking_refilling_pct || 75}%
          </Text>
          <Text style={styles.gridLabel}>Refilling Dependency</Text>
          <Text style={styles.gridSub}>Water Access Gap</Text>
        </View>

        <View style={styles.gridCard}>
          <View style={[styles.gridIconCircle, { backgroundColor: macosColors.appleGreenSubtle }]}>
            <Text style={styles.gridEmoji}>🌾</Text>
          </View>
          <Text style={[styles.gridVal, { color: macosColors.appleOrange }]}>
            {selectedBarangay.health_cho?.food_insecurity_pct || 18.4}%
          </Text>
          <Text style={styles.gridLabel}>Food Insecure HHs</Text>
          <Text style={styles.gridSub}>{selectedBarangay.health_cho?.food_insecurity_count || 240} Families</Text>
        </View>

        <View style={styles.gridCard}>
          <View style={[styles.gridIconCircle, { backgroundColor: macosColors.nagaGoldSubtle }]}>
            <Text style={styles.gridEmoji}>🏠</Text>
          </View>
          <Text style={[styles.gridVal, { color: macosColors.appleRed }]}>
            {selectedBarangay.vulnerability_index > 65 ? "Tier 1" : "Tier 2"}
          </Text>
          <Text style={styles.gridLabel}>Intervention Level</Text>
          <Text style={styles.gridSub}>PCA Vulnerability</Text>
        </View>
      </View>

      {/* Identified Deficits & Programs */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Identified Needs & Deficits</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{selectedBarangay.top_needs.length} Identified</Text>
          </View>
        </View>

        {requestSent && (
          <View style={styles.toastBanner}>
            <Text style={styles.toastText}>✓ Successfully queued endorsement for "{requestSent}"</Text>
          </View>
        )}

        <View style={styles.needsList}>
          {selectedBarangay.top_needs.map((need, idx) => (
            <View key={idx} style={styles.needRow}>
              <View style={styles.needNumberBadge}>
                <Text style={styles.needNumberText}>0{idx + 1}</Text>
              </View>
              <Text style={styles.needText}>{need}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recommended Statutory Pipeline */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Statutory Pipeline</Text>
          <View style={[styles.countBadge, { backgroundColor: macosColors.appleBlueSubtle }]}>
            <Text style={[styles.countBadgeText, { color: macosColors.appleBlue }]}>RA 7160</Text>
          </View>
        </View>

        <View style={styles.programsList}>
          {selectedBarangay.recommended_programs.map((prog, idx) => (
            <View key={idx} style={styles.programCard}>
              <View style={styles.progTop}>
                <View style={styles.progOfficeBadge}>
                  <Text style={styles.progOfficeText}>{prog.office}</Text>
                </View>
                <Text style={styles.progSdg}>{prog.sdg}</Text>
              </View>

              <Text style={styles.progTitle}>{prog.program}</Text>
              <Text style={styles.progStatute}>Legal Mandate: {prog.statute}</Text>

              <View style={styles.progFooter}>
                <Text style={styles.progBudget}>{prog.estimated_budget}</Text>
                <TouchableOpacity
                  style={styles.endorseBtn}
                  onPress={() => handleEndorseProgram(prog.program)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.endorseBtnText}>Endorse to Mayor ↗</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryPill: {
    backgroundColor: macosColors.appleBlueSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: macosColors.appleBlueBorder,
  },
  categoryPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleBlue,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: macosColors.appleGreenSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: macosColors.appleGreenBorder,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: macosColors.appleGreen,
  },
  statusChipText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: '#065f46',
  },
  mainTitle: {
    fontFamily: sfFont,
    fontSize: 22,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
  },
  subTitle: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  mviPill: {
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  mviPillLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.textTertiary,
  },
  mviPillVal: {
    fontFamily: sfFont,
    fontSize: 18,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  selectorWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 12,
  },
  selectorLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillScroller: {
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: macosColors.appleBlue,
    borderColor: macosColors.appleBlue,
  },
  pillText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  yellowFeatureCard: {
    backgroundColor: macosColors.nagaGold,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  yellowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  yellowTitle: {
    fontFamily: sfFont,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  yellowSub: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: '#334155',
    marginTop: 2,
    maxWidth: 240,
  },
  yellowBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  yellowBadgeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
  },
  yellowActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yellowTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yellowTagText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#0f172a',
  },
  yellowButton: {
    marginLeft: 'auto',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  yellowButtonText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  gridIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridEmoji: {
    fontSize: 15,
  },
  gridVal: {
    fontFamily: sfFont,
    fontSize: 17,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.3,
  },
  gridLabel: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: macosColors.textPrimary,
    marginTop: 2,
  },
  gridSub: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textTertiary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  toastBanner: {
    backgroundColor: macosColors.appleGreenSubtle,
    borderWidth: 1,
    borderColor: macosColors.appleGreenBorder,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  toastText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
    textAlign: 'center',
  },
  needsList: {
    gap: 8,
  },
  needRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  needNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needNumberText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.textSecondary,
  },
  needText: {
    flex: 1,
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '500',
    color: macosColors.textPrimary,
  },
  programsList: {
    gap: 10,
  },
  programCard: {
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progOfficeBadge: {
    backgroundColor: macosColors.appleBlueSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: macosColors.appleBlueBorder,
  },
  progOfficeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  progSdg: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.appleGreen,
  },
  progTitle: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '700',
    color: macosColors.textPrimary,
    marginTop: 2,
  },
  progStatute: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginBottom: 8,
  },
  progFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  progBudget: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  endorseBtn: {
    backgroundColor: macosColors.appleBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  endorseBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
