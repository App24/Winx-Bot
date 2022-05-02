import { EventActivity } from "./EventActivity";

export class GenericEventActivity extends EventActivity {
    private activity: string;

    public constructor(startTime: Date, endTime: Date, activity: string) {
        super(startTime, endTime);
        this.activity = activity;
    }

    public getActivity() {
        return this.activity;
    }

}