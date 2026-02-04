import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { supabase } from './lib/supabase';
import { useState } from 'react';

export default function App() {
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
      } else {
        setEventCount(data?.length || 0);
        alert(`Success! Found ${data?.length} events`);
      }
    } catch (err) {
      console.error('Catch error:', err);
      alert('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PlanLock Setup Test</Text>
      
      {eventCount !== null && (
        <Text style={styles.result}>Found {eventCount} events in database</Text>
      )}
      
      <Button 
        title={loading ? "Testing..." : "Test Supabase Connection"} 
        onPress={testConnection}
        disabled={loading}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  result: {
    fontSize: 18,
    marginBottom: 20,
    color: 'green',
  },
});