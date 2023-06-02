import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View, ScrollView, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fontisto, Octicons, Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import dateToUserTimeZone from '../../utils/dateToUserTimeZone';

const DEFAULT_SLIDER_VALUE = 3;

const InputOutputPanel = (props: { [name: string]: any }) => {
    const [sliderVal, setSliderVal] = useState<{ [name: string]: number | string }>();
    const [chosenPeriodHours, setChosenPeriodHours] = useState<number>();
    const [periodWarningMsg, setPeriodWarningMsg] = useState<string>('');
    const [info, setInfo] = useState<{[name: string]: Element[]}>();

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
            const weatherCodesDay = new Set<number>();
            const weatherCodesNight = new Set<number>();
            let minTempDay = Infinity;
            let minTempNight = Infinity;
            let maxTempDay = -Infinity;
            let maxTempNight = -Infinity;
            let maxWindDay = 0;
            let maxWindNight = 0;

            let nDayHours = 0;
            let nNightHours = 0;
            let sumTempDay = 0;
            let sumTempNight = 0;
            for (let i: number = iCell; i < (iCell + nHours); i++) {
                // iterate over all elements that are supposed to be counted

                const hour = dateToUserTimeZone(props.weather.hourly.time[i]).get('hour');
                
                if (8 < hour && hour <= 18) {
                    nDayHours++;
                    sumTempDay += props.weather.hourly.temperature_2m[i];
                    weatherCodesDay.add(props.weather.hourly.weathercode[i]);
                    minTempDay = Math.min(minTempDay, props.weather.hourly.temperature_2m[i]);
                    maxTempDay = Math.max(maxTempDay, props.weather.hourly.temperature_2m[i]);
                    maxWindDay = Math.max(maxWindDay, props.weather.hourly.windspeed_10m[i]);
                } else {
                    nNightHours++;
                    sumTempNight += props.weather.hourly.temperature_2m[i];
                    weatherCodesNight.add(props.weather.hourly.weathercode[i]);
                    minTempNight = Math.min(minTempNight, props.weather.hourly.temperature_2m[i]);
                    maxTempNight = Math.max(maxTempNight, props.weather.hourly.temperature_2m[i]);
                    maxWindNight = Math.max(maxWindNight, props.weather.hourly.windspeed_10m[i]);
                }
            }
            const avgTempDay = Math.floor((sumTempDay / nDayHours) * 10) / 10;
            const avgTempNight = Math.floor((sumTempNight / nNightHours) * 10) / 10;

            const hasDays = (weatherCodesDay.size > 0);
            const hasNights = (weatherCodesNight.size > 0);

            // basic
            const basicInfo: Element[] = [];
            if (hasDays) {
                basicInfo.push(<Text style={[styles.basicInfoTextTitle, { textAlign: 'center', alignItems: 'center' }]}>Day temperatures</Text>);
                basicInfo.push(
                <View style={styles.basicInfoRow}>
                    <Text style={[styles.basicInfoRowText]}>Min: {minTempDay}</Text>
                    <Text style={[styles.basicInfoRowText]}>Avg: {avgTempDay}</Text>
                    <Text style={[styles.basicInfoRowText]}>Max: {maxTempDay}</Text>
                </View>);
            }
            if (hasNights) {
                basicInfo.push(<Text style={[styles.basicInfoTextTitle, { textAlign: 'center', alignItems: 'center' }]}>Night temperatures</Text>);
                basicInfo.push(
                <View style={styles.basicInfoRow}>
                    <Text style={[styles.basicInfoRowText]}>Min: {minTempNight}</Text>
                    <Text style={[styles.basicInfoRowText]}>Avg: {avgTempNight}</Text>
                    <Text style={[styles.basicInfoRowText]}>Max: {maxTempNight}</Text>
                </View>);
            }

            // specific
            const specificInfo: Element[] = [];
            let icon: Element;

            // WEATHERCODES
            // thunderstorm
            icon = <Ionicons name="thunderstorm-outline" size={18} color="black" />;
            let inDays = weatherCodesDay.has(95);
            let inNights = weatherCodesNight.has(95);
            if (inDays || inNights) {
                const text = 'There might be a thunderstorm during your stay. Better stay inside.';
                specificInfo.push(<>{icon} {text}</>);
            }
            // rain shower
            icon = <Ionicons name="rainy-outline" size={18} color="black" />;
            inDays = weatherCodesDay.has(80);
            inNights = weatherCodesNight.has(80);
            if (inDays && inNights) {
                const text = 'There will be huge rains during days and nights. Make some indoor plans.';
                specificInfo.push(<>{icon} {text}</>);
            }
            else if (inDays) {
                const text = 'Huge rains during daytime. Make some indoor plans or bring a backup umbrella.';
                specificInfo.push(<>{icon} {text}</>);
            }
            else if (inNights) {
                const text = 'Huge rains during the nights.';
                specificInfo.push(<>{icon} {text}</>);
            }
            else {
                // normal rain
                inDays = weatherCodesDay.has(51);
                inNights = weatherCodesNight.has(51);
                if (inDays && inNights) {
                    const text = 'It will be raining during days and nights. Make sure to bring an umbrella.';
                    specificInfo.push(<>{icon} {text}</>);
                }
                else if (inDays) {
                    const text = 'The days might be rainy. An umbrella might come in handy.';
                    specificInfo.push(<>{icon} {text}</>);
                }
                else if (inNights) {
                    const text = 'Rainy nights. It means better sleep, so maybe just stay inside.';
                    specificInfo.push(<>{icon} {text}</>);
                }
            }
            // snow shower
            icon = <MaterialCommunityIcons name="weather-snowy-heavy" size={18} color="black" />
            inDays = weatherCodesDay.has(85);
            inNights = weatherCodesNight.has(85);
            if (inDays && inNights) {
                const text = 'Expect huge snowfall. It might cause traffic, try not to wander too far alone.';
                specificInfo.push(<>{icon} {text}</>);
            }
            else if (inDays) {
                const text = 'A lot of snowfall during the days. It might cause traffic, try not to wander too far alone!';
                specificInfo.push(<>{icon} {text}</>);
            }
            else if (inNights) {
                const text = `Huge snowfall during the nights! Don't wander on your own!`;
                specificInfo.push(<>{icon} {text}</>);
            }
            else {
                // snow
                inDays = weatherCodesDay.has(71);
                inNights = weatherCodesNight.has(71);
                if (inDays && inNights) {
                    const text = 'It will be snowing during days and nights. Hope you like winter sports!';
                    specificInfo.push(<>{icon} {text}</>);
                }
                else if (inDays) {
                    const text = 'It might be snowing during some of the days.';
                    specificInfo.push(<>{icon} {text}</>);
                }
                else if (inNights) {
                    const text = 'It might be snowing during the nights. Get ready for a white morning.';
                    specificInfo.push(<>{icon} {text}</>);
                }
            }
            // snow grains
            icon = <MaterialIcons name="grain" size={18} color="black" />
            inDays = weatherCodesDay.has(77);
            inNights = weatherCodesNight.has(77);
            if (inDays) {
                const text = 'There might be snow grain rains! Be careful and try to hide from it.';
                specificInfo.push(<>{icon} {text}</>);
            }
            else if (inNights) {
                const text = 'There might be snow grain rains during the nights. Better stay inside when it happens.';
                specificInfo.push(<>{icon} {text}</>);
            }
            // fog
            icon = <Fontisto name="fog" size={18} color="black" />
            if (hasDays && weatherCodesDay.has(45)) {
                const text = 'Some days might be foggy, be careful on the road!';
                specificInfo.push(<>{icon} {text}</>);
            }

            // TEMPERATURE - days and nights
            // cold
            icon = <Fontisto name="snowflake" size={18} color="black" />;
            if (hasDays) {
                let text = '';
                if (minTempDay < 5)
                    text = `Some of the days will be very cold. Make sure to bring warm clothes!`;
                else if (minTempDay < 15)
                    text = `You might need some warmer clothes for chilly days`;
                if (text)
                    specificInfo.push(<>{icon} {text} (min. {minTempDay}{props.weather.hourly_units.temperature_2m}).</>);
            }
            if (hasNights) {
                let text = '';
                if (minTempNight < 5)
                    text = `Some of the nights will be very cold. Make sure to bring warm clothes for night adventures!`;
                else if (minTempNight < 15)
                    text = `You might need some warmer clothes if you're planning to go outside during the nights`;
                if (text)
                    specificInfo.push(<>{icon} {text} (min. {minTempNight}{props.weather.hourly_units.temperature_2m}).</>);
            }
            // warm
            console.log()
            icon = <Octicons name="sun" size={18} color="black" />;
            if (hasDays) {
                let text = '';
                if (maxTempDay > 32)
                    text = `It will be extremely hot. Drink lots of water and apply lotion!`;
                else if (maxTempDay > 25)
                    text = `It should be pretty warm outside. Enjoy within reasons.`;
                if (text)
                    specificInfo.push(<>{icon} {text} (max. {maxTempDay}{props.weather.hourly_units.temperature_2m}).</>);
            }

            // WIND
            icon = <Feather name="wind" size={18} color="black" />;
            if (hasDays) {
                let text = '';
                if (maxWindDay >= 60)
                    text = `The wind during daytime might be very strong, be careful!`;
                else if (maxWindDay >= 30)
                    text = `There might be some windy days.`;
                if (text)
                    specificInfo.push(<>{icon} {text} (max. {maxWindDay}{props.weather.hourly_units.windspeed_10m}).</>);
            }
            if (hasNights) {
                let text = '';
                if (maxWindNight >= 60)
                    text = `Very strong wind during the nights, better stay inside!`;
                else if (maxWindNight >= 30)
                    text = `The nights might be windy.`;
                if (text)
                    specificInfo.push(<>{icon} {text} (max. {maxWindNight}{props.weather.hourly_units.windspeed_10m}).</>);
            }

            setInfo({
                basic: basicInfo,
                specific: specificInfo,
            });
        }
    }, [props.currentCell, chosenPeriodHours, props.weather]);

    return (
        <View style={styles.container}>
            <View style={styles.hr} />
            {/* custom interval slider with description */}
            <View style={[styles.part, styles.optionsView]}>
                <View style={styles.sliderTextAll}>
                    <Text style={styles.sliderTextEdge}></Text>
                    <Text style={styles.sliderTextCenter}>Adventure length:</Text>
                    <Text style={styles.sliderTextEdge}>{sliderVal?.top ? `${sliderVal?.top} ${sliderVal?.topTail}` : ''}</Text>
                </View>

                <View style={styles.sliderTextAll}>
                    <Text style={styles.sliderTextEdge}></Text>
                    <Text style={styles.sliderTextCenter}></Text>
                    <Text style={[styles.sliderTextEdge, styles.sliderTextEdgeSecondary]}>{sliderVal?.bottom ? `${sliderVal?.bottom} ${sliderVal?.bottomTail}` : ''}</Text>
                </View>

                <Slider
                    style={[styles.slider,
                        { width: props.screenWidth.current * 0.75 }]}
                    minimumValue={1} maximumValue={43} step={1} value={3}
                    onValueChange={handleSliderValue}
                    onSlidingComplete={(i: number) => handleSliderValue(i, true)}
                />
                {periodWarningMsg &&
                    <Text style={styles.warningMsg} numberOfLines={2}
                        onPress={() => setPeriodWarningMsg('')}
                    >{periodWarningMsg} TAP TO HIDE</Text>
                }
                
                {/* <Button title='Search'
                    onPress={() => console.log()}
                /> */}
            </View>
            
            <View style={styles.hr} />

            <ScrollView style={[styles.part, styles.scrollView]}
                    // showsVerticalScrollIndicator={false}
                >
                {/* map all info elements */}
                {info?.basic.map((element, i) => <View key={i}><>{element}</></View>)}
                {info?.specific.map((element, i) => <Text style={styles.specificInfoText} key={i}><>{element}</></Text>)}
                <View style={{height: 50}}/>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    hr: {
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    container: {
        flex: 1,
        alignSelf: 'stretch',
    },
    part: {
        padding: 15,
    },

    // options area
    optionsView: {
        alignItems: 'center',
        // backgroundColor: '#9c9a9a',
    },
    sliderTextAll: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sliderTextCenter: {
        flex: 1,
        textAlign: 'center',
    },
    sliderTextEdge: {
        flex: 1,
        textAlign: 'left',
    },
    sliderTextEdgeSecondary: {
        fontSize: 11,
    },
    slider: {
    },
    warningMsg: {
        overflow: 'hidden',
        color: '#d40f0f',
        textAlign: 'center',
        fontSize: 11,
    },

    // main area
    // mainView: {
    //     overflow: 'scroll',
    // },
    scrollView: {
        alignSelf: 'stretch',
        overflow: 'scroll',
    },
    basicInfoTextTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    basicInfoRow: {
        flexDirection: 'row',
        marginBottom: 25,
    },
    basicInfoRowText: {
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
    },
    specificInfoText: {
        fontSize: 16,
        marginVertical: 4,
    },
});

export default InputOutputPanel;

