import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View, ScrollView, Button } from 'react-native';
import Slider from '@react-native-community/slider';

import Map from './Map';

import dateToUserTimeZone from '../../utils/dateToUserTimeZone';

const DEFAULT_SLIDER_VALUE = 3;

const InputOutputPanel = (props: { [name: string]: any }) => {
    const [sliderVal, setSliderVal] = useState<{ [name: string]: number | string }>();
    const [chosenPeriodHours, setChosenPeriodHours] = useState <number>();
    const [periodWarningMsg, setPeriodWarningMsg] = useState <string>();

    const handleSliderValue = (i: number, set: boolean = false) => {
        let top = 0;
        let topTail = '';
        let bottom = 0;
        let bottomTail = '';
        // 1
        if (i == 1) {
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
        else if (i <= 42) {
            top = (i - 33) + 6;
            topTail = 'days'
        }
        else {
            top = 16;
            topTail = 'days+';
        }

        setSliderVal({
            top: top, topTail: topTail,
            bottom: bottom, bottomTail: bottomTail
        });

        if (set) {
            let days = 0;
            let hours = 0;

            if (i <= 17) {
                hours = top;
            }
            else {
                days = top;
                hours = bottom;
            }

            setChosenPeriodHours((days * 24) + hours);
        }
    };

    useEffect(() => {
        handleSliderValue(DEFAULT_SLIDER_VALUE, true);
    }, []);

    useEffect(() => {
        // if current cell or chosen period was changed, generate new data
        if (chosenPeriodHours !== undefined && props.currentCell !== undefined) {
            const iCell = props.currentCell;
            const nCells = props.weather.hourly.weathercode.length;
            let nHours = chosenPeriodHours;
            
            // check if chosen period doesn't exceed maximum
            // if so, adjust it and show a warning
            if ((iCell + nHours) > nCells) {
                nHours = nCells - iCell;
                const days = Math.floor(nHours / 24);
                const hours = nHours % 24;
                
                setPeriodWarningMsg(
                    // `Selected period is too long. Using max -${days ? ` ${days}d` : ''}${hours ? ` ${hours}h` : ''}`
                    `Warning: Selected period exceeds available forecast.\nUsing max available (${
                        days ? `${days}d` : ''
                    }${
                        (days && hours) ? ' ' : ''
                    }${
                        hours ? `${hours}h` : ''
                    }) instead.`
                ); 
            } else {
                setPeriodWarningMsg('');
            }

            // gather data about the time period
            const weatherCodesDay = new Set();
            const weatherCodesNight = new Set();
            let minTempDay = Infinity;
            let minTempNight = Infinity;
            let maxTempDay = -Infinity;
            let maxTempNight = -Infinity;
            let maxWindDay = 0;
            let maxWindNight = 0;

            for (let i: number = iCell; i < (iCell + nHours); i++) {
                // iterate over all elements that are supposed to be counted

                const hour = dateToUserTimeZone(props.weather.hourly.time[i]).get('hour');
                
                if (6 < hour && hour <= 18) {
                    weatherCodesDay.add(props.weather.hourly.weathercode[i]);
                    minTempDay = Math.min(minTempDay, props.weather.hourly.temperature_2m[i]);
                    maxTempDay = Math.max(maxTempDay, props.weather.hourly.temperature_2m[i]);
                    maxWindDay = Math.max(maxWindDay, props.weather.hourly.windspeed_10m[i]);
                } else {
                    weatherCodesNight.add(props.weather.hourly.weathercode[i]);
                    minTempNight = Math.min(minTempNight, props.weather.hourly.temperature_2m[i]);
                    maxTempNight = Math.max(maxTempNight, props.weather.hourly.temperature_2m[i]);
                    maxWindNight = Math.max(maxWindNight, props.weather.hourly.windspeed_10m[i]);
                }
            }

            const hasDays = (weatherCodesDay.size > 0);
            const hasNights = (weatherCodesNight.size > 0);

            // console.log(weatherCodesDay)
            // console.log(weatherCodesNight)
            // console.log(minTempDay)
            // console.log(minTempNight)
            // console.log(maxTempDay)
            // console.log(maxTempNight)
            // console.log(maxWindDay)
            // console.log(maxWindNight)
        }
    }, [chosenPeriodHours, props.currentCell]);

    return (
        <View style={styles.container}>
            {/* custom interval slider with description */}
            <View style={[styles.part, styles.optionsView]}>
                <Text>{sliderVal?.bottom ? `${sliderVal?.bottom} ${sliderVal?.bottomTail}` : ''}</Text>
                <Text>{sliderVal?.top ? `${sliderVal?.top} ${sliderVal?.topTail}` : ''}</Text>
                <Slider
                    style={[styles.slider,
                        { width: props.screenWidth.current * 0.75 }]}
                    minimumValue={1} maximumValue={43} step={1} value={3}
                    onValueChange={handleSliderValue}
                    onSlidingComplete={(i: number) => handleSliderValue(i, true)}
                />
                <Text style={styles.warningMsg} numberOfLines={2}
                    onPress={() => setPeriodWarningMsg('')}
                >
                    {periodWarningMsg}{periodWarningMsg ? ' TAP TO HIDE' : ''}
                </Text>
                {/* <Button title='Search'
                    onPress={}
                /> */}
            </View>
            <View style={[styles.part, styles.mainView]}>
                <ScrollView style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    <Text>{props.currentCell}</Text>
                    <Text>{props.currentCell}</Text>
                    <Text>{props.currentCell}</Text>
                    <Text>{props.currentCell}</Text>
                    <Text>{props.currentCell}</Text>
                    <Text>{props.currentCell}</Text>
                    <Text>{props.currentCell}</Text>
                    <Text>{props.currentCell}</Text>
                    <Text>{props.currentCell}</Text>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
    },
    part: {
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // options area
    optionsView: {
        flex: 1,
    },
    slider: {

    },
    warningMsg: {
        flex: 1,
        overflow: 'hidden',
        color: '#d40f0f',
        textAlign: 'center',
        fontSize: 11,
    },

    // main area
    mainView: {
        flex: 3,
    },
    scrollView: {
        flex: 1,
        alignSelf: 'stretch',
    }
});

export default InputOutputPanel;

