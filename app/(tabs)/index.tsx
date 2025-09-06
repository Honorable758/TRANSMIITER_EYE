import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { MapPin, Battery as BatteryIcon, Clock, CircleAlert as AlertCircle, Wifi, Database } from 'lucide-react-native';
import 'react-native-url-polyfill/auto';
import { insertLocationData, LocationDataRecord } from '@/lib/supabase';
import { generateDeviceId, getDeviceType } from '@/utils/deviceInfo';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
}

type TransmissionStatus = 'idle' | 'sending' | 'success' | 'error';

interface TransmissionData {
  location: LocationData | null;
  batteryLevel: number;
  batteryState: Battery.BatteryState;
  lastUpdate: string;
  updateCount: number;
  transmissionCount: number;
  transmissionStatus: TransmissionStatus;
  lastTransmissionError: string | null;
}

export default function TransmitterScreen() {
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<TransmissionData>({
    location: null,
    batteryLevel: 0,
    batteryState: Battery.BatteryState.UNKNOWN,
    lastUpdate: '',
    updateCount: 0,
    transmissionCount: 0,
    transmissionStatus: 'idle',
    lastTransmissionError: null,
  });

  const [permissionStatus, setPermissionStatus] = useState<{
    location: boolean;
    battery: boolean;
  }>({
    location: false,
    battery: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const deviceIdRef = useRef<string>(generateDeviceId());

  useEffect(() => {
    requestPermissions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      const locationGranted = status === 'granted';

      if (!locationGranted) {
        Alert.alert(
          'Location Permission Required',
          'This app needs location permission to function as a transmitter.',
          [{ text: 'OK' }]
        );
      }

      setPermissionStatus(prev => ({
        ...prev,
        location: locationGranted,
        battery: true, // Battery API doesn't require explicit permission
      }));

      if (locationGranted) {
        await fetchInitialData();
        startAutoUpdate();
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const fetchLocationData = async (): Promise<LocationData | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  };

  const fetchBatteryData = async () => {
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();
      return { batteryLevel, batteryState };
    } catch (error) {
      console.error('Battery error:', error);
      return { batteryLevel: 0, batteryState: Battery.BatteryState.UNKNOWN };
    }
  };

  const fetchInitialData = async () => {
    const location = await fetchLocationData();
    const { batteryLevel, batteryState } = await fetchBatteryData();

    setData({
      location,
      batteryLevel,
      batteryState,
      lastUpdate: new Date().toLocaleString(),
      updateCount: 0,
      transmissionCount: 0,
      transmissionStatus: 'idle',
      lastTransmissionError: null,
    });
  };

  const sendToSupabase = async (locationData: LocationData, batteryLevel: number) => {
    try {
      console.log('🚀 Starting transmission to Supabase...');
      setData(prev => ({ ...prev, transmissionStatus: 'sending' }));

      const record: LocationDataRecord = {
        device_id: deviceIdRef.current,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
        battery_level: Math.round(batteryLevel * 100),
        device_type: getDeviceType(),
      };

      console.log('📍 Sending record:', record);
      await insertLocationData(record);
      console.log('✅ Transmission successful!');

      setData(prev => ({
        ...prev,
        transmissionStatus: 'success',
        transmissionCount: prev.transmissionCount + 1,
        lastTransmissionError: null,
      }));
    } catch (error) {
      console.error('❌ Supabase transmission error:', error);
      setData(prev => ({
        ...prev,
        transmissionStatus: 'error',
        lastTransmissionError: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  const updateData = async () => {
    const location = await fetchLocationData();
    const { batteryLevel, batteryState } = await fetchBatteryData();

    setData(prev => ({
      ...prev,
      location,
      batteryLevel,
      batteryState,
      lastUpdate: new Date().toLocaleString(),
      updateCount: prev.updateCount + 1,
    }));

    // Send to Supabase if location data is available
    if (location && permissionStatus.location) {
      await sendToSupabase(location, batteryLevel);
    }
  };

  const startAutoUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Update every 5 minutes (300000 ms)
    intervalRef.current = setInterval(() => {
      updateData();
    }, 300000);

    // Initial update
    updateData();
  };

  const getBatteryStateText = (state: Battery.BatteryState): string => {
    switch (state) {
      case Battery.BatteryState.CHARGING:
        return 'Charging';
      case Battery.BatteryState.FULL:
        return 'Full';
      case Battery.BatteryState.UNPLUGGED:
        return 'Unplugged';
      default:
        return 'Unknown';
    }
  };

  const formatCoordinate = (coord: number, type: 'lat' | 'lng'): string => {
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S') 
      : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  const getTransmissionStatusColor = () => {
    switch (data.transmissionStatus) {
      case 'success': return '#00ff88';
      case 'error': return '#ff4444';
      case 'sending': return '#ffaa00';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>E4 TRANSMITTER</Text>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: permissionStatus.location ? '#00ff88' : '#ff4444' }
              ]} />
              <Text style={styles.statusText}>
                {permissionStatus.location ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Permission Status */}
        {(!permissionStatus.location) && (
          <View style={styles.warningCard}>
            <AlertCircle size={20} color="#ff9500" />
            <Text style={styles.warningText}>
              Location permission required for transmission
            </Text>
          </View>
        )}

        {/* Data Cards */}
        <View style={styles.cardsContainer}>
          {/* Location Card */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <MapPin size={20} color="#00ff88" />
              <Text style={styles.cardTitle}>LOCATION</Text>
            </View>
            {data.location ? (
              <View style={styles.cardContent}>
                <Text style={styles.coordinateText}>
                  {formatCoordinate(data.location.latitude, 'lat')}
                </Text>
                <Text style={styles.coordinateText}>
                  {formatCoordinate(data.location.longitude, 'lng')}
                </Text>
                {data.location.accuracy && (
                  <Text style={styles.accuracyText}>
                    Accuracy: ±{data.location.accuracy.toFixed(1)}m
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.noDataText}>No location data</Text>
            )}
          </View>

          {/* Battery Card */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <BatteryIcon size={20} color="#00ff88" />
              <Text style={styles.cardTitle}>BATTERY</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.batteryText}>
                {Math.round(data.batteryLevel * 100)}%
              </Text>
              <Text style={styles.batteryStateText}>
                {getBatteryStateText(data.batteryState)}
              </Text>
            </View>
          </View>

          {/* Transmission Status Card */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Database size={20} color="#00ff88" />
              <Text style={styles.cardTitle}>TRANSMISSION</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.transmissionCountText}>
                {data.transmissionCount}
              </Text>
              <Text style={styles.transmissionSubText}>
                Records sent
              </Text>
              <View style={styles.transmissionStatus}>
                <View style={[
                  styles.transmissionDot,
                  { backgroundColor: getTransmissionStatusColor() }
                ]} />
                <Text style={styles.transmissionStatusText}>
                  {data.transmissionStatus.toUpperCase()}
                </Text>
              </View>
              {data.lastTransmissionError && (
                <Text style={styles.errorText}>
                  {data.lastTransmissionError}
                </Text>
              )}
            </View>
          </View>

          {/* Update Counter Card */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Clock size={20} color="#00ff88" />
              <Text style={styles.cardTitle}>UPDATES</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.updateCountText}>
                {data.updateCount}
              </Text>
              <Text style={styles.updateSubText}>
                Data cycles completed
              </Text>
            </View>
          </View>

          {/* Last Update Card */}
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Clock size={20} color="#00ff88" />
              <Text style={styles.cardTitle}>LAST UPDATE</Text>
            </View>
            <Text style={styles.timestampText}>
              {data.lastUpdate || 'No updates yet'}
            </Text>
          </View>
        </View>

        {/* Transmission Info */}
        {permissionStatus.location && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Wifi size={16} color="#00ff88" />
              <Text style={styles.infoText}>
                📡 Supabase transmission active
              </Text>
            </View>
            <Text style={styles.infoSubText}>
              Device ID: {deviceIdRef.current}
            </Text>
            <Text style={styles.infoSubText}>
              Sending to: ivfxivscfhaqajzdqmsh.supabase.co
            </Text>
            <Text style={styles.infoSubText}>
              Interval: Every 5 minutes
            </Text>
          </View>
        )}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#fff',
    letterSpacing: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ccc',
    letterSpacing: 1,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1f0a',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  warningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ff9500',
    marginLeft: 12,
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  dataCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#00ff88',
    marginLeft: 8,
    letterSpacing: 1,
  },
  cardContent: {
    gap: 4,
  },
  coordinateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#fff',
  },
  accuracyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  batteryText: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
  },
  batteryStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#888',
  },
  updateCountText: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
  },
  updateSubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#888',
  },
  timestampText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  noDataText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  transmissionCountText: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
  },
  transmissionSubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#888',
  },
  transmissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  transmissionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  transmissionStatusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ccc',
    letterSpacing: 1,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#0a2a1a',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00ff88',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#00ff88',
  },
  infoSubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
});