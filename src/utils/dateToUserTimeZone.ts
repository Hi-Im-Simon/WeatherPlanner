import { DateTime } from 'luxon';

const dateToUserTimeZone = (dateString: string): DateTime => {
    const tzOff = (new Date()).getTimezoneOffset() / 60;
    const tzOffsetString = `${tzOff < 0 ? '-' : '+'}${Math.abs(tzOff) < 10 ? '0' : ''}${Math.abs(tzOff)}:00`;
    const convertedDate = DateTime.fromISO(`${dateString}${tzOffsetString}`, { zone: 'GMT' });
    return convertedDate;
}

export default dateToUserTimeZone;