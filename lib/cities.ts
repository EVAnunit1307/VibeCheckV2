/**
 * Major US Cities for Event Discovery
 */

export interface City {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  emoji: string;
}

export const MAJOR_CITIES: City[] = [
  // 🇨🇦 Canada - Listed First!
  { id: 'toronto', name: 'Toronto', state: 'ON', latitude: 43.6532, longitude: -79.3832, emoji: '🍁' },
  { id: 'montreal', name: 'Montreal', state: 'QC', latitude: 45.5017, longitude: -73.5673, emoji: '🏒' },
  { id: 'vancouver', name: 'Vancouver', state: 'BC', latitude: 49.2827, longitude: -123.1207, emoji: '🏔️' },
  { id: 'calgary', name: 'Calgary', state: 'AB', latitude: 51.0447, longitude: -114.0719, emoji: '🤠' },
  { id: 'ottawa', name: 'Ottawa', state: 'ON', latitude: 45.4215, longitude: -75.6972, emoji: '🇨🇦' },
  
  // 🇺🇸 United States
  { id: 'nyc', name: 'New York', state: 'NY', latitude: 40.7128, longitude: -74.0060, emoji: '🗽' },
  { id: 'la', name: 'Los Angeles', state: 'CA', latitude: 34.0522, longitude: -118.2437, emoji: '🌴' },
  { id: 'chicago', name: 'Chicago', state: 'IL', latitude: 41.8781, longitude: -87.6298, emoji: '🌆' },
  { id: 'houston', name: 'Houston', state: 'TX', latitude: 29.7604, longitude: -95.3698, emoji: '🛢️' },
  { id: 'phoenix', name: 'Phoenix', state: 'AZ', latitude: 33.4484, longitude: -112.0740, emoji: '🌵' },
  { id: 'philly', name: 'Philadelphia', state: 'PA', latitude: 39.9526, longitude: -75.1652, emoji: '🔔' },
  { id: 'san-antonio', name: 'San Antonio', state: 'TX', latitude: 29.4241, longitude: -98.4936, emoji: '🎸' },
  { id: 'san-diego', name: 'San Diego', state: 'CA', latitude: 32.7157, longitude: -117.1611, emoji: '🏖️' },
  { id: 'dallas', name: 'Dallas', state: 'TX', latitude: 32.7767, longitude: -96.7970, emoji: '🏙️' },
  { id: 'san-jose', name: 'San Jose', state: 'CA', latitude: 37.3382, longitude: -121.8863, emoji: '💻' },
  { id: 'austin', name: 'Austin', state: 'TX', latitude: 30.2672, longitude: -97.7431, emoji: '🎵' },
  { id: 'jacksonville', name: 'Jacksonville', state: 'FL', latitude: 30.3322, longitude: -81.6557, emoji: '🏝️' },
  { id: 'sf', name: 'San Francisco', state: 'CA', latitude: 37.7749, longitude: -122.4194, emoji: '🌉' },
  { id: 'seattle', name: 'Seattle', state: 'WA', latitude: 47.6062, longitude: -122.3321, emoji: '☕' },
  { id: 'denver', name: 'Denver', state: 'CO', latitude: 39.7392, longitude: -104.9903, emoji: '⛰️' },
  { id: 'boston', name: 'Boston', state: 'MA', latitude: 42.3601, longitude: -71.0589, emoji: '🦞' },
  { id: 'portland', name: 'Portland', state: 'OR', latitude: 45.5152, longitude: -122.6784, emoji: '🌲' },
  { id: 'nashville', name: 'Nashville', state: 'TN', latitude: 36.1627, longitude: -86.7816, emoji: '🎤' },
  { id: 'miami', name: 'Miami', state: 'FL', latitude: 25.7617, longitude: -80.1918, emoji: '🌺' },
  { id: 'atlanta', name: 'Atlanta', state: 'GA', latitude: 33.7490, longitude: -84.3880, emoji: '🍑' },
  { id: 'vegas', name: 'Las Vegas', state: 'NV', latitude: 36.1699, longitude: -115.1398, emoji: '🎰' },
  { id: 'detroit', name: 'Detroit', state: 'MI', latitude: 42.3314, longitude: -83.0458, emoji: '🚗' },
];

export function getCityById(id: string): City | undefined {
  return MAJOR_CITIES.find(city => city.id === id);
}

export function getCityByName(name: string): City | undefined {
  return MAJOR_CITIES.find(city => 
    city.name.toLowerCase() === name.toLowerCase()
  );
}

export function getDefaultCity(): City {
  return MAJOR_CITIES[0]; // Toronto by default (first in list)
}
