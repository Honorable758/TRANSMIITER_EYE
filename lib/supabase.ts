import { createClient } from '@supabase/supabase-js';

// Your shared Supabase project configuration
const supabaseUrl = 'https://ivfxivscfhaqajzdqmsh.supabase.cohttps://ivfxivscfhaqajzdqmsh.supabase.co';
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
    
    // Insert the data
    console.log('📤 Inserting data into location_data table...');
    const { data: insertedData, error } = await supabase
      .from('location_data')
      .insert([data])
      .select();
    
    if (error) {
      console.error('❌ Insert error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message} (${error.code})`);
    }
    
    console.log('✅ Data transmitted successfully to location_data table!');
    console.log('📊 Inserted record:', insertedData);
  } catch (error) {
    console.error('💥 Failed to transmit location data:', error);
    if (error instanceof Error) {
      console.error('💥 Error stack:', error.stack);
    }
    throw error;
  }
};