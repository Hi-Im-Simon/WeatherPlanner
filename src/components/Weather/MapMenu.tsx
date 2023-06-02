import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import * as Location from 'expo-location';
import MapView, {Region} from 'react-native-maps';

const MapMenu = (props: {[name: string]: any}) => {
    const [region, setRegion] = useState<Region | undefined>();

    useEffect(() => {
        setRegion({
            latitude: props.startCoords.latitude,
            longitude: props.startCoords.longitude,
            latitudeDelta: props.startCoords.latitudeDelta ? props.startCoords.latitudeDelta : 0.0025,
            longitudeDelta: props.startCoords.longitudeDelta ? props.startCoords.longitudeDelta : 0.0025
        });
    }, [props.startCoords]);

    return (
        <>
            {/* menu */}
            <View style={styles.dropdownMenu}>
                {/* choose button */}
                <View style={styles.dropdownMenuItem}>
                    <Button
                        title='Set location'
                        onPress={() => {
                            props.setLocation(region);
                            props.setShowMenu(false);
                        }}
                    />
                </View>
                {/* refresh button */}
                <View style={styles.dropdownMenuItem}>
                    <Button
                        title='My location'
                        onPress={() => props.getLocation()}
                    />
                </View>
            </View>
            
            {/* display map */}
            <View style={styles.container}>
                {props.startCoords &&
                <MapView style={styles.map}
                    region={region}
                    // check if values are much different (maps are buggy)
                    onRegionChangeComplete={(reg) => {
                        if (
                            region !== undefined &&
                            Math.abs(reg.latitude - region.latitude) > 0.00001 &&
                            Math.abs(reg.longitude - region.longitude) > 0.00001
                        ) setRegion(reg)
                    }}
                />
            }
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignSelf: 'stretch',
    },
    dropdownMenu: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        alignSelf: 'stretch',
        gap: 120,
        zIndex: 6,
    },
    dropdownMenuItem: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default MapMenu;