import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet } from 'react-native';

const RoleSelection = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>Project Banwaan</Text>
    <Button title="Barangay Captain Mode" onPress={() => navigation.navigate('CaptainDashboard')} />
    <Button title="Field Inspector Mode" onPress={() => navigation.navigate('FieldCamera')} />
    <Button title="Resident & Alert Mode" onPress={() => navigation.navigate('ResidentHub')} />
  </View>
);

const CaptainDashboard = () => (
  <View style={styles.container}><Text>Barangay Captain: Local CBMS Profile</Text></View>
);
const FieldCamera = () => (
  <View style={styles.container}><Text>Field Inspector: Offline Geotagged Camera</Text></View>
);
const ResidentHub = () => (
  <View style={styles.container}><Text>Resident: Calamity Alerts & SOS Hotline</Text></View>
);

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelection">
        <Stack.Screen name="RoleSelection" component={RoleSelection} options={{ title: 'Select Role' }} />
        <Stack.Screen name="CaptainDashboard" component={CaptainDashboard} options={{ title: 'Captain Dashboard' }} />
        <Stack.Screen name="FieldCamera" component={FieldCamera} options={{ title: 'Field Inspection' }} />
        <Stack.Screen name="ResidentHub" component={ResidentHub} options={{ title: 'Resident Hub' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 }
});