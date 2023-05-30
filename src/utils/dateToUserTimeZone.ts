const dateToUserTimeZone = (dateString: string): Date => {
    const date = new Date(dateString);
    const timezoneOffset = -(date.getTimezoneOffset() * 60 * 1000);
    const newDate = new Date(date.getTime() + timezoneOffset);
    return newDate;
}

export default dateToUserTimeZone;