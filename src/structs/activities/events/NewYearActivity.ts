import { EventActivity } from "../EventActivity";

export class NewYearActivity extends EventActivity{
    public constructor(){
        super(new Date(2, 11, 31), new Date(2,0,1));
    }

    public getActivity(): string | Promise<string> {
        return "Happy New Year 🎉🎉";
    }

}