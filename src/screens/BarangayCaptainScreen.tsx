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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* macOS Window Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.badgeGroup}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {(typeof selectedBarangay.category === 'object' ? selectedBarangay.category?.name : selectedBarangay.category) || selectedBarangay.category_name || "Barangay Unit"}
              </Text>
            </View>
            <View style={styles.mviBadge}>
              <Text style={styles.mviBadgeText}>
                MVI {selectedBarangay.vulnerability_index}
              </Text>
            </View>
          </View>

          <View style={styles.gpsPill}>
            <Text style={styles.gpsText}>
              {selectedBarangay.center[1].toFixed(4)}°N, {selectedBarangay.center[0].toFixed(4)}°E
            </Text>
          </View>
        </View>

        <Text style={styles.barangayName}>{selectedBarangay.name}</Text>
        <Text style={styles.barangayMeta}>
          Sangguniang Barangay Executive Console • Naga City, Camarines Sur
        </Text>

        {/* macOS Horizontal Barangay Selector */}
        <View style={styles.selectorWrapper}>
          <Text style={styles.selectorLabel}>SELECT BARANGAY (27 TOTAL)</Text>
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
                  {isSelected && <View style={styles.pillIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* macOS Style Widget Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, isCritical && styles.metricCardAlert]}>
          <Text style={styles.metricLabel}>MULTIDIMENSIONAL VULNERABILITY</Text>
          <View style={styles.metricValueRow}>
            <Text
              style={[
                styles.metricValue,
                { color: isCritical ? macosColors.appleRed : macosColors.appleYellow },
              ]}
            >
              {selectedBarangay.vulnerability_index}
            </Text>
            <Text style={styles.metricUnit}>/ 100</Text>
          </View>
          <Text style={styles.metricSub}>
            {isCritical ? "⚠️ Urgent Intervention Tier" : "Moderate Resilience"}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>TOTAL POPULATION</Text>
          <Text style={styles.metricValue}>
            {selectedBarangay.total_population.toLocaleString()}
          </Text>
          <Text style={styles.metricSub}>
            {selectedBarangay.total_households.toLocaleString()} CBMS Households
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>FOOD INSECURE HHS</Text>
          <Text style={[styles.metricValue, { color: macosColors.appleOrange }]}>
            {selectedBarangay.health_cho?.food_insecurity_pct || "18.4"}%
          </Text>
          <Text style={styles.metricSub}>
            {selectedBarangay.health_cho?.food_insecurity_count || "240"} Families at Risk
          </Text>
        </View>
      </View>

      {/* Empirical Gaps & Identified Deficits Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderTitleRow}>
            <Text style={styles.sectionIcon}>📊</Text>
            <Text style={styles.sectionTitle}>CBMS Empirical Needs & Deficits</Text>
          </View>
          <Text style={styles.sectionBadge}>
            {selectedBarangay.top_needs.length} Gaps
          </Text>
        </View>
        <Text style={styles.sectionDescription}>
          Statistically prioritized based on 2024 PSA Community-Based Monitoring System surveys:
        </Text>

        <View style={styles.needsList}>
          {selectedBarangay.top_needs.map((need, idx) => (
            <View key={idx} style={styles.needRow}>
              <View style={styles.needIndexBadge}>
                <Text style={styles.needIndexText}>0{idx + 1}</Text>
              </View>
              <Text style={styles.needText}>{need}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recommended LGU Programs & Statutory Backing */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderTitleRow}>
            <Text style={styles.sectionIcon}>🏛️</Text>
            <Text style={styles.sectionTitle}>Statutory AIP Pipeline Recommendations</Text>
          </View>
          <Text style={[styles.sectionBadge, { backgroundColor: macosColors.appleBlueSubtle, color: macosColors.appleBlue }]}>
            RA 7160
          </Text>
        </View>

        {requestSent && (
          <View style={styles.toastBanner}>
            <Text style={styles.toastText}>
              ✓ Formally endorsed "{requestSent}" to Mayor & CPDO Queue
            </Text>
          </View>
        )}

        <View style={styles.programsList}>
          {selectedBarangay.recommended_programs.map((prog, idx) => (
            <View key={idx} style={styles.programItem}>
              <View style={styles.programTop}>
                <View style={styles.officeTag}>
                  <Text style={styles.officeTagText}>{prog.office}</Text>
                </View>
                <Text style={styles.sdgTag}>{prog.sdg}</Text>
              </View>

              <Text style={styles.programTitle}>{prog.program}</Text>
              <Text style={styles.programStatute}>
                ⚖️ Legal Basis: {prog.statute}
              </Text>

              <View style={styles.programFooter}>
                <View>
                  <Text style={styles.budgetLabel}>ESTIMATED CEILING</Text>
                  <Text style={styles.budgetValue}>{prog.estimated_budget}</Text>
                </View>
                <TouchableOpacity
                  style={styles.endorseButton}
                  onPress={() => handleEndorseProgram(prog.program)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.endorseButtonText}>Endorse to Mayor ↗</Text>
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
    gap: 14,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: macosColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: macosColors.appleBlueSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  categoryBadgeText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleBlue,
    letterSpacing: 0.2,
  },
  mviBadge: {
    backgroundColor: macosColors.controlBackground,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  mviBadgeText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.nagaGold,
  },
  gpsPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gpsText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '600',
    color: macosColors.textTertiary,
  },
  barangayName: {
    fontFamily: sfFont,
    fontSize: 22,
    fontWeight: '700',
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
  },
  barangayMeta: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  selectorWrapper: {
    borderTopWidth: 1,
    borderTopColor: macosColors.cardBorder,
    paddingTop: 10,
  },
  selectorLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  pillScroller: {
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: macosColors.controlBackground,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    gap: 4,
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
  pillIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: macosColors.cardBackground,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  metricCardAlert: {
    borderColor: 'rgba(255, 69, 58, 0.3)',
    backgroundColor: 'rgba(255, 69, 58, 0.05)',
  },
  metricLabel: {
    fontFamily: sfFont,
    fontSize: 8,
    fontWeight: '700',
    color: macosColors.textTertiary,
    letterSpacing: 0.5,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 4,
  },
  metricValue: {
    fontFamily: sfFont,
    fontSize: 18,
    fontWeight: '700',
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  metricUnit: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textTertiary,
  },
  metricSub: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: macosColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '700',
    color: macosColors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionBadge: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.nagaGold,
    backgroundColor: macosColors.nagaGoldSubtle,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionDescription: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginBottom: 12,
  },
  needsList: {
    gap: 8,
  },
  needRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    gap: 10,
  },
  needIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: macosColors.controlBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needIndexText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.nagaGold,
  },
  needText: {
    flex: 1,
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '500',
    color: macosColors.textPrimary,
  },
  toastBanner: {
    backgroundColor: macosColors.appleGreenSubtle,
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  toastText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.appleGreen,
    textAlign: 'center',
  },
  programsList: {
    gap: 10,
  },
  programItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  programTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  officeTag: {
    backgroundColor: macosColors.appleBlueSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  officeTagText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.appleBlue,
  },
  sdgTag: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.appleGreen,
  },
  programTitle: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '700',
    color: macosColors.textPrimary,
    marginBottom: 4,
  },
  programStatute: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginBottom: 10,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: macosColors.cardBorder,
    paddingTop: 8,
  },
  budgetLabel: {
    fontFamily: sfFont,
    fontSize: 8,
    fontWeight: '600',
    color: macosColors.textTertiary,
    letterSpacing: 0.5,
  },
  budgetValue: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.nagaGold,
  },
  endorseButton: {
    backgroundColor: macosColors.appleBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#0a84ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  endorseButtonText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
