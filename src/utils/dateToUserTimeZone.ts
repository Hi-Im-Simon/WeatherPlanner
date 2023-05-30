import { DateTime } from 'luxon';

const dateToUserTimeZone = (dateString: string): DateTime => {
    const convertedDate = DateTime.fromISO(`${dateString}`, { zone: 'GMT' });
    return convertedDate;
}

export default dateToUserTimeZone;