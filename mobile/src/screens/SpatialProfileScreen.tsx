import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useOffline } from '../context/OfflineContext';
import { CATEGORY_FILTERS } from '../data/offlineData';
import { macosColors, sfFont } from '../config/macosTheme';

const mviColor = (mvi: number) => (mvi >= 70 ? '#ef4444' : mvi >= 50 ? '#f59e0b' : '#10b981');

export const SpatialProfileScreen: React.FC = () => {
  const {
    allBarangays,
    selectedBarangay,
    setSelectedBarangayId,
    selectedCategoryFilter,
    handleSelectCategory,
    isOnline,
  } = useOffline();

  const points = useMemo(() => {
    const lngs = allBarangays.map((b) => b.center[0]);
    const lats = allBarangays.map((b) => b.center[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const lngSpan = maxLng - minLng || 1;
    const latSpan = maxLat - minLat || 1;
    const pad = 0.08;

    return allBarangays.map((b) => ({
      barangay: b,
      left: `${(pad + (1 - 2 * pad) * ((b.center[0] - minLng) / lngSpan)) * 100}%` as const,
      top: `${(pad + (1 - 2 * pad) * ((maxLat - b.center[1]) / latSpan)) * 100}%` as const,
    }));
  }, [allBarangays]);

  const openInMaps = () => {
    const [longitude, latitude] = selectedBarangay.center;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Card */}
      <View style={styles.whiteCard}>
        <View style={styles.badgeRow}>
          <View style={styles.spatialBadge}>
            <Text style={styles.spatialBadgeText}>🗺️ 27 BARANGAYS SPATIAL TWIN</Text>
          </View>
          <View style={styles.syncChip}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? macosColors.appleGreen : macosColors.appleYellow },
              ]}
            />
            <Text style={styles.syncChipText}>
              {isOnline ? 'Online Synced' : 'Bundled GeoJSON Cache'}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Centroid GIS Map & Spatial Profiles</Text>
        <Text style={styles.subtitle}>
          Tap any centroid on the coordinate plane to inspect CBMS telemetry & risk indicators.
        </Text>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroller}
        >
          {CATEGORY_FILTERS.map((cat) => {
            const active = selectedCategoryFilter === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catBtn,
                  active && { backgroundColor: cat.color, borderColor: cat.color },
                ]}
                onPress={() => handleSelectCategory?.(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.catBtnText, active && styles.catBtnTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Spatial Canvas Map Card */}
      <View style={styles.mapCard}>
        <View style={styles.canvas}>
          {/* Subtle Grid Guidelines */}
          <View style={[styles.gridLine, styles.gridLineV25]} />
          <View style={[styles.gridLine, styles.gridLineV50]} />
          <View style={[styles.gridLine, styles.gridLineV75]} />
          <View style={[styles.gridLine, styles.gridLineH25]} />
          <View style={[styles.gridLine, styles.gridLineH50]} />
          <View style={[styles.gridLine, styles.gridLineH75]} />

          {points.map(({ barangay, left, top }) => {
            const isSelected = barangay.id === selectedBarangay.id;
            const matchesCat =
              selectedCategoryFilter === 'all' || barangay.category.id === selectedCategoryFilter;
            const opacity = matchesCat ? 1 : 0.25;

            return (
              <TouchableOpacity
                key={barangay.id}
                activeOpacity={0.7}
                onPress={() => setSelectedBarangayId(barangay.id)}
                style={[
                  styles.point,
                  {
                    left,
                    top,
                    opacity,
                    width: isSelected ? 22 : 14,
                    height: isSelected ? 22 : 14,
                    borderRadius: isSelected ? 11 : 7,
                    marginLeft: isSelected ? -11 : -7,
                    marginTop: isSelected ? -11 : -7,
                    backgroundColor: mviColor(barangay.vulnerability_index),
                    borderColor: isSelected ? '#05389f' : '#ffffff',
                    borderWidth: isSelected ? 3 : 1.5,
                  },
                ]}
              >
                {isSelected && <View style={styles.pointCore} />}
              </TouchableOpacity>
            );
          })}

          {/* Active Barangay Floating Tooltip */}
          <View style={styles.selectedLabel}>
            <View
              style={[
                styles.selectedDot,
                { backgroundColor: mviColor(selectedBarangay.vulnerability_index) },
              ]}
            />
            <Text style={styles.selectedLabelText}>
              #{selectedBarangay.id} {selectedBarangay.realName} (MVI {selectedBarangay.vulnerability_index})
            </Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>MVI &lt; 50 (Low)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>50–70 (Med)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>&gt; 70 (High)</Text>
          </View>
          <Text style={styles.legendNote}>27 Naga Centroids</Text>
        </View>
      </View>

      {/* Selected Barangay Spatial Inspector Card */}
      <View style={styles.whiteCard}>
        <View style={styles.infoHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.catBadgeRow}>
              <View
                style={[
                  styles.catPill,
                  { backgroundColor: `${selectedBarangay.category.color}15` },
                ]}
              >
                <Text
                  style={[
                    styles.catPillText,
                    { color: selectedBarangay.category.color },
                  ]}
                >
                  {selectedBarangay.category.icon} {selectedBarangay.category.name}
                </Text>
              </View>
            </View>
            <Text style={styles.infoTitle}>{selectedBarangay.realName}</Text>
            <Text style={styles.infoSub}>
              Barangay #{selectedBarangay.id} • {selectedBarangay.district}
            </Text>
          </View>

          <View
            style={[
              styles.mviBadgeBox,
              { borderColor: mviColor(selectedBarangay.vulnerability_index) },
            ]}
          >
            <Text
              style={[
                styles.mviBadgeVal,
                { color: mviColor(selectedBarangay.vulnerability_index) },
              ]}
            >
              {selectedBarangay.vulnerability_index}
            </Text>
            <Text style={styles.mviBadgeLabel}>MVI INDEX</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {selectedBarangay.total_households.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Households</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {selectedBarangay.total_population.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Residents</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>
              {selectedBarangay.avg_household_size}
            </Text>
            <Text style={styles.statLabel}>Avg HH Size</Text>
          </View>
        </View>

        {/* Coordinates Row */}
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>CENTROID COORDINATES</Text>
          <Text style={styles.coordVal}>
            {selectedBarangay.center[1].toFixed(5)}° N, {selectedBarangay.center[0].toFixed(5)}° E
          </Text>
        </View>

        {/* Priority Needs */}
        <Text style={styles.needsHeader}>Identified Deficits for Council Intervention</Text>
        <View style={styles.needsList}>
          {selectedBarangay.top_needs.map((need, idx) => (
            <View key={idx} style={styles.needItem}>
              <View style={styles.needDot} />
              <Text style={styles.needText}>{need}</Text>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.openMapBtn} onPress={openInMaps} activeOpacity={0.8}>
          <Text style={styles.openMapBtnText}>📍 Open Centroid in Google Maps</Text>
        </TouchableOpacity>
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
    paddingBottom: 28,
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spatialBadge: {
    backgroundColor: '#edf3fc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  spatialBadgeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
    letterSpacing: 0.4,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncChipText: {
    fontFamily: sfFont,
    fontSize: 9.5,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  title: {
    fontFamily: sfFont,
    fontSize: 18,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  categoryScroller: {
    gap: 6,
    paddingTop: 4,
  },
  catBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catBtnText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  catBtnTextActive: {
    color: '#ffffff',
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  canvas: {
    height: 310,
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
  },
  gridLineV25: { left: '25%', top: 0, bottom: 0, width: 1 },
  gridLineV50: { left: '50%', top: 0, bottom: 0, width: 1 },
  gridLineV75: { left: '75%', top: 0, bottom: 0, width: 1 },
  gridLineH25: { top: '25%', left: 0, right: 0, height: 1 },
  gridLineH50: { top: '50%', left: 0, right: 0, height: 1 },
  gridLineH75: { top: '75%', left: 0, right: 0, height: 1 },
  point: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pointCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  selectedLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  selectedLabelText: {
    fontFamily: sfFont,
    fontSize: 10.5,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontFamily: sfFont,
    fontSize: 9.5,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  legendNote: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '500',
    color: macosColors.textTertiary,
    marginLeft: 'auto',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  catBadgeRow: {
    marginBottom: 4,
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  catPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
  },
  infoTitle: {
    fontFamily: sfFont,
    fontSize: 20,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
  },
  infoSub: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginTop: 1,
  },
  mviBadgeBox: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  mviBadgeVal: {
    fontFamily: sfFont,
    fontSize: 18,
    fontWeight: '900',
  },
  mviBadgeLabel: {
    fontFamily: sfFont,
    fontSize: 8,
    fontWeight: '800',
    color: macosColors.textTertiary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statVal: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  statLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '600',
    color: macosColors.textTertiary,
    marginTop: 1,
  },
  coordBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  coordLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
    letterSpacing: 0.4,
  },
  coordVal: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  needsHeader: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '800',
    color: macosColors.textPrimary,
    marginBottom: 6,
  },
  needsList: {
    gap: 6,
    marginBottom: 12,
  },
  needItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  needDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: macosColors.appleBlue,
  },
  needText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textPrimary,
    flex: 1,
  },
  openMapBtn: {
    backgroundColor: macosColors.appleBlue,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  openMapBtnText: {
    fontFamily: sfFont,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
