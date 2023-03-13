import { DMChannel, Guild, GuildMember, Message, MessageComponentInteraction, MessageOptions, ReplyMessageOptions, TextBasedChannel, User } from "discord.js";
import { BaseCommand } from "../baseCommands/BaseCommand";
import { Localisation } from "../localisation";
import { asyncForEach, isDM } from "../utils/Utils";
import { BotSettings } from "./BotSettings";
import { Category, Other } from "./Category";
import { CommandAccess } from "./CommandAccess";
import { CommandAvailable } from "./CommandAvailable";
import { SubCommand } from "./SubCommand";

export abstract class Command {
    // public enabled: boolean;
    public deprecated: boolean;

    public category: Category;

    public description: string;
    public usage: CommandUsage[];

    public available: CommandAvailable;
    public access: CommandAccess;

    public aliases: string[];

    public cooldown: number;

    public guildIds: string[];

    //public subCommands: SubCommand[];

    public baseCommand: BaseCommand;

    public commandName: string;

    public constructor(description?: string) {
        this.description = description;
        // this.enabled = true;
        this.category = Other;
        this.available = CommandAvailable.Both;
        //this.subCommands = [];
    }

    public get enabled() {
        const command = BotSettings.getSettings().commands.find(c => c.name === this.commandName) ?? { "enabled": true };
        return command.enabled;
    }

    /*protected async onRunSubCommands(cmdArgs: CommandArguments, subCommandName: string, showError = true) {
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
    }*/

    public async onRun(cmdArgs: CommandArguments) {
        if (this.baseCommand) {
            await this.baseCommand.onRun(cmdArgs);
        }
    }

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

    get minArgs() {
        let amount = 0;
        if (this.usage && this.usage.length > 0) {
            for (let i = 0; i < this.usage.length; i++) {
                const use = this.usage[i];
                if (use.required) {
                    amount++;
                } else {
                    break;
                }
            }
        }
        return amount;
    }
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

    public get body() {
        return this.message;
    }

    public async reply(options: string | ReplyMessageOptions, ...args) {
        if (typeof options === "string") {
            options = { content: Localisation.getTranslation(options, ...args) };
        } else {
            if (options.content)
                options.content = Localisation.getTranslation(options.content, ...args);
        }
        options.failIfNotExists = false;
        return this.message.reply(options);
    }

    public async dmReply(options: string | MessageOptions, ...args) {
        if (typeof options === "string") {
            options = Localisation.getTranslation(options, ...args);
        } else {
            if (options.content)
                options.content = Localisation.getTranslation(options.content, ...args);
        }
        let sendTarget: DMChannel | TextBasedChannel = await this.author.createDM();
        if (!sendTarget || isDM(this.channel)) {
            sendTarget = this.channel;
        } else {
            await this.reply("Please check your DM");
            // await interaction.deferUpdate();
        }
        return sendTarget.send(options);
    }
}