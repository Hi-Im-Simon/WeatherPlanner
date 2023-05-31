import { DateTime } from 'luxon';

const dateToUserTimeZone = (dateString: string, addZone: boolean = true): DateTime => {
    let tzOffsetString = '';
    if (addZone) {
        const tzOff = (new Date()).getTimezoneOffset() / 60;
        tzOffsetString = `${tzOff < 0 ? '-' : '+'}${Math.abs(tzOff) < 10 ? '0' : ''}${Math.abs(tzOff)}:00`;
    }
    
    const convertedDate = DateTime.fromISO(`${dateString}${tzOffsetString}`, { zone: 'GMT' });
    return convertedDate;
}

export default dateToUserTimeZone;