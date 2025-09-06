/*
  # Create location_data table for E4 transmitter

  1. New Tables
    - `location_data`
      - `id` (int8, primary key, auto-generated)
      - `device_id` (text, device identifier)
      - `latitude` (numeric, GPS latitude)
      - `longitude` (numeric, GPS longitude)
      - `accuracy` (numeric, location accuracy in meters)
      - `timestamp` (timestamptz, when location was recorded)
      - `battery_level` (int4, battery percentage 0-100)
      - `created_at` (timestamptz, record creation time)
      - `device_type` (text, device model/type)

  2. Security
  
    - Add policy for public insert access (for transmitter devices)
    - Add policy for authenticated users to read all data

  3. Performance
    - Add indexes for device_id and timestamp for better query performance
*/

CREATE TABLE IF NOT EXISTS location_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy numeric,
  timestamp timestamptz NOT NULL,
  battery_level int4 NOT NULL,
  created_at timestamptz DEFAULT now(),
  device_type text NOT NULL
);

ALTER TABLE location_data ENABLE ROW LEVEL SECURITY;

-- Allow public insert for transmitter devices
CREATE POLICY "Allow public insert for transmitters"
  ON location_data
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated users to read all data"
  ON location_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_location_data_device_id ON location_data(device_id);
CREATE INDEX IF NOT EXISTS idx_location_data_timestamp ON location_data(timestamp DESC);
