import { EventActivity } from "../EventActivity";

export class ChristmasActivity extends EventActivity{
    public constructor(){
        super(new Date(2, 11, 25), new Date(2,11,26));
    }

    public getActivity(): string | Promise<string> {
        return "Merry Holidays/Christmas 🎁";
    }

}