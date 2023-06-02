import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

const Map = (props: {[name: string]: any}) => {
    return (
        <View style={styles.container}>
        {props.coords &&
            <MapView style={styles.map}
                initialRegion={{
                    latitude: props.coords.latitude,
                    longitude: props.coords.longitude,
                    latitudeDelta: props.coords.latitudeDelta !== undefined ? props.coords.latitudeDelta : 0,
                    longitudeDelta: props.coords.longitudeDelta !== undefined ? props.coords.longitudeDelta : 0,
                }}
                onRegionChange={(region) => props.chosenLocation.current = region}
            />
        }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignSelf: 'stretch',
    },
    map: {
        flex: 1,
    },
});

export default Map;