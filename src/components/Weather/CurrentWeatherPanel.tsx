import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View, ImageBackground } from 'react-native';

import dateToUserTimeZone from '../../utils/dateToUserTimeZone';

const CurrentWeatherPanel = (props: { [name: string]: any }) => {
    const images = useRef(require.context('../../assets', true));

    const getImagePath = () => {
        const dayId = Math.floor(props.i / 24);
        const sunrise: Date = props.weather.daily.sunrise[dayId];
        const sunset: Date = props.weather.daily.sunset[dayId];
        const curTime: Date = props.weather.hourly.time[props.i];
        

        const timeOfDay: string = (curTime >= sunrise && sunset >= curTime) ? 'day' : 'night';
        const weatherCode: number = 0;

        return images.current(`./${timeOfDay}-${weatherCode}.png`);
    }

    useEffect(() => {
        
    }, []);

    return (
        <>
            {
                <ImageBackground
                    style={styles.container}
                    source={getImagePath()}
                >
                    <View>
                        <Text>
                            {props.weather.hourly.weathercode[props.i]}
                        </Text>
                    </View>
                </ImageBackground>
            }
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    }
});

export default CurrentWeatherPanel;

