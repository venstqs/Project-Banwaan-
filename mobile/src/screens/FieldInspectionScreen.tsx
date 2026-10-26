import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, Modal, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../context/OfflineContext';
import { getMviTier } from './BarangayCaptainScreen';

const CATEGORIES = ['Rapid Damage (RDANA)', 'Project Milestone', 'Sanitation Check'];
const INITIAL_QUEUE_LIMIT = 3;

export const FieldInspectionScreen: React.FC = () => {
  const { isOnline, queuedReports, submitReport, syncOutbox, selectedBarangay } = useOffline();
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [reportType, setReportType] = useState(CATEGORIES[0]);
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  
  const [showAllQueue, setShowAllQueue] = useState(false);
  const [hideSynced, setHideSynced] = useState(false);

  const cameraRef = useRef<any>(null);
  const currentTier = getMviTier(selectedBarangay.vulnerability_index);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  const showTempBanner = (type: 'success' | 'info', text: string) => {
    setFeedbackBanner({ type, text });
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Camera Permission Required', 'Please grant camera access to capture geotagged field photos.');
        return;
      }
    }
    setIsCameraReady(false);
    setShowCamera(true);
  };

  const handleCloseCamera = () => {
    setIsCameraReady(false);
    setShowCamera(false);
  };

  const takePicture = async () => {
    if (!isCameraReady || !cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
      if (photo && photo.uri) {
        setPhotoUri(photo.uri);
        handleCloseCamera();
      }
    } catch (err) {
      console.warn('Camera capture error:', err);
    }
  };

  const handleRemovePhoto = () => setPhotoUri(null);

  const handleSubmit = async () => {
    if (!desc.trim()) {
      Alert.alert('Observation Required', 'Please enter your field findings before submitting.');
      return;
    }
    setIsSubmitting(true);
    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.name,
      reportType,
      description: desc.trim() + (photoUri ? `\n[Geotagged Photo Attached]` : ''),
      latitude: location ? location.coords.latitude : 13.6218,
      longitude: location ? location.coords.longitude : 123.1948,
    });
    setDesc('');
    setPhotoUri(null);
    setIsSubmitting(false);
    showTempBanner('success', isOnline ? 'Report uploaded and synced with Naga City Command Center.' : 'Saved to local SQLite outbox. Will sync when online.');
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline Mode Active', 'Switch to Online Mode in the top header to synchronize queued reports.');
      return;
    }
    const count = await syncOutbox();
    showTempBanner('info', count > 0 ? `Synchronized ${count} pending report(s) to Command Center.` : 'All queued reports are already synchronized.');
  };

  const latText = location ? location.coords.latitude.toFixed(5) : '13.62180';
  const lonText = location ? location.coords.longitude.toFixed(5) : '123.19480';
  
  const filteredReports = hideSynced ? queuedReports.filter((r) => !r.isSynced) : queuedReports;
  const visibleReports = showAllQueue ? filteredReports : filteredReports.slice(0, INITIAL_QUEUE_LIMIT);
  const unsyncedCount = queuedReports.filter((r) => !r.isSynced).length;

  return (
    <>
      <Modal visible={showCamera} animationType="slide" onRequestClose={handleCloseCamera}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            ref={cameraRef}
            onCameraReady={() => setIsCameraReady(true)}
          />
          <SafeAreaView style={styles.cameraOverlay}>
            <View style={styles.cameraTopBar}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE GEOTAG CAMERA</Text>
              </View>
              <TouchableOpacity style={styles.cameraExitBtn} onPress={handleCloseCamera} activeOpacity={0.8}>
                <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                <Text style={styles.cameraExitText}>Exit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cameraBottomBar}>
              <View style={styles.geoPill}>
                <Ionicons name="location-sharp" size={12} color="#10B981" />
                <Text style={styles.cameraCoordOverlay}>{selectedBarangay.name} • GPS {latText}N, {lonText}E</Text>
              </View>

              <View style={styles.cameraActionRow}>
                <View style={{ width: 60 }} />
                <TouchableOpacity style={[styles.shutterOuter, !isCameraReady && styles.shutterDisabled]} onPress={takePicture} disabled={!isCameraReady} activeOpacity={0.8}>
                  <View style={[styles.shutterInner, !isCameraReady && { backgroundColor: '#94A3B8' }]} />
                </TouchableOpacity>
                <View style={{ width: 60 }} />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerSection}>
          <Text style={styles.eyebrow}>FIELD INSPECTION LOG</Text>
          <Text style={styles.screenTitle}>Submit Field Proof</Text>
          <View style={styles.targetMetaRow}>
            <Ionicons name="location" size={14} color="#2563EB" />
            <Text style={styles.targetMetaText}>Target: {selectedBarangay.name} ({latText}° N, {lonText}° E)</Text>
            <View style={[styles.inlineTierBadge, { backgroundColor: currentTier.bg, borderColor: currentTier.border }]}>
              <Text style={[styles.inlineTierText, { color: currentTier.text }]}>{currentTier.shortLabel}</Text>
            </View>
          </View>
        </View>

        {feedbackBanner && (
          <View style={[styles.feedbackBanner, feedbackBanner.type === 'success' ? styles.bannerSuccess : styles.bannerInfo]}>
            <Ionicons name="checkmark-circle" size={18} color={feedbackBanner.type === 'success' ? '#065F46' : '#1D4ED8'} />
            <Text style={[styles.feedbackText, { color: feedbackBanner.type === 'success' ? '#065F46' : '#1D4ED8' }]}>{feedbackBanner.text}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>1. Inspection Category</Text>
          <View style={styles.categoryWrap}>
            {CATEGORIES.map((cat) => {
              const active = reportType === cat;
              return (
                <TouchableOpacity key={cat} style={[styles.categoryChip, active && styles.categoryChipActive]} onPress={() => setReportType(cat)}>
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>2. Field Findings & Observation Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe household impact, infrastructure status, or relief progress..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={desc}
            onChangeText={setDesc}
          />

          <Text style={styles.fieldLabel}>3. Geotagged Photo Evidence</Text>
          {!photoUri ? (
            <TouchableOpacity style={styles.openCameraCard} onPress={handleOpenCamera} activeOpacity={0.75}>
              <View style={styles.cameraIconCircle}>
                <Ionicons name="camera" size={22} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.openCameraTitle}>Capture Geotagged Photo</Text>
                <Text style={styles.openCameraSub}>Stamps GPS coordinates onto report</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : (
            <View style={styles.photoReviewCard}>
              <Image source={{ uri: photoUri }} style={styles.photoThumbnail} />
              <View style={styles.photoReviewMeta}>
                <View style={styles.photoAttachedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#065F46" />
                  <Text style={styles.photoAttachedText}>Photo Attached</Text>
                </View>
                <Text style={styles.photoCoordText}>GPS: {latText}N, {lonText}E</Text>
                <View style={styles.photoActionRow}>
                  <TouchableOpacity style={styles.retakeBtn} onPress={handleOpenCamera}>
                    <Ionicons name="refresh" size={14} color="#2563EB" />
                    <Text style={styles.retakeBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removePhotoBtn} onPress={handleRemovePhoto}>
                    <Ionicons name="trash-outline" size={14} color="#E11D48" />
                    <Text style={styles.removePhotoText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.8}>
            <Ionicons name={isOnline ? 'cloud-upload-outline' : 'save-outline'} size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>{isOnline ? 'Submit & Sync Report' : 'Save to Offline Outbox'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.outboxSection}>
          <View style={styles.outboxHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Local Outbox Queue ({filteredReports.length})</Text>
              <View style={styles.queueMetaRow}>
                <Text style={styles.sectionSubtitle}>{unsyncedCount > 0 ? `${unsyncedCount} awaiting connection` : 'All reports synced'}</Text>
                <TouchableOpacity onPress={() => setHideSynced(!hideSynced)} style={styles.filterBtn}>
                  <Text style={styles.filterBtnText}>{hideSynced ? 'Show Synced' : 'Hide Synced'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.syncNowBtn} onPress={handleManualSync} activeOpacity={0.8}>
              <Ionicons name="sync" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.syncNowBtnText}>Sync Outbox</Text>
            </TouchableOpacity>
          </View>

          {visibleReports.map((rpt) => (
            <View key={rpt.id} style={styles.reportCard}>
              <View style={styles.reportTopRow}>
                <Text style={styles.reportType} numberOfLines={1}>{rpt.reportType}</Text>
                <View style={[styles.syncBadge, rpt.isSynced ? styles.badgeSynced : styles.badgePending]}>
                  <Text style={[styles.syncBadgeText, { color: rpt.isSynced ? '#065F46' : '#B45309' }]}>{rpt.isSynced ? 'SYNCED' : 'QUEUED'}</Text>
                </View>
              </View>
              <Text style={styles.reportDesc} numberOfLines={2}>{rpt.description}</Text>
              <View style={styles.reportMetaRow}>
                <Text style={styles.reportMetaText}>{rpt.barangayName}</Text>
                <Text style={styles.reportMetaText}>•</Text>
                <Text style={styles.reportMetaText}>{rpt.timestamp}</Text>
              </View>
            </View>
          ))}

          {filteredReports.length > INITIAL_QUEUE_LIMIT && (
            <TouchableOpacity style={styles.toggleQueueBtn} onPress={() => setShowAllQueue((prev) => !prev)}>
              <Text style={styles.toggleQueueText}>{showAllQueue ? 'Show Fewer Reports' : `View All ${filteredReports.length} Reports (${filteredReports.length - INITIAL_QUEUE_LIMIT} more)`}</Text>
              <Ionicons name={showAllQueue ? 'chevron-up' : 'chevron-down'} size={16} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { paddingBottom: 32 },
  headerSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  eyebrow: { color: '#2563EB', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  screenTitle: { color: '#0F172A', fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  targetMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6, flexWrap: 'wrap' },
  targetMetaText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  inlineTierBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  inlineTierText: { fontSize: 10, fontWeight: '800' },
  feedbackBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, padding: 12, borderRadius: 10, borderWidth: 1, gap: 8 },
  bannerSuccess: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  bannerInfo: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  feedbackText: { flex: 1, fontSize: 13, fontWeight: '600' },
  formCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  fieldLabel: { color: '#334155', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  categoryChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  categoryChipText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  categoryChipTextActive: { color: '#2563EB', fontWeight: '700' },
  textArea: { backgroundColor: '#F8FAFC', color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, minHeight: 84, textAlignVertical: 'top', fontSize: 14, marginBottom: 16 },
  openCameraCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderStyle: 'dashed', borderColor: '#94A3B8', borderRadius: 10, padding: 12, marginBottom: 16 },
  cameraIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  openCameraTitle: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  openCameraSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  photoReviewCard: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, marginBottom: 16, alignItems: 'center' },
  photoThumbnail: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#CBD5E1', marginRight: 12 },
  photoReviewMeta: { flex: 1 },
  photoAttachedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoAttachedText: { color: '#065F46', fontSize: 12, fontWeight: '700' },
  photoCoordText: { color: '#64748B', fontSize: 11, marginTop: 2, marginBottom: 8 },
  photoActionRow: { flexDirection: 'row', gap: 8 },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, gap: 4 },
  retakeBtnText: { color: '#2563EB', fontSize: 12, fontWeight: '700' },
  removePhotoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFE4E6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, gap: 4 },
  removePhotoText: { color: '#E11D48', fontSize: 12, fontWeight: '700' },
  submitBtn: { flexDirection: 'row', backgroundColor: '#2563EB', paddingVertical: 13, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  outboxSection: { paddingHorizontal: 16 },
  outboxHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  queueMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1, gap: 8 },
  sectionSubtitle: { color: '#475569', fontSize: 13, fontWeight: '500' },
  filterBtn: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#F1F5F9', borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  filterBtnText: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  syncNowBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  syncNowBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  reportCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 },
  reportTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reportType: { color: '#0F172A', fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  syncBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeSynced: { backgroundColor: '#D1FAE5' },
  badgePending: { backgroundColor: '#FEF9E7', borderWidth: 1, borderColor: '#FDE68A' },
  syncBadgeText: { fontSize: 10, fontWeight: '800' },
  reportDesc: { color: '#475569', fontSize: 13, lineHeight: 18, marginBottom: 6 },
  reportMetaRow: { flexDirection: 'row', gap: 6 },
  reportMetaText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  toggleQueueBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 6, marginTop: 4 },
  toggleQueueText: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
  cameraContainer: { flex: 1, backgroundColor: '#000000' },
  cameraOverlay: { flex: 1, justifyContent: 'space-between' },
  cameraTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E11D48' },
  liveBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  cameraExitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, gap: 4 },
  cameraExitText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  cameraBottomBar: { backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingTop: 14, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  geoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.8)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, gap: 6, marginBottom: 16 },
  cameraCoordOverlay: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  cameraActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  shutterOuter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shutterDisabled: { opacity: 0.5 },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF' },
});