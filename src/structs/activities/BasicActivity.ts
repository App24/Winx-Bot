import { Activity } from "./Activity";

export class BasicActivity extends Activity {
    private activity: string;

    private args: any[];

    public constructor(activity: string, ...args) {
        super();
        this.activity = activity;
        this.args = args;
    }

    public getActivity(): string {
        return this.activity;
    }

    public getActivityArgs(): any[] | Promise<any[]> {
        return this.args;
    }
}