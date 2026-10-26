import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { macosColors, macosTypography, sfFont } from '../config/macosTheme';

interface MacosTitleBarProps {
  title?: string;
  subtitle?: string;
  isOnline: boolean;
  onToggleNetwork?: () => void;
}

export const MacosTitleBar: React.FC<MacosTitleBarProps> = ({
  title = "Project Banwaan",
  subtitle = "Naga City • PSA CBMS",
  isOnline,
  onToggleNetwork,
}) => {
  return (
    <View style={styles.titleBar}>
      {/* macOS Traffic Light Window Controls */}
      <View style={styles.trafficLights}>
        <View style={[styles.trafficDot, { backgroundColor: macosColors.trafficClose }]} />
        <View style={[styles.trafficDot, { backgroundColor: macosColors.trafficMin }]} />
        <View style={[styles.trafficDot, { backgroundColor: macosColors.trafficZoom }]} />
      </View>

      {/* Centered Window Title & Breadcrumb */}
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.appTitle}>{title}</Text>
          <Text style={styles.divider}>/</Text>
          <Text style={styles.subTitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Right System Status Indicator (Clickable to toggle network simulation) */}
      <TouchableOpacity
        style={[
          styles.statusPill,
          isOnline ? styles.statusPillOnline : styles.statusPillOffline,
        ]}
        onPress={onToggleNetwork}
        activeOpacity={0.7}
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
            { color: isOnline ? '#065f46' : '#92400e' },
          ]}
        >
          {isOnline ? 'Live' : 'Offline'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  titleBar: {
    height: 46,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  trafficLights: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: 60,
  },
  trafficDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: macosColors.appleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  appTitle: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: macosColors.textPrimary,
    letterSpacing: -0.2,
  },
  divider: {
    color: macosColors.textTertiary,
    fontSize: 11,
  },
  subTitle: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  statusPillOnline: {
    backgroundColor: macosColors.appleGreenSubtle,
    borderColor: macosColors.appleGreenBorder,
  },
  statusPillOffline: {
    backgroundColor: macosColors.appleYellowSubtle,
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
});
