import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useOffline } from '../context/OfflineContext';

const mviColor = (mvi: number) => (mvi > 70 ? '#ef4444' : mvi > 50 ? '#f59e0b' : '#10b981');

export const SpatialProfileScreen: React.FC = () => {
  const { allBarangays, selectedBarangay, setSelectedBarangayId, isOnline } = useOffline();

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
      top: `${(pad + (1 - 2 * pad) * ((maxLat - b.center[1]) / latSpan)) * 100}%` as const
    }));
  }, [allBarangays]);

  const openInMaps = () => {
    const [longitude, latitude] = selectedBarangay.center;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>OFFLINE SPATIAL PROFILE</Text>
          <View style={[styles.modePill, { backgroundColor: isOnline ? '#065f46' : '#0038a8' }]}>
            <Text style={styles.modeText}>{isOnline ? 'Synced' : 'Local GeoJSON Cache'}</Text>
          </View>
        </View>
        <Text style={styles.title}>27 Barangay Centroid Plot</Text>
        <Text style={styles.subtitle}>
          Naga City bounds • tap any point to inspect its CBMS profile
        </Text>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.canvas}>
          <View style={[styles.gridLine, styles.gridLineV25]} />
          <View style={[styles.gridLine, styles.gridLineV50]} />
          <View style={[styles.gridLine, styles.gridLineV75]} />
          <View style={[styles.gridLine, styles.gridLineH25]} />
          <View style={[styles.gridLine, styles.gridLineH50]} />
          <View style={[styles.gridLine, styles.gridLineH75]} />

          {points.map(({ barangay, left, top }) => {
            const isSelected = barangay.id === selectedBarangay.id;
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
                    width: isSelected ? 20 : 12,
                    height: isSelected ? 20 : 12,
                    borderRadius: isSelected ? 10 : 6,
                    marginLeft: isSelected ? -10 : -6,
                    marginTop: isSelected ? -10 : -6,
                    backgroundColor: mviColor(barangay.vulnerability_index),
                    borderColor: isSelected ? '#fccf17' : 'rgba(255,255,255,0.55)',
                    borderWidth: isSelected ? 2.5 : 1
                  }
                ]}
              >
                {isSelected && <View style={styles.pointCore} />}
              </TouchableOpacity>
            );
          })}

          <View style={styles.selectedLabel}>
            <Text style={styles.selectedLabelText}>{selectedBarangay.name}</Text>
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>MVI &lt; 50</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>50–70</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>&gt; 70</Text>
          </View>
          <Text style={styles.legendNote}>Centroids from bundled GeoJSON</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.infoTitleCol}>
            <Text style={styles.infoTitle}>{selectedBarangay.name}</Text>
            <Text style={[styles.infoCategory, { color: selectedBarangay.category_color || '#fccf17' }]}>
              {selectedBarangay.category_name || 'Naga City Barangay'}
            </Text>
          </View>
          <View style={[styles.mviPill, { borderColor: mviColor(selectedBarangay.vulnerability_index) }]}>
            <Text style={[styles.mviValue, { color: mviColor(selectedBarangay.vulnerability_index) }]}>
              {selectedBarangay.vulnerability_index}
            </Text>
            <Text style={styles.mviLabel}>MVI</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{selectedBarangay.total_households.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Households</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{selectedBarangay.total_population.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Population</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>#{selectedBarangay.id}</Text>
            <Text style={styles.statLabel}>Barangay</Text>
          </View>
        </View>

        <View style={styles.coordRow}>
          <Text style={styles.coordLabel}>CENTROID</Text>
          <Text style={styles.coordValue}>
            {selectedBarangay.center[1].toFixed(6)}° N, {selectedBarangay.center[0].toFixed(6)}° E
          </Text>
        </View>

        <Text style={styles.needsTitle}>Priority Needs</Text>
        {selectedBarangay.top_needs.map((need, index) => (
          <View key={index} style={styles.needRow}>
            <View style={styles.needBullet} />
            <Text style={styles.needText}>{need}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
          <Text style={styles.mapButtonText}>Open Centroid in Maps</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        Full 3D polygons, hex clusters, and building extrusions render in the web Cesium twin.
        This mobile view keeps the centroid layer available offline.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060e1e' },
  header: { padding: 16, backgroundColor: '#07152b', borderBottomWidth: 1, borderColor: '#0038a8' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  badge: { color: '#fdb813', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  modePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#fdb813' },
  modeText: { color: '#fef08a', fontSize: 9, fontWeight: '700' },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#b8bac0', fontSize: 11, marginTop: 2 },
  mapCard: { margin: 14, backgroundColor: '#07152b', borderRadius: 14, borderWidth: 1, borderColor: '#0038a8', overflow: 'hidden' },
  canvas: { height: 330, backgroundColor: '#040a17', position: 'relative' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(56,189,248,0.12)' },
  gridLineV25: { left: '25%', top: 0, bottom: 0, width: 1 },
  gridLineV50: { left: '50%', top: 0, bottom: 0, width: 1 },
  gridLineV75: { left: '75%', top: 0, bottom: 0, width: 1 },
  gridLineH25: { top: '25%', left: 0, right: 0, height: 1 },
  gridLineH50: { top: '50%', left: 0, right: 0, height: 1 },
  gridLineH75: { top: '75%', left: 0, right: 0, height: 1 },
  point: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pointCore: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#07152b' },
  selectedLabel: { position: 'absolute', left: 10, bottom: 10, backgroundColor: 'rgba(7,21,43,0.9)', borderWidth: 1, borderColor: '#fccf17', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  selectedLabelText: { color: '#fccf17', fontSize: 10, fontWeight: '800' },
  legendRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', padding: 10, borderTopWidth: 1, borderColor: '#0038a8', backgroundColor: '#07152b' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendText: { color: '#b8bac0', fontSize: 10, fontWeight: '600' },
  legendNote: { color: '#64748b', fontSize: 9, marginLeft: 'auto' },
  infoCard: { marginHorizontal: 14, marginBottom: 14, backgroundColor: '#07152b', borderRadius: 14, borderWidth: 1, borderColor: '#0038a8', padding: 16 },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoTitleCol: { flex: 1 },
  infoTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  infoCategory: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  mviPill: { alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  mviValue: { fontSize: 18, fontWeight: '900', fontFamily: 'monospace' },
  mviLabel: { color: '#94a3b8', fontSize: 9, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#040a17', borderRadius: 10, padding: 10, marginRight: 6, borderWidth: 1, borderColor: '#0a2540' },
  statValue: { color: '#ffffff', fontSize: 16, fontWeight: '900', fontFamily: 'monospace' },
  statLabel: { color: '#94a3b8', fontSize: 9, fontWeight: '700', marginTop: 2 },
  coordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#040a17', borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: '#0a2540' },
  coordLabel: { color: '#38bdf8', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  coordValue: { color: '#e2e8f0', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  needsTitle: { color: '#f8fafc', fontSize: 13, fontWeight: '800', marginBottom: 8 },
  needRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  needBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fdb813', marginRight: 8 },
  needText: { color: '#e2e8f0', fontSize: 12, fontWeight: '500' },
  mapButton: { marginTop: 14, backgroundColor: '#fdb813', paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  mapButtonText: { color: '#07152b', fontSize: 12, fontWeight: '900' },
  footerNote: { color: '#64748b', fontSize: 10, lineHeight: 15, paddingHorizontal: 16, paddingBottom: 24 }
});
