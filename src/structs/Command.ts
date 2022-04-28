import { Guild, GuildMember, Message, TextBasedChannel, User } from "discord.js";
import { Localisation } from "../localisation";
import { asyncForEach } from "../utils/Utils";
import { Category, Other } from "./Category";
import { SubCommand } from "./SubCommand";

export abstract class Command {
    public enabled: boolean;
    public deprecated: boolean;

    public category: Category;

    public description: string;
    public usage: CommandUsage[];

    public available: CommandAvailable;
    public access: CommandAccess;

    public aliases: string[];

    public minArgs: number;

    public cooldown: number;

    public guildIds: string[];

    public subCommands: SubCommand[];

    public constructor(description?: string) {
        this.description = description;
        this.enabled = true;
        this.category = Other;
        this.available = CommandAvailable.Both;
        this.minArgs = 0;
        this.subCommands = [];
    }

    protected async onRunSubCommands(cmdArgs: CommandArguments, subCommandName: string, showError = true) {
        let found = false;
        await asyncForEach(this.subCommands, async (subCommand: SubCommand) => {
            if (subCommand.name.toLowerCase() === subCommandName.toLowerCase() || (subCommand.aliases && subCommand.aliases.includes(subCommandName.toLowerCase()))) {
                if (cmdArgs.args.length < subCommand.minArgs) {
                    cmdArgs.message.reply(Localisation.getTranslation("error.arguments.few"));
                } else if (cmdArgs.args.length > subCommand.maxArgs) {
                    cmdArgs.message.reply(Localisation.getTranslation("error.arguments.many"));
                } else {
                    await subCommand.onRun(cmdArgs);
                }
                found = true;
                return true;
            }
        });
        if (showError && !found) {
            let reply = Localisation.getTranslation("error.invalid.option");
            if (this.usage) {
                reply += `\n${Localisation.getTranslation("subCommand.usage", this.getUsage())}`;
            }
            cmdArgs.message.reply(reply);
        }
        return found;
    }

    public abstract onRun(cmdArgs: CommandArguments);

    public getUsage() {
        let text = "";
        if (this.usage) {
            this.usage.forEach((use, index) => {
                const temp = use.usages.map((value) => Localisation.getTranslation(value)).join("/");
                if (use.required)
                    text += `<${temp}>`;
                else
                    text += `[${temp}]`;
                if (index < this.usage.length - 1)
                    text += " ";
            });
        }
        return text;
    }
}

export enum CommandAvailable {
    DM,
    Guild,
    Both
}

export enum CommandAccess {
    None = 1,
    Patreon,
    Moderators,
    GuildOwner,
    BotOwner
}

export class CommandUsage {
    public required: boolean;
    public usages: string[];

    public constructor(required: boolean, ...usages: string[]) {
        this.required = required;
        this.usages = usages;
    }
}

export class CommandArguments {
    public readonly message: Message;
    public readonly args: string[];
    public readonly guild: Guild;
    public readonly guildId: string;
    public readonly channel: TextBasedChannel;
    public readonly channelId: string;
    public readonly author: User;
    public readonly member: GuildMember;

    public constructor(message: Message, args: string[]) {
        this.message = message;
        this.guild = message.guild;
        this.guildId = message.guildId;
        this.channel = message.channel;
        this.channelId = message.channelId;
        this.args = args;
        this.author = message.author;
        this.member = message.member;
    }
}