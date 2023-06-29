import React, { useEffect, useState, useRef } from 'react';
import { Text, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import WeatherCell from './WeatherCell';
import CurrentWeatherPanel from './CurrentWeatherPanel';
import InputOutputPanel from './InputOutputPanel';

const Weather = (props: { [name: string]: any }) => {
    const [weather, setWeather] = useState<any>(null);
    const [currentCell, setCurrentCell] = useState<number>(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const getWeather = async () => {
        fetch(`https://api.open-meteo.com/v1/forecast?
            latitude=${props.coords.latitude}&
            longitude=${props.coords.longitude}&
            timezone=GMT&
            current_weather=true&
            hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m&
            daily=sunrise,sunset&
            forecast_days=16
            `.replace(/\s/g, '') // remove spaces
        ).then((res) => {
            res.json().then((json) => {
                // console.log(json)
                setWeather(json);
                //also scroll to current time
                const currentHourGMT = new Date(json.current_weather.time).getHours();
                scrollToCell(currentHourGMT, false);
            });
        });
    };

    const scrollToCell = (i: number, animatedScroll: boolean = true) => {
        scrollViewRef.current?.scrollTo({
            x: i * styles.cell.width,
            animated: animatedScroll,
        });
        setCurrentCell(i);
    };

    useEffect(() => {
        getWeather();
    }, [props.coords]);

    return (
        <View style={styles.container}>
            {weather !== null
                ?
                <>
                    <View style={[styles.part, styles.currentWeatherPanel]}>
                        <CurrentWeatherPanel
                            weather={weather}
                            i={currentCell}
                        />
                    </View>

                    <MaskedView style={[styles.part, styles.weatherCells]}
                        maskElement={
                            <LinearGradient
                                style={styles.gradient}
                                colors={['transparent', 'white', 'transparent']} locations={[0, 0.5, 1]}
                                start={{ x: -0.3, y: 0 }} end={{ x: 1.3, y: 0 }}
                            />
                        }>
                        <ScrollView 
                            ref={scrollViewRef}
                            showsHorizontalScrollIndicator={false}
                            horizontal
                            pagingEnabled
                            snapToOffsets={[...Array(weather.hourly.time.length)].map((_, i) => 
                                i * styles.cell.width
                            )}
                            snapToAlignment={'start'}
                            contentContainerStyle={{
                                paddingHorizontal: ((props.screenWidth.current / 2) - (styles.cell.width / 2))
                            }}
                            onMomentumScrollEnd={
                                // when scrolling stops, calculated which element will be displayed
                                (event) => setCurrentCell(Math.round(event.nativeEvent.contentOffset.x / styles.cell.width))
                            }
                        >
                            {
                                weather.hourly.time.map((_: any, i: number) => {
                                    if (weather.hourly.temperature_2m[i] !== null && weather.hourly.weathercode[i] !== null) {
                                        return <WeatherCell
                                            key={`WeatherCell-${i}`}
                                            i={i}
                                            scrollToCell={scrollToCell}
                                            isCurrentCell={currentCell == i}
                                            time={weather.hourly.time[i]}
                                            temperature={weather.hourly.temperature_2m[i]}
                                            apparentTemperature={weather.hourly.apparent_temperature[i]}
                                            temperatureUnits={weather.hourly_units.temperature_2m}
                                            windspeedUnits={weather.hourly_units.windspeed_10m}
                                            cellWidth={styles.cell.width}
                                        />
                                    }
                                })
                            }
                        </ScrollView>
                    </MaskedView>

                    {/* bottom panel */}
                    <View style={[styles.part, styles.bottomPanel]}>
                        <InputOutputPanel
                            weather={weather}
                            currentCell={currentCell}
                            screenWidth={props.screenWidth}
                        />
                        
                    </View>
                </>
                :
                <View style={styles.part}>
                    <Text>Finding your weather forecast...</Text>
                </View>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    part: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // top panel - current weather
    currentWeatherPanel: {
        flex: 10,
    },

    // middle panel - scrollview with cells
    gradient: {
        flex: 1,
        flexDirection: 'row',
        height: '100%',
    },
    weatherCells: {
        flex: 4,
    },
    cell: {
        width: 90,
    },

    // bottom panels
    bottomPanel: {
        flex: 16,
    },
});

export default Weather;
