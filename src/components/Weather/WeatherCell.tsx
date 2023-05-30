import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import dateToUserTimeZone from '../../utils/dateToUserTimeZone';

const WeatherCell = (props: { [name: string]: any }) => {
    const [rawDate, setRawDate] = useState<Date | null>(null);
    
    useEffect(() => {
        setRawDate(dateToUserTimeZone(props.time));
    }, []);

    return (
        <View 
            style={[
                styles.container,
                {width: props.cellWidth},
                (props.isCurrentCell && styles.ifCurrentCellContainer),
            ]}
        >
            <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                {/* day of week */}
                {(rawDate?.getHours() == 0 || props.i == 0) &&
                    rawDate?.toLocaleString('default', { weekday: 'long' }).split(',')[0]
                }
            </Text>
            <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                {/* date */}
                {(rawDate?.getHours() == 0 || props.i == 0) &&
                    rawDate?.toLocaleDateString()
                }
            </Text>
            <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                {/* hour */}
                {rawDate?.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: 'numeric'
                })}
            </Text>
            <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                Act: {props.temperature}{props.temperatureUnits}
            </Text>
            <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                App: {props.apparentTemperature}{props.temperatureUnits}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        borderColor: 'black',
    },
    ifCurrentCellContainer: {
    },
    ifCurrentCellText: {
        fontWeight: 'bold',
    }
});

// only rerender the component if any of these values has changed
export default React.memo(WeatherCell, (prevProps, nextProps) => {
    if (
        prevProps.time !== nextProps.time ||
        prevProps.isCurrentCell !== nextProps.isCurrentCell
    ) return false;
    return true;
});

