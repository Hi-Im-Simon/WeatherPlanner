import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View, ImageBackground } from 'react-native';
import { DateTime } from 'luxon';

import dateToUserTimeZone from '../../utils/dateToUserTimeZone';

const CurrentWeatherPanel = (props: { [name: string]: any }) => {
    const images = useRef(require.context('../../assets', true));
    const [dayId, setDayId] = useState<number>(0);

    const getImagePath = () => {
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

    const getTimeFromNow = () => {
        const thisDate = dateToUserTimeZone(props.weather.hourly.time[props.i]);
        const currentDate = DateTime.local();
        const currentDateString = `${currentDate.toFormat('yyyy-MM-dd')}T${currentDate.toFormat('hh:mm') }`;
        const currentDateFixed = dateToUserTimeZone(currentDateString, false)
        let daysFromNow = thisDate.diff(currentDateFixed, ['days']).as('days');
        let hoursFromNow = thisDate.diff(currentDateFixed, ['hours']).as('hours');
        let minutesFromNow = thisDate.diff(currentDateFixed, ['minutes']).as('minutes');

        let dd = '';
        let hh = '';
        let mm = '';
        let prefix = '';
        let suffix = '';

        // set prefix and suffix or current - based on difference between chosen and current time
        if (hoursFromNow < -1) suffix = 'ago';
        else if (hoursFromNow > 0) prefix = 'in ';
        else return 'Live data'

        // fix hours and minutes to display correctly if < 0
        // > this is because we want to show the difference
        // > between now and THE END of the chosen hour if it already happened
        // > otherwise it would look weird if an hour has just passed a few seconds ago
        // > and timer shows "1h 1m ago"
        if (hoursFromNow < 0) {
            hoursFromNow += 1;
        }

        // pre/affixes saved, switch to absolute value
        daysFromNow = Math.abs(daysFromNow);
        hoursFromNow = Math.abs(hoursFromNow);
        minutesFromNow = Math.abs(minutesFromNow);

        // get days from now
        if (daysFromNow > 1) dd = `${Math.floor(daysFromNow)}d `;

        // get hours from now
        hoursFromNow %= 24;
        if (hoursFromNow >= 1) hh = `${Math.floor(hoursFromNow)}h `;

        // get minutes from now
        // if time from now is longer than 1 day, skip minutes
        if (daysFromNow < 1) {
            minutesFromNow %= 60;
            if (minutesFromNow >= 1) mm = `${Math.floor(minutesFromNow)}m `;
        }

        return `${prefix}${dd}${hh}${mm}${suffix}`.trim();
    }

    useEffect(() => {
        setDayId(Math.floor(props.i / 24));
    })

    return (
        <>
            {
                <ImageBackground
                    style={styles.background}
                    source={getImagePath()}
                >
                <View style={styles.container}>
                    <View style={styles.containerLeft}>
                        {/* display currently selected weather data */}
                        <View style={styles.dataPairs}>
                            {/* apparent_temperature */}
                            <Text style={[styles.dataLeftText, styles.text]}>Feels like</Text>
                            <Text style={[styles.dataRightText, styles.text]}>
                                {props.weather.hourly.apparent_temperature[props.i]}
                                {props.weather.hourly_units.apparent_temperature}
                            </Text>
                        </View>
                        <View style={styles.dataPairs}>
                            {/* temperature_2m */}
                            <Text style={[styles.dataLeftText, styles.text]}>Actual</Text>
                            <Text style={[styles.dataRightText, styles.text]}>
                                {props.weather.hourly.temperature_2m[props.i]}
                                {props.weather.hourly_units.temperature_2m}
                            </Text>
                        </View>
                        <View style={styles.dataPairs}>
                            {/* windspeed_10m */}
                            <Text style={[styles.dataLeftText, styles.text]}>Wind</Text>
                            <Text style={[styles.dataRightText, styles.text]}>
                                {props.weather.hourly.windspeed_10m[props.i]}
                                {props.weather.hourly_units.windspeed_10m}
                            </Text>
                        </View>
                        <View style={styles.dataPairs}>
                            {/* precipitation_probability */}
                            <Text style={[styles.dataLeftText, styles.text]}>Precipitation</Text>
                            <Text style={[styles.dataRightText, styles.text]}>
                                {props.weather.hourly.precipitation_probability[props.i]}
                                {props.weather.hourly_units.precipitation_probability}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.containerCenter}>
                        {/* display currently selected date */}
                        <Text style={[styles.text, styles.dayNameText]}>
                            {dateToUserTimeZone(props.weather.hourly.time[props.i]).toFormat('EEEE')}
                        </Text>
                        <Text style={[styles.text, styles.hourText]}>
                            {dateToUserTimeZone(props.weather.hourly.time[props.i]).toFormat('hh:mm a')}
                        </Text>
                        <Text style={[styles.text, styles.dateText]}>
                            {dateToUserTimeZone(props.weather.hourly.time[props.i]).toFormat('dd MMM yyyy')}
                        </Text>
                    </View>

                    <View style={styles.containerRight}>
                        {/* display time difference from now */}
                        <View style={styles.dataPairs}>
                            <Text style={[styles.dataLeftText, styles.text]}>Due</Text>
                            <Text style={[styles.dataRightText, styles.text]}>
                                {getTimeFromNow()}
                            </Text>
                        </View>

                        {/* space filler */}
                        {/* <View style={styles.dataPairs}></View> */}

                        {/* display currently selected weather sunset, sunrise... */}
                        <View style={styles.dataPairs}>
                            {/* sunrise */}
                            <Text style={[styles.dataLeftText, styles.text]}>Sunrise</Text>
                            <Text style={[styles.dataRightText, styles.text]}>
                                    {dateToUserTimeZone(props.weather.daily.sunrise[dayId]).toFormat('hh:mm a')}
                            </Text>
                        </View>
                        <View style={styles.dataPairs}>
                            {/* sunset */}
                            <Text style={[styles.dataLeftText, styles.text]}>Sunset</Text>
                            <Text style={[styles.dataRightText, styles.text]}>
                                    {dateToUserTimeZone(props.weather.daily.sunset[dayId]).toFormat('hh:mm a')}
                            </Text>
                        </View>
                    </View>
                </View>
                </ImageBackground>
            }
        </>
    );
};

const styles = StyleSheet.create({
    // basic tags
    background: {
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    text: {
        alignSelf: 'stretch',
        textShadowRadius: 15,
        textShadowColor: '#000',
        color: '#fff',
    },

    // data pairs
    dataPairs: {
        flex: 1,
        justifyContent: 'center',
    },
    dataLeftText: {
        fontStyle: 'italic',
        textAlign: 'center',
    },
    dataRightText: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },

    // left side
    containerLeft: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 15,
    },
    

    // center
    containerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNameText: {
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
    },
    hourText: {
        fontSize: 16,
        textAlign: 'center',
    },
    dateText: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },

    // right side
    containerRight: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 15,
    },
});

export default CurrentWeatherPanel;

