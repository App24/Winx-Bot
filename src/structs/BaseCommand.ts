import { BitFieldResolvable, PermissionFlagsBits } from "discord.js";
import { CommandArgumentsType } from "./CommandTypes";
import { Localisation } from "../localisation";

declare const CommandAvailableFlagsBits: {
    readonly GUILD: bigint,
    readonly DM: bigint,
};

declare const CommandPermissionFlagsBit :{
    "BotOwner",
    "GuildOwner",
    "Patron",
    "Booster",
    "WeeklyTopChatter",
    "Custom"
};

export type CommandAvailableResolvable = BitFieldResolvable<keyof typeof CommandAvailableFlagsBits, bigint>;
export type CommandPermissionResolvable = BitFieldResolvable<keyof typeof PermissionFlagsBits | keyof typeof CommandPermissionFlagsBit, bigint>;

export abstract class BaseCommand {
    public available: CommandAvailableResolvable;
    public perms : CommandPermissionResolvable;

    public description: string;

    public constructor(description?: string) {
        this.available = ["DM", "GUILD"];
        this.perms = "SendMessages";
        this.description = description;
    }

    public abstract onRun(cmdArgs: CommandArgumentsType);

    public get localisedDescription(){
        return Localisation.getLocalisation({key: this.description});
    }
}