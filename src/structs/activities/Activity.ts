import { ActivityTypes } from "discord.js/typings/enums";

type ExcludeEnum<T, K extends keyof T> = Exclude<keyof T | T[keyof T], K | T[K]>;

export abstract class Activity {
    public type : ExcludeEnum<typeof ActivityTypes, 'CUSTOM'>="PLAYING";

    public abstract getActivity() : string | Promise<string>;

    public isShowable() : boolean{
        return true;
    }
}