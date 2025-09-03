import { Platform } from 'react-native';

export const generateDeviceId = (): string => {
  // Generate a unique device ID based on timestamp and random number
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `e4_${timestamp}_${random}`;
};

export const getDeviceType = (): string => {
  if (Platform.OS === 'android') {
    return 'Motorola E4';
  }
  return Platform.OS;
};