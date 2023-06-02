import React, { useEffect, useState, useRef } from 'react';
import { Alert, Text, Linking, StyleSheet, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import Weather from './Weather/Weather';

import MapMenu from './Weather/MapMenu';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const Main = () => {
    const [locationPermission, setLocationPermission] = useState<boolean>(false);
    // actual location, only changed on app init or when user sets it
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    // temp location, buf between getLocation without setting and Map component init
    const [mapRefreshLocation, setMapRefreshLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const screenWidth = useRef<number>(width);
    const screenHeight = useRef<number>(height);

    const getLocation = async (set: boolean = false) => {
        // setMapStartLocation(null);

        const retryGetLocation = async (set: boolean) => {
            Location.getLastKnownPositionAsync({}).then((loc: Location.LocationObject | null) => {
                if (loc !== null) {
                    if (set) {
                        setLocation(loc.coords);
                    } else {
                        setMapRefreshLocation(loc.coords);
                    }
                }
                else {
                    setTimeout(() => retryGetLocation(set), 500);
                }
            });
        }

        try {
            // ask for location permission
            let locationStatus: Location.PermissionResponse = await Location.requestForegroundPermissionsAsync();

            // check if user granted the permission
            if (locationStatus.granted) {
                // if they did, proceed to get user's location
                setLocationPermission(true);
                retryGetLocation(set)
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
        getLocation(true);
    }, []);

    return (
        <View style={styles.container}>
            {locationPermission
                ?
                (location !== null
                    ?
                    <>
                        {/* dropdown menu button (position absolute) */}
                        <TouchableOpacity style={[styles.buttonView, showMenu && styles.buttonViewShowMenu]}
                            onPress={() => {
                                setMapRefreshLocation(location);
                                setShowMenu((cur) => !cur);
                            }}
                            activeOpacity={0.4}
                        >
                            <Image style={[styles.buttonImage, showMenu && styles.buttonImageShowMenu]}
                                source={require('../../assets/down-arrow.png')}
                            />
                        </TouchableOpacity>

                        {/* dropdown menu (position absolute) */}
                        {showMenu &&
                            <View style={styles.dropdown}>
                                <MapMenu
                                    startCoords={mapRefreshLocation}
                                    getLocation={getLocation}
                                    setLocation={setLocation}
                                    setShowMenu={setShowMenu}
                                />
                            </View>
                        }

                        {/* actual app */}
                        <Weather
                            coords={location}
                            screenWidth={screenWidth}
                        />
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    part: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonView: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 10,
    },
    buttonViewShowMenu: {

    },
    buttonImage: {
        width: 40,
        height: 40,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    buttonImageShowMenu: {
        transform: [{ rotate: '180deg' }],
    },
    dropdown: {
        flex: 1,
        position: 'absolute',
        alignSelf: 'center',
        width: width,
        height: height,
        zIndex: 5,
    },
});

export default Main;