import { capitalise } from "../../../Utils";
import { EventActivity } from "../EventActivity"

export class BirthdayActivity extends EventActivity{
    public name : string;

    public constructor(startTime:Date, endTime:Date, name : string){
        super(startTime, endTime);
        this.name=name;
    }

    public getActivity(): string | Promise<string> {
        return `Happy Birthday ${capitalise(this.name)} 🥳🎉`;
    }
}