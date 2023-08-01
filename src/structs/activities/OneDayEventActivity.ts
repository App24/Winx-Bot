import { EventActivity } from "./EventActivity";

export abstract class OneDayEventActivity extends EventActivity {
    public constructor(date: Date) {
        super(date, nextDay(date));
    }
}

function nextDay(date: Date) {
    const newDate = new Date(date.getTime());
    newDate.setHours(24);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
}