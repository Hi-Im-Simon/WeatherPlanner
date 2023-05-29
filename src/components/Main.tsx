import React, { useEffect, useState, useRef } from 'react';
import { Alert, Text, Linking, StyleSheet, View, Button } from 'react-native';
import * as Location from 'expo-location';
import Weather from './Weather/Weather';


const Main = () => {
    const [locationPermission, setLocationPermission] = useState<boolean>(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    const getLocation = async () => {
        const retryGetLocation = async (firstRun: boolean = false) => {
            if (location == null || firstRun) {
                Location.getLastKnownPositionAsync({}).then((loc) => {
                    if (loc !== null) {
                        setLocation(loc);
                    }
                    else {
                        setTimeout(retryGetLocation, 500);
                    }
                });
            }
        }

        try {
            // ask for location permission
            let locationStatus: Location.PermissionResponse = await Location.requestForegroundPermissionsAsync();

            // check if user granted the permission
            if (locationStatus.granted) {
                // if they did, proceed to get user's location
                setLocationPermission(true);
                retryGetLocation(true)
            }
            else {
                // if not, try to get it again
                setLocationPermission(false);

                // if can't ask again, ask the user to enable it manually
                // and ask for permission again in 5 seconds
                if (!locationStatus.canAskAgain) {
                    Alert.alert(
                        'Location Permission Required',
                        'Please enable location permission in your device settings to use this app.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Open Settings',
                                onPress: () => {
                                    Linking.openSettings();
                                    setTimeout(getLocation, 5000);
                                }
                            },
                        ]
                    );
                }
                // if can ask again, prompt user again
                else {
                    getLocation();
                }
            }
        } catch (error) {
            Alert.alert(`Error: ${error}`);
        }
    }

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <>
            {locationPermission
                ?
                (location !== null
                    ?
                    <>
                        <Button
                            onPress={ () => {
                                setLocation(null);
                                getLocation();
                            }}
                            title='Refresh'
                        />
                        <Weather coords={location.coords} />
                    </>
                    :
                    <View style={styles.part}>
                        <Text>Finding your location...</Text>
                        <Text>Make sure phone's location is enabled.</Text>
                    </View>
                )

                :
                <View style={styles.part}>
                    <Text>Could not get location permission!</Text>
                </View>
            }
        </>
    );
};

const styles = StyleSheet.create({
    part: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default Main;