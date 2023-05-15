import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';

const App = () => {
  const [stepCount, setStepCount] = useState<number>(0);
  const [pedomaterConnected, setPedomaterConnected] = useState<boolean>(false);

  const subscribe = async () => {
    await Pedometer.requestPermissionsAsync();
    setPedomaterConnected(await Pedometer.isAvailableAsync());

    if (pedomaterConnected) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);

      Pedometer.watchStepCount(val => setStepCount(val.steps));
    }
  };

  useEffect(() => {
    subscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {
        pedomaterConnected ?
          <>
            <StatusBar style="auto" />
            <Text>Hello!</Text>
            <Text>Steps: {stepCount}</Text>
          </>
          : <Text>Could not find a pedometer! Check your device settings.</Text>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;