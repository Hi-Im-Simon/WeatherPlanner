import React, { useEffect, useState, useRef } from 'react';
import { Text, ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';

import WeatherCell from './WeatherCell';

const DEFAULT_SLIDER_VALUE = 3;

const Weather = (props: { [name: string]: any }) => {
    const [weather, setWeather] = useState<any>(null);
    const [currentCell, setCurrentCell] = useState<number>(0);
    const [sliderVal, setSliderVal] = useState<{[name: string]: number | string}>();
    const [chosenPeriod, setChosenPeriod] = useState<string>();
    const scrollViewRef = useRef<ScrollView>(null);
    const screenWidth = useRef<number>(Dimensions.get('window').width);

    const [test, setTest] = useState<any>(null);
    
    const getWeather = async () => {
        fetch(`https://api.open-meteo.com/v1/forecast?
            latitude=${props.coords.latitude}&
            longitude=${props.coords.longitude}&
            current_weather=true&
            hourly=temperature_2m,windspeed_10m,apparent_temperature
            `.replace(/\s/g, '') // remove spaces
        ).then((res) => {
            res.json().then((json) => {
                setWeather(json);
                //also scroll to current time
                const currentHourGMT = new Date(json.current_weather.time).getHours()
                setCurrentCell(currentHourGMT);
                scrollViewRef.current?.scrollTo({ 
                    x: currentHourGMT * styles.cell.width,
                    animated: false
                });
            });
        });
    }

    const dateToUserTZ = (dateString: string): Date => {
        const date = new Date(dateString);
        const timezoneOffset = -(date.getTimezoneOffset() * 60 * 1000);

        return new Date(date.getTime() + timezoneOffset);
    }

    const handleSliderValueChange = (i: number) => {
        let top = 0;
        let topTail = '';
        let bottom = 0;
        let bottomTail = '';
        // 1
        if (i == 1){
            top = 1;
            topTail = 'hour';
        }
        // 2 - 12 / step = 1
        else if (i <= 12) {
            top = i;
            topTail = 'hours';
        }
        // 14 - 22 / step = 2 (13 - 17)
        else if (i <= 17) {
            top = 12 + ((i - 12) * 2);
            topTail = 'hours';
        }
        // 24
        else if (i <= 18) {
            top = 1;
            topTail = 'day';
        }
        // 28 - 47 / step = 4 (19 - 23)
        else if (i <= 23) {
            top = 1;
            topTail = 'day';
            bottom = (i - 18) * 4;
            bottomTail = 'hours';
        }
        // 48
        else if (i <= 24) {
            top = 2;
            topTail = 'days';
        }
        // 49 - 6.5day / step = 12 (25 - 33)
        else if (i <= 33) {
            top = 2 + Math.floor((i - 24) / 2);
            topTail = 'days';
            bottom = ((i - 24) % 2) * 12;
            bottomTail = 'hours';
        }
        else {
            top = 7;
            topTail = 'days+'
        }

        setSliderVal({
            top: top, topTail: topTail,
            bottom: bottom, bottomTail: bottomTail
        });
    }

    useEffect(() => {
        getWeather();
        handleSliderValueChange(DEFAULT_SLIDER_VALUE);
    }, []);

    return (
        <View style={styles.container}>
            {weather !== null
                ?
                <>
                    <View style={styles.part}>
                        <Text>{weather.current_weather.temperature}</Text>
                    </View>

                    <View style={styles.part}>
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
                                paddingHorizontal: ((screenWidth.current / 2) - (styles.cell.width / 2))
                            }}
                            onMomentumScrollEnd={
                                // when scrolling stops, calculated which element will be displayed
                                (event) => setCurrentCell(Math.round(event.nativeEvent.contentOffset.x / styles.cell.width))
                            }
                        >
                            {
                                weather.hourly.time.map((_: any, i: number) => {
                                    return <WeatherCell
                                        key={`WeatherCell-${i}`}
                                        i={i}
                                        isCurrentCell={currentCell == i}
                                        dateToUserTZ={dateToUserTZ}
                                        time={weather.hourly.time[i]}
                                        temperature={weather.hourly.temperature_2m[i]}
                                        apparentTemperature={weather.hourly.apparent_temperature[i]}
                                        temperatureUnits={weather.hourly_units.temperature_2m}
                                        windspeedUnits={weather.hourly_units.windspeed_10m}
                                        cellWidth={styles.cell.width}
                                    />
                                })
                            }
                        </ScrollView>
                    </View>

                    <View style={styles.part}>
                        <Slider
                            style={[
                                styles.slider,
                                {width: screenWidth.current * 0.75}
                            ]}
                            minimumValue={1}
                            maximumValue={34}
                            step={1}
                            onValueChange={handleSliderValueChange}
                            value={DEFAULT_SLIDER_VALUE}
                        />
                        <Text>{sliderVal?.top ? `${sliderVal?.top} ${sliderVal?.topTail}` : ''}</Text>
                        <Text>{sliderVal?.bottom ? `${sliderVal?.bottom} ${sliderVal?.bottomTail}` : ''}</Text>

                        <Text>{currentCell}</Text>
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
    },
    part: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cell: {
        width: 100,
    },
    slider: {
        height: 40
    }
});

export default Weather;