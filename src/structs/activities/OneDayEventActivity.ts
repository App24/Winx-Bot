import { EventActivity } from "./EventActivity";

export abstract class OneDayEventActivity extends EventActivity{
    public constructor(date:Date){
        super(date, nextDay(date))
    }
}

function nextDay(date:Date){
    date.setHours(24);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}