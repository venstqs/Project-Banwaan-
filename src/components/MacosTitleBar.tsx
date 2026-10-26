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
          <Text style={styles.appTitle}>{title}</Text>
          <Text style={styles.divider}>•</Text>
          <Text style={styles.subTitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Right System Status Indicator (Clickable to toggle network simulation) */}
      <TouchableOpacity
        style={styles.statusPill}
        onPress={onToggleNetwork}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isOnline ? macosColors.appleGreen : macosColors.appleYellow },
          ]}
        />
        <Text style={styles.statusText}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  titleBar: {
    height: 44,
    backgroundColor: macosColors.sidebarBackground,
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  trafficLights: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  trafficDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    fontSize: 10,
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
    backgroundColor: macosColors.controlBackground,
    borderWidth: 1,
    borderColor: macosColors.controlBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
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
    color: macosColors.textPrimary,
  },
});
