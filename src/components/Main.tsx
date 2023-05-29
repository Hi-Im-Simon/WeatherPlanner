import React, { useEffect, useState, useRef } from 'react';
import { Text } from 'react-native';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';

import { rad_to_deg, average, isInRangeThr } from '../utils/math';

const THRESHOLD_APPROVE = Math.PI / 2;
const THRESHOLD_VETO = Math.PI / 6;

const Main = () => {
    const [rotation, setRotation] = useState<{ [name: string]: number }>({
        alpha: 0.0, beta: 0.0, gamma: 0.0
    });
    const [acceleration, setAcceleration] = useState<{ [name: string]: number }>({
        x: 0.0, y: 0.0, z: 0.0
    });
    const [gest, setGest] = useState('');
    const subscription = useRef<Subscription>();
    const pastRotations = useRef<{ [name: string]: number[] }>({
        alpha: [], beta: [], gamma: []
});

    const startDeviceMotion = async () => {
        try {
            // check if DeviceMotion sensor is available
            if (await DeviceMotion.isAvailableAsync()) {
                DeviceMotion.setUpdateInterval(100);

                // add a listener
                subscription.current = DeviceMotion.addListener((measurements: DeviceMotionMeasurement) => {
                    // calculate new rotation
                    setAcceleration({...measurements.acceleration});
                    
                    const gesture = detectHandGestures({...measurements.acceleration});
                    setGest(gesture);
                });

            } else {
                console.log('DeviceMotion sensor is not available on this device.');
            }
        } catch (error) {
            console.log('Error setting up DeviceMotion:', error);
        }
    };

    const detectHandGestures = (acceleration: {[name: string]: number}) => {
        let gesture = '';

        // if (pastRotations.current.gamma.length > 10) {
        //     if (
        //         isInRangeThr(rotation.alpha, pastRotations.current.alpha, THRESHOLD_VETO)
        //         &&
        //         isInRangeThr(rotation.beta, pastRotations.current.beta, THRESHOLD_VETO)
        //         &&
        //         !isInRangeThr(rotation.gamma, pastRotations.current.gamma, THRESHOLD_APPROVE)
        //     ) {
        //         gesture = 'swap';
        //     }

        //     pastRotations.current.alpha.shift();
        //     pastRotations.current.beta.shift();
        //     pastRotations.current.gamma.shift();
        // }

        // pastRotations.current.alpha.push(rotation.alpha);
        // pastRotations.current.beta.push(rotation.beta);
        // pastRotations.current.gamma.push(rotation.gamma);

        if (
            (acceleration.z > acceleration.x*2) &&
            (acceleration.z > acceleration.y*2) &&
            // !(acceleration.x > THRESHOLD_VETO || -THRESHOLD_VETO > acceleration.x) &&
            // !(acceleration.y > THRESHOLD_VETO || -THRESHOLD_VETO > acceleration.y) &&
            (acceleration.z > THRESHOLD_APPROVE || -THRESHOLD_APPROVE > acceleration.z)
        ) {
            gesture = 'move';
        }
        return gesture;
    }

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
            <Text>X: {acceleration.x}</Text>
            <Text>Y: {acceleration.y}</Text>
            <Text>Z: {acceleration.z}</Text>
            <Text></Text>
            <Text>{gest}</Text>
        </>
    );
};

export default Main;