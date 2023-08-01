import { ActivityType } from "discord.js";

export abstract class Activity {
    public type: Exclude<ActivityType, ActivityType.Custom> = ActivityType.Playing;

    public translated = false;

    public abstract getActivity(): string | Promise<string>;
    public getActivityArgs(): any[] | Promise<any[]> {
        return [""];
    }

    public isShowable(): boolean {
        return true;
    }
}