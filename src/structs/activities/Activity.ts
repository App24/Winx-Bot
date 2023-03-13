import { ActivityType } from "discord.js";

export abstract class Activity {
    public type: Exclude<ActivityType, ActivityType.Custom> = ActivityType.Playing;

    public abstract getActivity(): string | Promise<string>;

    public isShowable(): boolean {
        return true;
    }
}