import { ActivityType } from "discord.js";

export abstract class Activity {
    public type : ActivityType="PLAYING";

    public abstract getActivity() : string | Promise<string>;

    public isShowable() : boolean{
        return true;
    }
}