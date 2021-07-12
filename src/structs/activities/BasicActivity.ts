import { Activity } from "./Activity";

export class BasicActivity extends Activity{
    private activity : string;

    public constructor(activity : string){
        super();
        this.activity=activity;
    }

    public getActivity() : string{
        return this.activity;
    }
}