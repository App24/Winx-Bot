import { BitFieldResolvable, PermissionFlagsBits } from "discord.js";
import { CommandArgumentsType } from "./CommandTypes";

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

    public constructor() {
        this.available = ["DM", "GUILD"];
        this.perms = "SendMessages";
    }

    public abstract onRun(cmdArgs: CommandArgumentsType);
}