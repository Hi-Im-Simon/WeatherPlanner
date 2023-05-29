import React, { useEffect, useState, useRef } from 'react';
import { Text } from 'react-native';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';

import { rad_to_deg, average } from '../utils/math';

const TestMeasurer = () => {
  const [acceleration, setAcceleration] = useState<{ [name: string]: number }>({
    x: 0.0, y: 0.0, z: 0.0
  });
  const [rotation, setRotation] = useState<{ [name: string]: number }>({
    alpha: 0.0, beta: 0.0, gamma: 0.0
  });

  const subscription = useRef<Subscription>();
  const pastAcceleration = useRef<{ [name: string]: number[] }>({
    x: [], y: [], z: []
  });

  const startDeviceMotion = async () => {
    try {
      // check if DeviceMotion sensor is available
      if (await DeviceMotion.isAvailableAsync()) {
        DeviceMotion.setUpdateInterval(10);

        // add a listener
        subscription.current = DeviceMotion.addListener((measurements: DeviceMotionMeasurement) => {
          // calculate new acceleration
          pastAcceleration.current.x.push(measurements.acceleration!.x);
          pastAcceleration.current.y.push(measurements.acceleration!.y);
          pastAcceleration.current.z.push(measurements.acceleration!.z);

          if (pastAcceleration.current.x.length >= 100) {
            setAcceleration({
              x: average(pastAcceleration.current.x),
              y: average(pastAcceleration.current.y),
              z: average(pastAcceleration.current.z)
            });

            pastAcceleration.current.x = [];
            pastAcceleration.current.y = [];
            pastAcceleration.current.z = [];
          }

          // calculate new rotation
          setRotation({
            alpha: rad_to_deg(measurements.rotation.alpha),
            beta: rad_to_deg(measurements.rotation.beta),
            gamma: rad_to_deg(measurements.rotation.gamma)
          });
        });

      } else {
        console.log('DeviceMotion sensor is not available on this device.');
      }
    } catch (error) {
      console.log('Error setting up DeviceMotion:', error);
    }
  };

  useEffect(() => {
    startDeviceMotion();

    // Clean up the subscription when the component unmounts
    return () => {
      if (subscription) {
        subscription.current?.remove();
      }
    };
  }, []);

  return (
    <>
      <Text>Alpha: {Math.round(rotation.alpha)}</Text>
      <Text>Beta: {Math.round(rotation.beta)}</Text>
      <Text>Gamma: {Math.round(rotation.gamma)}</Text>
      
      <Text>X: {acceleration.x}</Text>
      <Text>Y: {acceleration.y}</Text>
      <Text>Z: {acceleration.z}</Text>

    </>
  );
};

export default TestMeasurer;