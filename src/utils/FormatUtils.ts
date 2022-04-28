/**
 * 
 * @param time Time in seconds
 * @returns stringified time
 */
export function secondsToTime(time: number) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time % 3600 / 60);
    const seconds = Math.floor(time % 3600 % 60);

    const times = [];
    if (hours > 0) times.push(hours.toFixed(0) + " hour(s)");
    if (minutes > 0) times.push(minutes.toFixed(0) + " minute(s)");
    if (seconds > 0 || !times.length) times.push(seconds.toFixed(0) + " second(s)");

    return times.join(" and ");
}

/**
 * 
 * @param s String to capitalise
 * @returns Capitalised string
 */
export function capitalise(s: string) {
    const splitStr = s.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

export function dateToString(date: Date, format: string) {
    function pad(num: number, size: number) {
        let numStr = num.toString();
        while (numStr.length < size) numStr = "0" + numStr;
        return numStr;
    }

    return format.replace(/{\w+}/g, (match) => {
        match = match.replace(/({|})/g, "");
        switch (match) {
            case "dd":
                return pad(date.getDate(), 2);
            case "MM":
                return pad(date.getMonth() + 1, 2);
            case "YYYY":
                return date.getFullYear().toString();
            case "HH":
                return pad(date.getHours(), 2);
            case "mm":
                return pad(date.getMinutes(), 2);
            case "ss":
                return pad(date.getSeconds(), 2);
        }
        return match;
    });
}

export function formatString(str: string, ...args) {
    return str.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}