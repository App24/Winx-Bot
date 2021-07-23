import { ActivityType } from "discord.js";

export abstract class Activity {
    public type : ActivityType="PLAYING";

    public abstract getActivity() : string | Promise<string>;

    public canRun() : boolean{
        return true;
    }
}