import { OneDayEventActivity } from "./OneDayEventActivity";

export class GenericOneDayEventActivity extends OneDayEventActivity {
    private activity: string;

    public constructor(date: Date, activity: string) {
        super(date);
        this.activity = activity;
    }

    public getActivity(): string | Promise<string> {
        return this.activity;
    }
}