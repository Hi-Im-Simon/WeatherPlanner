import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, Permission } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import * as Permissions from 'expo-permissions';

const App = () => {
  const [stepCount, setStepCount] = useState<number>(0);
  const [pedometerConnected, setPedometerConnected] = useState<boolean>(false);

  const subscribe = async () => {
    Pedometer.isAvailableAsync().then(
      (result) => {
        setPedometerConnected(true);
      },
      (error) => {
        setPedometerConnected(false);
        console.log(error);
      }
    );

    if (pedometerConnected) {
      Pedometer.watchStepCount(val => { 
        console.log('step!')
        setStepCount(val.steps);
      });
    }
  };

  useEffect(() => {
    
    subscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {
        pedometerConnected ?
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