import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { TYPHOON_ADVISORIES_MULTILINGUAL, NAGA_EMERGENCY_HOTLINES } from '../data/offlineData';
import { useOffline } from '../context/OfflineContext';
import { macosColors, sfFont } from '../config/macosTheme';

interface ShelterItem {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  status: 'OPEN' | 'STANDBY' | 'FULL';
  contact: string;
}

export const ResidentSafetyScreen: React.FC = () => {
  const {
    selectedBarangay,
    isOnline,
    mobileRole,
    calamitySimActive,
    setCalamitySimActive,
    submitReport,
  } = useOffline();

  const [selectedLang, setSelectedLang] = useState<'bikol' | 'filipino' | 'english'>('bikol');
  const [hotlineFilter, setHotlineFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sosSent, setSosSent] = useState(false);
  const [rationRequested, setRationRequested] = useState(false);

  // Resident Go-Bag checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    water: true,
    food: true,
    flashlight: false,
    docs: true,
    firstaid: false,
    powerbank: false,
  });

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const defaultAdvisory = TYPHOON_ADVISORIES_MULTILINGUAL[0];

  // Dynamic advisories reflecting Calamity Simulation mode
  const dynamicAdvisory = useMemo(() => {
    if (calamitySimActive) {
      return {
        level: '🚨 SIGNAL NO. 3 ACTIVE — STORM SURGE & FLASH FLOOD WARNING',
        time: 'PAGASA / CDRRMO LIVE DISPATCH',
        bikol: `PATANID SA BRGY ${selectedBarangay.realName.toUpperCase()}: Nakabandera an Signal No. 3. Piglalaoman an makusog na uran asin paglangkaw kan tubig sa Salog Bicol. Tinatantyang ${selectedBarangay.drrm?.weak_roof_pct || 14}% kan mga harong an may maluyang bubong. Gabos na residente sa harani sa salog o low-lying areas, mag-ebakwar tulos sa opisyal na evacuation shelter bago an banggi.`,
        filipino: `BABALA SA BRGY ${selectedBarangay.realName.toUpperCase()}: Nakataas ang Signal No. 3. Inaasahan ang matinding pagbuhos ng ulan at pag-apaw ng Bicol River. Humigit-kumulang ${selectedBarangay.drrm?.weak_roof_pct || 14}% ng kabahayan ay may marupok na bubong. Lahat ng residente sa tabing-ilog at mabababang lugar ay pinapayuhang lumikas agad sa itinalagang evacuation centers.`,
        english: `MANDATORY EVACUATION WARNING FOR BRGY ${selectedBarangay.realName.toUpperCase()}: Tropical Cyclone Wind Signal No. 3 hoisted over Naga City. River surge risk is critical. CBMS data indicates ${selectedBarangay.drrm?.weak_roof_pct || 14}% of homes have light/makeshift roofing. Preemptive evacuation to designated shelters is in effect. Keep 911 lines open.`,
      };
    }
    return defaultAdvisory;
  }, [calamitySimActive, selectedBarangay, defaultAdvisory]);

  // Evacuation Shelters tailored to Naga City & active Barangay
  const shelters: ShelterItem[] = useMemo(() => {
    const isRiverine = selectedBarangay.category.id === 'riverine';
    return [
      {
        id: 'shelter-brgy',
        name: `${selectedBarangay.realName} Evacuation Center & Covered Court`,
        location: `Brgy. ${selectedBarangay.realName} Civic Grounds`,
        capacity: 450,
        occupied: calamitySimActive ? 320 : 0,
        status: calamitySimActive ? 'OPEN' : 'STANDBY',
        contact: '(054) 472-3000',
      },
      {
        id: 'shelter-civic',
        name: 'Naga City Civic Center Evacuation Complex',
        location: 'J. Miranda Ave., Concepcion Pequeña',
        capacity: 800,
        occupied: calamitySimActive ? 590 : 120,
        status: 'OPEN',
        contact: '(054) 472-3000',
      },
      {
        id: 'shelter-camhi',
        name: 'Camarines Sur National High School (East Wing Gym)',
        location: 'Peñafrancia Ave., Naga City',
        capacity: 1200,
        occupied: calamitySimActive ? 850 : 0,
        status: calamitySimActive ? 'OPEN' : 'STANDBY',
        contact: '0927-357-9967',
      },
    ];
  }, [selectedBarangay, calamitySimActive]);

  // Relief Ration Calculator (Empirical CBMS HH count)
  const hhCount = selectedBarangay.total_households || 1000;
  const reliefPacksNeeded = Math.round(hhCount * (calamitySimActive ? 1.5 : 1));
  const riceKg = Math.round(reliefPacksNeeded * 5);
  const cannedGoods = Math.round(reliefPacksNeeded * 4);
  const waterLiters = Math.round(reliefPacksNeeded * 2);

  // Filtered hotlines
  const filteredHotlines = useMemo(() => {
    if (!hotlineFilter.trim()) return NAGA_EMERGENCY_HOTLINES;
    const q = hotlineFilter.toLowerCase();
    return NAGA_EMERGENCY_HOTLINES.filter(
      (h) =>
        h.service.toLowerCase().includes(q) ||
        h.number.includes(q)
    );
  }, [hotlineFilter]);

  const handleCallHotline = (service: string, number: string) => {
    const cleanNumber = number.split('/')[0].replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Emergency Call', `Dialing: ${service}\nNumber: ${number}`);
    });
  };

  const handleCopyHotline = (id: string, num: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleEmergencySos = async () => {
    setSosSent(true);
    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.displayName,
      reportType: calamitySimActive ? 'URGENT DISASTER SOS' : 'Resident Hazard Alert',
      description: `Emergency alert triggered from mobile resident in ${selectedBarangay.displayName}. Centroid: ${selectedBarangay.center[1]}, ${selectedBarangay.center[0]}. Immediate DRRMO verification requested.`,
      latitude: selectedBarangay.center[1],
      longitude: selectedBarangay.center[0],
      reporterRole: mobileRole === 'barangay_captain' ? 'Punong Barangay' : 'Citizen Resident',
    });
    Alert.alert(
      '🚨 Alert Transmitted',
      `Your emergency notice for ${selectedBarangay.displayName} has been logged to the CDRRMO Dispatch Queue (local outbox). Stay safe and call 911 if in immediate danger.`
    );
    setTimeout(() => setSosSent(false), 5000);
  };

  const handleRequestRelief = async () => {
    setRationRequested(true);
    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.displayName,
      reportType: 'DRRMO Relief Logistics Request',
      description: `Formal Sangguniang Barangay relief pre-position request for ${selectedBarangay.displayName}: ${reliefPacksNeeded.toLocaleString()} family food packs (${riceKg.toLocaleString()}kg rice, ${cannedGoods.toLocaleString()} cans, ${waterLiters.toLocaleString()}L water).`,
      latitude: selectedBarangay.center[1],
      longitude: selectedBarangay.center[0],
      reporterRole: 'Punong Barangay',
    });
    Alert.alert(
      '📦 Logistics Request Sent',
      `Pre-positioning request for ${reliefPacksNeeded.toLocaleString()} food packs transmitted to CDRRMO & CSWDO logistics.`
    );
    setTimeout(() => setRationRequested(false), 4000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header Card with Dual Mode Badges & Calamity Switch */}
      <View style={styles.whiteCard}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badgePill,
              calamitySimActive ? styles.badgePillCalamity : styles.badgePillNormal,
            ]}
          >
            <Text
              style={[
                styles.badgePillText,
                calamitySimActive ? styles.badgeTextCalamity : styles.badgeTextNormal,
              ]}
            >
              {calamitySimActive ? '🚨 STORM SURGE SIMULATION ACTIVE' : 'RESIDENT SAFETY & DRRM DESK'}
            </Text>
          </View>

          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? macosColors.appleGreen : macosColors.appleYellow },
              ]}
            />
            <Text style={styles.statusText}>{isOnline ? 'Direct Cellular 911' : 'Offline Dial'}</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Naga Emergency & Disaster Desk</Text>
            <Text style={styles.subtitle}>
              Active: <Text style={{ fontWeight: '700', color: macosColors.appleBlue }}>{selectedBarangay.displayName}</Text> • 1-tap cellular hotlines & offline advisories
            </Text>
          </View>

          {/* Calamity Simulation Toggle Button */}
          <TouchableOpacity
            style={[
              styles.calamityToggleBtn,
              calamitySimActive ? styles.calamityToggleBtnActive : styles.calamityToggleBtnInactive,
            ]}
            onPress={() => setCalamitySimActive(!calamitySimActive)}
            activeOpacity={0.8}
          >
            <Text style={styles.calamityToggleIcon}>{calamitySimActive ? '⚡' : '⛈️'}</Text>
            <Text
              style={[
                styles.calamityToggleText,
                calamitySimActive && styles.calamityToggleTextActive,
              ]}
            >
              {calamitySimActive ? 'Surge Mode ON' : 'Simulate Surge'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Rapid Emergency SOS Transmit Card */}
      <View style={[styles.sosCard, calamitySimActive && styles.sosCardActive]}>
        <View style={styles.sosLeft}>
          <Text style={styles.sosIcon}>{calamitySimActive ? '🆘' : '⚠️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>
              {mobileRole === 'barangay_captain'
                ? 'Transmit Barangay Crisis Dispatch'
                : 'Transmit Geotagged Resident Alert'}
            </Text>
            <Text style={styles.sosDesc}>
              {mobileRole === 'barangay_captain'
                ? `Broadcast urgent evacuation advisory and request CDRRMO / BFP support for ${selectedBarangay.realName}.`
                : `Instantly send your centroid (${selectedBarangay.center[1].toFixed(3)}°N, ${selectedBarangay.center[0].toFixed(3)}°E) to Naga Central 911.`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.sosButton, sosSent && styles.sosButtonSent]}
          onPress={handleEmergencySos}
          disabled={sosSent}
          activeOpacity={0.85}
        >
          <Text style={styles.sosButtonText}>
            {sosSent ? 'TRANSMITTED ✓' : calamitySimActive ? 'BROADCAST SOS 🚨' : 'SEND ALERT ↗'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Typhoon Advisory & Multilingual Bulletin */}
      <View style={[styles.alertCard, calamitySimActive && styles.alertCardActive]}>
        <View style={styles.alertTop}>
          <View
            style={[
              styles.alertLevelBadge,
              calamitySimActive && { backgroundColor: '#dc2626' },
            ]}
          >
            <Text style={styles.alertLevelText}>{dynamicAdvisory.level}</Text>
          </View>
          <Text style={styles.alertTime}>{dynamicAdvisory.time}</Text>
        </View>

        {/* Language Segmented Control */}
        <View style={styles.langSegment}>
          {(['bikol', 'filipino', 'english'] as const).map((lang) => {
            const isSelected = selectedLang === lang;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.langBtn, isSelected && styles.langBtnActive]}
                onPress={() => setSelectedLang(lang)}
                activeOpacity={0.7}
              >
                <Text style={[styles.langBtnText, isSelected && styles.langBtnTextActive]}>
                  {lang === 'bikol' ? 'Bikol Naga' : lang === 'filipino' ? 'Filipino' : 'English'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Advisory Body */}
        <View style={styles.advisoryTextBox}>
          <Text style={styles.advisoryBodyText}>{dynamicAdvisory[selectedLang]}</Text>
        </View>

        {/* Hazard Metrics Pill Row */}
        <View style={styles.hazardMetricsRow}>
          <View style={styles.hazardPill}>
            <Text style={styles.hazardPillLabel}>WEAK ROOF RISK</Text>
            <Text style={styles.hazardPillVal}>
              {selectedBarangay.drrm?.weak_roof_pct ?? 14}%
            </Text>
          </View>
          <View style={styles.hazardPill}>
            <Text style={styles.hazardPillLabel}>FLOOD DELTA</Text>
            <Text style={styles.hazardPillVal}>
              {selectedBarangay.category.id === 'riverine' ? 'High Risk' : 'Moderate'}
            </Text>
          </View>
          <View style={styles.hazardPill}>
            <Text style={styles.hazardPillLabel}>NO INTERNET</Text>
            <Text style={styles.hazardPillVal}>
              {selectedBarangay.drrm?.pct_without_internet ?? 25}%
            </Text>
          </View>
          <View style={styles.hazardPill}>
            <Text style={styles.hazardPillLabel}>COMMUNITY MVI</Text>
            <Text style={[styles.hazardPillVal, { color: macosColors.appleBlue }]}>
              {selectedBarangay.vulnerability_index}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. DRRMO Rations & Logistics Calculator (Crucial for Captains & informative for Citizens) */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>DRRMO Disaster Rations Calculator</Text>
            <Text style={styles.sectionSub}>
              Based on {selectedBarangay.realName}'s {hhCount.toLocaleString()} CBMS households (RA 10121 Sec. 21)
            </Text>
          </View>
          <View style={styles.formulaPill}>
            <Text style={styles.formulaPillText}>{calamitySimActive ? '1.5x Surge Factor' : '1.0x Base Factor'}</Text>
          </View>
        </View>

        <View style={styles.rationGrid}>
          <View style={styles.rationCard}>
            <Text style={styles.rationNumber}>{reliefPacksNeeded.toLocaleString()}</Text>
            <Text style={styles.rationLabel}>Food Packs</Text>
            <Text style={styles.rationSub}>Standard DSWD / CSWDO Family Pack</Text>
          </View>
          <View style={styles.rationCard}>
            <Text style={styles.rationNumber}>{riceKg.toLocaleString()} kg</Text>
            <Text style={styles.rationLabel}>Rice Grain</Text>
            <Text style={styles.rationSub}>5 kg per household ration</Text>
          </View>
          <View style={styles.rationCard}>
            <Text style={styles.rationNumber}>{cannedGoods.toLocaleString()}</Text>
            <Text style={styles.rationLabel}>Canned Goods</Text>
            <Text style={styles.rationSub}>Sardines / Corned Beef / Tuna</Text>
          </View>
          <View style={styles.rationCard}>
            <Text style={styles.rationNumber}>{waterLiters.toLocaleString()} L</Text>
            <Text style={styles.rationLabel}>Potable Water</Text>
            <Text style={styles.rationSub}>Clean hydration supply</Text>
          </View>
        </View>

        {mobileRole === 'barangay_captain' ? (
          <TouchableOpacity
            style={[styles.rationActionBtn, rationRequested && styles.rationActionBtnSent]}
            onPress={handleRequestRelief}
            disabled={rationRequested}
            activeOpacity={0.8}
          >
            <Text style={styles.rationActionBtnText}>
              {rationRequested
                ? 'PRE-POSITIONING REQUEST TRANSMITTED ✓'
                : '📦 Formally Request DRRMO Relief Pre-positioning'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.citizenReliefNotice}>
            <Text style={styles.citizenReliefText}>
              ℹ️ During storm declarations, CSWDO relief distribution occurs at your Barangay Covered Court. Bring valid household ID.
            </Text>
          </View>
        )}
      </View>

      {/* 5. Nearest Evacuation Shelters Section */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Designated Evacuation Shelters</Text>
            <Text style={styles.sectionSub}>Safe high-ground facilities near {selectedBarangay.realName}</Text>
          </View>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeText}>3 Shelters Active</Text>
          </View>
        </View>

        <View style={styles.sheltersList}>
          {shelters.map((shelter) => {
            const fillPct = Math.min(100, Math.round((shelter.occupied / shelter.capacity) * 100));
            return (
              <View key={shelter.id} style={styles.shelterCard}>
                <View style={styles.shelterTop}>
                  <Text style={styles.shelterName}>{shelter.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      shelter.status === 'OPEN' ? styles.statusOpen : styles.statusStandby,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        shelter.status === 'OPEN' ? styles.statusOpenText : styles.statusStandbyText,
                      ]}
                    >
                      {shelter.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.shelterLocation}>📍 {shelter.location}</Text>

                <View style={styles.capacityBarWrapper}>
                  <View
                    style={[
                      styles.capacityBar,
                      {
                        width: `${fillPct}%`,
                        backgroundColor: fillPct > 80 ? '#ef4444' : fillPct > 50 ? '#f59e0b' : '#10b981',
                      },
                    ]}
                  />
                </View>

                <View style={styles.shelterFoot}>
                  <Text style={styles.shelterCap}>
                    Occupancy: {shelter.occupied} / {shelter.capacity} ({fillPct}% Filled)
                  </Text>
                  <TouchableOpacity
                    style={styles.directionsBtn}
                    onPress={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        shelter.name + ', Naga City'
                      )}`;
                      Linking.openURL(url).catch(() => {});
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.directionsBtnText}>Route Map ↗</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 6. Citizen Emergency Go-Bag Checklist */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>72-Hour Resident Go-Bag Checklist</Text>
            <Text style={styles.sectionSub}>Recommended survival pack for each household</Text>
          </View>
          <View style={[styles.subBadge, { backgroundColor: '#ecfdf5' }]}>
            <Text style={[styles.subBadgeText, { color: '#065f46' }]}>
              {Object.values(checkedItems).filter(Boolean).length} / 6 Ready
            </Text>
          </View>
        </View>

        <View style={styles.checklistGrid}>
          {[
            { key: 'water', label: '1 Gallon Clean Water / Person / Day (3 Days)', icon: '💧' },
            { key: 'food', label: 'Ready-to-eat Canned Goods & Energy Biscuits', icon: '🥫' },
            { key: 'flashlight', label: 'Heavy-Duty Flashlight & Extra Batteries', icon: '🔦' },
            { key: 'docs', label: 'Important Documents & IDs in Waterproof Pouch', icon: '📁' },
            { key: 'firstaid', label: 'First Aid Kit, Antiseptics & Maintenance Meds', icon: '🩹' },
            { key: 'powerbank', label: 'Fully Charged High-Capacity Powerbank & Radio', icon: '🔋' },
          ].map((item) => {
            const isChecked = checkedItems[item.key];
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.checklistItem, isChecked && styles.checklistItemChecked]}
                onPress={() => toggleCheck(item.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkIcon}>{item.icon}</Text>
                <Text style={[styles.checkLabel, isChecked && styles.checkLabelChecked]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 7. 1-Tap Offline Emergency Hotlines Section */}
      <View style={styles.whiteCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>1-Tap Naga Emergency Hotlines</Text>
            <Text style={styles.sectionSub}>Direct cellular dial (no mobile data required)</Text>
          </View>
          <View style={[styles.subBadge, { backgroundColor: macosColors.appleGreenSubtle }]}>
            <Text style={[styles.subBadgeText, { color: '#065f46' }]}>Verified 911</Text>
          </View>
        </View>

        {/* Hotline Search Bar */}
        <TextInput
          style={styles.hotlineSearch}
          placeholder="Filter hotlines (e.g. 911, police, fire, hospital)..."
          placeholderTextColor={macosColors.textTertiary}
          value={hotlineFilter}
          onChangeText={setHotlineFilter}
        />

        <View style={styles.hotlinesGrid}>
          {filteredHotlines.map((h, idx) => (
            <View key={idx} style={styles.hotlineItem}>
              <View style={styles.hotlineLeft}>
                <Text style={styles.hotlineService}>{h.service}</Text>
                <Text style={styles.hotlineNumber}>{h.number}</Text>
              </View>

              <View style={styles.hotlineButtons}>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => handleCopyHotline(h.service, h.number)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedId === h.service ? 'COPIED ✓' : 'COPY'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callPill}
                  onPress={() => handleCallHotline(h.service, h.number)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.callPillText}>CALL ↗</Text>
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
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgePillNormal: {
    backgroundColor: macosColors.appleBlueSubtle,
    borderColor: macosColors.appleBlueBorder,
  },
  badgePillCalamity: {
    backgroundColor: '#fef2f2',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  badgePillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextNormal: {
    color: macosColors.appleBlue,
  },
  badgeTextCalamity: {
    color: '#dc2626',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 2,
  },
  title: {
    fontFamily: sfFont,
    fontSize: 20,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  calamityToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
  },
  calamityToggleBtnInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  calamityToggleBtnActive: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
  },
  calamityToggleIcon: {
    fontSize: 14,
  },
  calamityToggleText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  calamityToggleTextActive: {
    color: '#ffffff',
  },
  sosCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'column',
    gap: 10,
  },
  sosCardActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  sosLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sosIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  sosTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  sosDesc: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sosButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  sosButtonSent: {
    backgroundColor: '#16a34a',
  },
  sosButtonText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  alertCardActive: {
    borderColor: '#dc2626',
    backgroundColor: '#fffdfd',
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertLevelBadge: {
    backgroundColor: macosColors.appleRed,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '75%',
  },
  alertLevelText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  alertTime: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleRed,
  },
  langSegment: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 10,
  },
  langBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
  },
  langBtnActive: {
    backgroundColor: macosColors.appleBlue,
  },
  langBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  langBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  advisoryTextBox: {
    backgroundColor: '#f8f9fc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  advisoryBodyText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '500',
    color: macosColors.textPrimary,
    lineHeight: 18,
  },
  hazardMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  hazardPill: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#f8f9fc',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  hazardPillLabel: {
    fontFamily: sfFont,
    fontSize: 8.5,
    fontWeight: '700',
    color: macosColors.textSecondary,
    marginBottom: 2,
  },
  hazardPillVal: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: sfFont,
    fontSize: 15,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  sectionSub: {
    fontFamily: sfFont,
    fontSize: 11,
    color: macosColors.textSecondary,
    marginTop: 1,
  },
  formulaPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  formulaPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  subBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  subBadgeText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  rationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rationCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rationNumber: {
    fontFamily: sfFont,
    fontSize: 17,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  rationLabel: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: macosColors.textPrimary,
    marginTop: 2,
  },
  rationSub: {
    fontFamily: sfFont,
    fontSize: 9.5,
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  rationActionBtn: {
    marginTop: 12,
    backgroundColor: macosColors.appleBlue,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  rationActionBtnSent: {
    backgroundColor: '#16a34a',
  },
  rationActionBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  citizenReliefNotice: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  citizenReliefText: {
    fontFamily: sfFont,
    fontSize: 10.5,
    color: macosColors.textSecondary,
    lineHeight: 15,
  },
  sheltersList: {
    gap: 10,
  },
  shelterCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shelterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shelterName: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '700',
    color: macosColors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusOpen: {
    backgroundColor: '#dcfce7',
  },
  statusStandby: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
  },
  statusOpenText: {
    color: '#15803d',
  },
  statusStandbyText: {
    color: '#b45309',
  },
  shelterLocation: {
    fontFamily: sfFont,
    fontSize: 11,
    color: macosColors.textSecondary,
    marginBottom: 8,
  },
  capacityBarWrapper: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  capacityBar: {
    height: '100%',
    borderRadius: 3,
  },
  shelterFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shelterCap: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  directionsBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  directionsBtnText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleBlue,
  },
  checklistGrid: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  checklistItemChecked: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  checkIcon: {
    fontSize: 16,
  },
  checkLabel: {
    fontFamily: sfFont,
    fontSize: 11.5,
    fontWeight: '500',
    color: macosColors.textPrimary,
    flex: 1,
  },
  checkLabelChecked: {
    color: '#15803d',
    fontWeight: '600',
  },
  hotlineSearch: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 12,
    fontFamily: sfFont,
    color: macosColors.textPrimary,
    marginBottom: 10,
  },
  hotlinesGrid: {
    gap: 8,
  },
  hotlineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hotlineLeft: {
    flex: 1,
  },
  hotlineService: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  hotlineNumber: {
    fontFamily: sfFont,
    fontSize: 11,
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  hotlineButtons: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  copyBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  copyBtnText: {
    fontFamily: sfFont,
    fontSize: 9.5,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  callPill: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
});
