import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Battery, 
  Clock,
  Info,
  Smartphone
} from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>SETTINGS</Text>
        </View>

        {/* Device Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={20} color="#00ff88" />
            <Text style={styles.sectionTitle}>DEVICE INFO</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Model: Motorola E4</Text>
            <Text style={styles.infoText}>App Version: 1.0.0</Text>
            <Text style={styles.infoText}>Phase: 1 (Local Data Collection)</Text>
          </View>
        </View>

        {/* Transmission Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#00ff88" />
            <Text style={styles.sectionTitle}>DATA COLLECTION</Text>
          </View>
          <View style={styles.settingsCard}>
            <Text style={styles.settingLabel}>Update Interval</Text>
            <Text style={styles.settingValue}>5 minutes</Text>
          </View>
          <View style={styles.settingsCard}>
            <Text style={styles.settingLabel}>Location Accuracy</Text>
            <Text style={styles.settingValue}>High</Text>
          </View>
          <View style={styles.settingsCard}>
            <Text style={styles.settingLabel}>Data Storage</Text>
            <Text style={styles.settingValue}>Local Only</Text>
          </View>
        </View>

        {/* Data Collection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#00ff88" />
            <Text style={styles.sectionTitle}>COLLECTED DATA</Text>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ GPS Coordinates</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Battery Status</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Timestamp Logging</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Location Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Phase Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#00ff88" />
            <Text style={styles.sectionTitle}>PROJECT PHASES</Text>
          </View>
          
          <View style={styles.phaseCard}>
            <View style={[styles.phaseIndicator, styles.phaseActive]} />
            <View style={styles.phaseContent}>
              <Text style={styles.phaseTitle}>Phase 1: Location Tracking</Text>
              <Text style={styles.phaseDescription}>
                Basic location tracking with battery monitoring and 5-minute intervals
              </Text>
            </View>
          </View>

          <View style={styles.phaseCard}>
            <View style={[styles.phaseIndicator, styles.phaseActive]} />
            <View style={styles.phaseContent}>
              <Text style={styles.phaseTitle}>Phase 2: Supabase Integration</Text>
              <Text style={styles.phaseDescription}>
                Send location data to Supabase database for remote monitoring
              </Text>
            </View>
          </View>

          <View style={styles.phaseCard}>
            <View style={[styles.phaseIndicator, styles.phaseInactive]} />
            <View style={styles.phaseContent}>
              <Text style={styles.phaseTitleInactive}>Phase 3: Advanced Features</Text>
              <Text style={styles.phaseDescriptionInactive}>
                Add additional sensors, alerts, and optimization features
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            E4 Transmitter Project - Phase 2
          </Text>
          <Text style={styles.footerSubText}>
            Remote data transmission active
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#fff',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#00ff88',
    marginLeft: 8,
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    gap: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  settingsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  settingValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#00ff88',
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureItem: {
    marginBottom: 12,
  },
  featureText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#00ff88',
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  phaseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
    marginTop: 4,
  },
  phaseActive: {
    backgroundColor: '#00ff88',
  },
  phaseInactive: {
    backgroundColor: '#333',
  },
  phaseContent: {
    flex: 1,
  },
  phaseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  phaseTitleInactive: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  phaseDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  phaseDescriptionInactive: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#00ff88',
    textAlign: 'center',
  },
  footerSubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
});