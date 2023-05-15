import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, PermissionsAndroid, Permission } from 'react-native';
import { request, PERMISSIONS } from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';

const App = () => {
  const [stepCount, setStepCount] = useState<number>(0);
  const [pedomaterConnected, setPedomaterConnected] = useState<boolean>(false);

  const subscribe = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        'com.google.android.gms.permission.ACTIVITY_RECOGNITION',
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        setPedomaterConnected(true);
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }

    if (pedomaterConnected) {
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