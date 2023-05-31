import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity  } from 'react-native';
import { DateTime } from 'luxon';

import dateToUserTimeZone from '../../utils/dateToUserTimeZone';

const WeatherCell = (props: { [name: string]: any }) => {
    const [rawDate, setRawDate] = useState<DateTime | null>(null);
    
    useEffect(() => {
        setRawDate(dateToUserTimeZone(props.time));
    }, []);

    return (
        <TouchableOpacity 
            onPress={() => props.scrollToCell(props.i)}
            style={[
                styles.container,
                {width: props.cellWidth},
                (props.isCurrentCell && styles.ifCurrentCellContainer),
            ]}
        >
            <Text style={props.isCurrentCell && styles.ifCurrentCellTitleText}>
                {/* day of week */}
                {(rawDate?.hour == 0 || props.i == 0 || props.isCurrentCell) &&
                    rawDate?.toFormat('EEEE')
                }
            </Text>
            <Text style={props.isCurrentCell && styles.ifCurrentCellTitleText}>
                {/* date */}
                {(rawDate?.hour == 0 || props.i == 0 || props.isCurrentCell) &&
                    rawDate?.toFormat('dd/MM/yyyy')
                }
            </Text>
            <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                {/* hour */}
                {rawDate?.toFormat('hh:mm a')}
            </Text>
            <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                {props.temperature}{props.temperatureUnits}
            </Text>
        </TouchableOpacity>
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
    },
    ifCurrentCellTitleText: {
        fontWeight: 'bold',
        fontSize: 17,
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

