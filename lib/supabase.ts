import { createClient } from '@supabase/supabase-js';

// Your shared Supabase project configuration
const supabaseUrl = 'https://ivfxivscfhaqajzdqmsh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnhpdnNjZmhhcWFqemRxbXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTUxMjIsImV4cCI6MjA3MDMzMTEyMn0.D4OPmVxkqAxOyt64MVr9aoIGkXuRejtefoU_Rz9-Oec';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LocationDataRecord {
  device_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
  battery_level: number;
  device_type: string;
}

export const insertLocationData = async (data: LocationDataRecord): Promise<void> => {
  try {
    console.log('🚀 Starting transmission to Supabase...');
    console.log('📍 Data to transmit:', JSON.stringify(data, null, 2));
    
    // Test connection first
    console.log('🔍 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('location_data')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection test failed:', testError);
      throw new Error(`Connection failed: ${testError.message}`);
    }
    
    console.log('✅ Supabase connection test successful');
    
    // Insert the data
    console.log('📤 Inserting data into location_data table...');
    const { error } = await supabase
      .from('location_data')
      .insert([{
        device_id: data.device_id,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.timestamp,
        battery_level: data.battery_level,
        device_type: data.device_type,
      }]);
    
    if (error) {
      console.error('❌ Insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('✅ Data transmitted successfully to location_data table!');
  } catch (error) {
    console.error('💥 Failed to transmit location data:', error);
    throw error;
  }
};