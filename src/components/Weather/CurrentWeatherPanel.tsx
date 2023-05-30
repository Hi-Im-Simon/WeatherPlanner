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
        
        let weatherCode: number = props.weather.hourly.weathercode[props.i];

        // clear sky
        if ([0].includes(weatherCode)) {
            weatherCode = 0;
        }
        // mainly clear, partly cloudy, and overcast
        else if ([1, 2, 3].includes(weatherCode)) {
            // seperate pics, keep weatherCode
        } 
        // fog
        else if ([45, 48].includes(weatherCode)) {
            weatherCode = 45;
        } 
        // rain - small to mid
        else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67].includes(weatherCode)) {
            weatherCode = 51
        }
        // snow fall
        else if ([71, 73, 75].includes(weatherCode)) {
            weatherCode = 71;
        }
        // snow grains
        else if ([77].includes(weatherCode)) {
            weatherCode = 77;
        }
        // rain shower
        else if ([80, 81, 82].includes(weatherCode)) {
            weatherCode = 80;
        }
        // snow shower
        else if ([85, 86].includes(weatherCode)) {
            weatherCode = 85;
        }
        // thunderstorm
        else if ([95, 96, 99].includes(weatherCode)) {
            weatherCode = 95;
        }

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

