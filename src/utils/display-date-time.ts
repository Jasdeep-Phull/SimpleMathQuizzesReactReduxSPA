/**
 * Displays a date string in the format: "dd/MM/yyyy, hh:mm:ss" (e.g. "27/03/2024 14:53:46")
 * @param dateTime the date and time string to format
 * @returns A date string in the format: "dd/MM/yyyy, hh:mm:ss" (e.g. "27/03/2024 14:53:46")
 */
export function displayDateTime(dateTime: string): string {
    let dateTimeObj = new Date(dateTime);
    return `${dateTimeObj.toLocaleDateString()} ${dateTimeObj.toLocaleTimeString()}`;
}


/**
 * alternate return value: `${new Date(dateTime).toLocaleDateString()} ${new Date(dateTime).toLocaleTimeString()}`;
 * returns: "27/03/2024 14:53:46" (same as current implementation)
 * i think the current approach is more efficient than this, but i could be wrong
 */

/**
 * aleternate return value: dateTimeObj.toLocaleString();
 * returns: "27/03/2024, 14:53:46"
 * i think the date and time looks better without the comma, especially when used in the QuizInfo component
 */

/**
 * alternate return value: new Date(dateTime).toUTCString();
 * returns: "Wed, 27 Mar 2024 14:53:46 GMT"
 */
