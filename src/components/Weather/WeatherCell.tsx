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
            {(rawDate?.hour == 0 || props.i == 0 || props.isCurrentCell) &&
                <Text style={props.isCurrentCell && styles.ifCurrentCellTitleText}>
                    {/* day of week */}
                    {rawDate?.toFormat('EEEE')}
                </Text>
            }
            {(rawDate?.hour == 0 || props.i == 0 || props.isCurrentCell) &&
                <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                    {/* date */}
                    {rawDate?.toFormat('dd/MM/yyyy')}
                </Text>
            }
            <Text style={props.isCurrentCell && styles.ifCurrentCellText}>
                {/* hour */}
                {rawDate?.toFormat('hh:mm a')}
            </Text>
            <Text style={props.isCurrentCell && styles.ifCurrentCellTitleText}>
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
        fontWeight: '500',
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
        prevProps.isCurrentCell !== nextProps.isCurrentCell ||
        prevProps.temperature !== nextProps.temperature
    ) return false;
    return true;
});

