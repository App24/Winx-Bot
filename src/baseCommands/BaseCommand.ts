import { Guild, GuildMember, TextBasedChannel, User } from "discord.js";
import { CommandArguments } from "../structs/Command";
import { SlashCommandArguments } from "../structs/SlashCommand";
import { asyncForEach } from "../utils/Utils";
import { CommandAccess } from "../structs/CommandAccess";
import { PermissionData, PermissionResponse } from "../utils/PermissionUtils";
import { CommandAvailable } from "../structs/CommandAvailable";

export type BaseCommandType = CommandArguments | SlashCommandArguments;

export abstract class BaseCommand {
    protected subCommands: BaseSubBaseCommand[];
    public access: CommandAccess;
    public available: CommandAvailable;

    public constructor() {
        this.subCommands = [];
        this.access = CommandAccess.Everyone;
        this.available = CommandAvailable.Both;
    }

    public abstract onRun(cmdArgs: BaseCommandType);

    protected async onRunSubCommands(cmdArgs: BaseCommandType, subCommandName: string) {
        let found = false;
        await asyncForEach(this.subCommands, async (subCommand) => {
            if (subCommand.name.toLowerCase() === subCommandName.toLowerCase() || (subCommand.aliases && subCommand.aliases.includes(subCommandName.toLowerCase()))) {
                if (cmdArgs.args.length < subCommand.minArgs) {
                    cmdArgs.reply("error.arguments.few");
                } else if (cmdArgs.args.length > subCommand.maxArgs) {
                    cmdArgs.reply("error.arguments.many");
                } else {
                    await subCommand.onRun(cmdArgs);
                }
                found = true;
                return true;
            }
        });
        return found;
    }

    public async customPermissionCheck(permissionData: PermissionData): Promise<PermissionResponse> {
        return { hasPermission: false, reason: "" };
    }
}

export abstract class BaseSubBaseCommand extends BaseCommand {
    public name: string;
    public aliases: string[];
    public minArgs: number;
    public maxArgs: number;

    public constructor(name: string) {
        super();
        this.name = name;
        this.aliases = [];
        this.minArgs = 0;
        this.maxArgs = Number.MAX_SAFE_INTEGER;
    }
}