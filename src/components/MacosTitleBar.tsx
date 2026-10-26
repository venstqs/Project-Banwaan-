import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { macosColors, sfFont } from '../config/macosTheme';
import { MobileRole } from '../context/OfflineContext';

interface MacosTitleBarProps {
  title?: string;
  subtitle?: string;
  isOnline: boolean;
  onToggleNetwork?: () => void;
  mobileRole?: MobileRole;
  onSelectRole?: (role: MobileRole) => void;
  onOpenSearch?: () => void;
}

export const MacosTitleBar: React.FC<MacosTitleBarProps> = ({
  title = 'Project Banwaan',
  subtitle = 'Naga City • CBMS v2.6',
  isOnline,
  onToggleNetwork,
  mobileRole = 'barangay_captain',
  onSelectRole,
  onOpenSearch,
}) => {
  return (
    <View style={styles.headerWrapper}>
      {/* Top Row: Brand, Search Pill & Live Status */}
      <View style={styles.titleBar}>
        {/* Left: Brand Logo & Title */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <View style={styles.barGroup}>
              <View style={[styles.logoBar, { height: 9, backgroundColor: '#ffffff' }]} />
              <View style={[styles.logoBar, { height: 13, backgroundColor: '#facc15' }]} />
              <View style={[styles.logoBar, { height: 7, backgroundColor: '#ffffff' }]} />
            </View>
          </View>
          <View>
            <View style={styles.titleLine}>
              <Text style={styles.appTitle}>{title}</Text>
              <Text style={styles.versionTag}>v2.6</Text>
            </View>
            <Text style={styles.subTitle}>{subtitle}</Text>
          </View>
        </View>

        {/* Right: Omnisearch + Live/Offline Toggle */}
        <View style={styles.rightControls}>
          {onOpenSearch && (
            <TouchableOpacity
              style={styles.searchPill}
              onPress={onOpenSearch}
              activeOpacity={0.75}
            >
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchText}>Search 911 / Brgy</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.statusPill,
              isOnline ? styles.statusPillOnline : styles.statusPillOffline,
            ]}
            onPress={onToggleNetwork}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? macosColors.appleGreen : macosColors.appleYellow },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isOnline ? '#16a34a' : '#92400e' },
              ]}
            >
              {isOnline ? 'Live' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Second Row: Dedicated Persona Switcher (Barangay Captain vs Citizen) */}
      {onSelectRole && (
        <View style={styles.roleBar}>
          <View style={styles.roleInfoCol}>
            <Text style={styles.roleBarLabel}>ACTIVE MOBILE PERSONA</Text>
            <Text style={styles.roleBarSub}>
              {mobileRole === 'barangay_captain'
                ? '🏛️ Punong Barangay • RA 7160 Sec. 389 Council Authority'
                : '👥 Citizen Resident • RA 10173 Privacy-Protected Portal'}
            </Text>
          </View>

          <View style={styles.roleSwitchGroup}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                mobileRole === 'barangay_captain' && styles.roleBtnActiveCaptain,
              ]}
              onPress={() => onSelectRole('barangay_captain')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  mobileRole === 'barangay_captain' && styles.roleBtnTextActive,
                ]}
              >
                🏛️ Captain
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                mobileRole === 'citizen' && styles.roleBtnActiveCitizen,
              ]}
              onPress={() => onSelectRole('citizen')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  mobileRole === 'citizen' && styles.roleBtnTextActive,
                ]}
              >
                👥 Citizen
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
  },
  titleBar: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: macosColors.appleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  logoBar: {
    width: 2.5,
    borderRadius: 1.5,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  appTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.3,
  },
  versionTag: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.textTertiary,
  },
  subTitle: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textSecondary,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  searchIcon: {
    fontSize: 11,
  },
  searchText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  statusPillOnline: {
    backgroundColor: '#eaf8ee',
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  statusPillOffline: {
    backgroundColor: macosColors.appleYellowSubtle,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
  },
  roleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#f8f9fc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  roleInfoCol: {
    flex: 1,
  },
  roleBarLabel: {
    fontFamily: sfFont,
    fontSize: 8,
    fontWeight: '800',
    color: macosColors.textTertiary,
    letterSpacing: 0.6,
  },
  roleBarSub: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
    marginTop: 1,
  },
  roleSwitchGroup: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 2.5,
    gap: 2,
  },
  roleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  roleBtnActiveCaptain: {
    backgroundColor: macosColors.appleBlue,
  },
  roleBtnActiveCitizen: {
    backgroundColor: '#0d9488',
  },
  roleBtnText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  roleBtnTextActive: {
    color: '#ffffff',
  },
});
