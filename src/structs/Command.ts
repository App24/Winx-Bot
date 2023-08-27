import { BaseMessageOptions, DMChannel, Guild, GuildMember, Message, MessageReplyOptions, TextBasedChannel, User } from "discord.js";
import { BaseCommand } from "../baseCommands/BaseCommand";
import { Localisation } from "../localisation";
import { isDM } from "../utils/Utils";
import { BotSettings } from "./BotSettings";
import { Category, Other } from "./Category";
import { CommandAccess } from "./CommandAccess";
import { CommandAvailable } from "./CommandAvailable";

export abstract class Command {
    public deprecated: boolean;

    public category: Category;

    public description: string;
    public usage: CommandUsage[];

    public available: CommandAvailable;
    public access: CommandAccess;

    public aliases: string[];

    public cooldown: number;

    public guildIds: string[];

    public baseCommand: BaseCommand;

    public commandName: string;

    public constructor(description?: string) {
        this.description = description;
        this.category = Other;
        this.available = CommandAvailable.Both;
    }

    public get enabled() {
        const command = BotSettings.getSettings().commands.find(c => c.name === this.commandName) ?? { "enabled": true };
        return command.enabled;
    }

    public async onRun(cmdArgs: CommandArguments) {
        if (this.baseCommand) {
            await this.baseCommand.onRun(cmdArgs);
        }
    }

    public getUsage() {
        let text = "";
        if (this.usage) {
            this.usage.forEach((use, index) => {
                const temp = use.usages.map((value) => Localisation.getLocalisation(value)).join("/");
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

    public async reply(options: string | MessageReplyOptions, ...args) {
        if (typeof options === "string") {
            options = { content: Localisation.getLocalisation(options, ...args) };
        } else {
            if (options.content)
                options.content = Localisation.getLocalisation(options.content, ...args);
        }
        options.failIfNotExists = false;
        return this.message.reply(options);
    }

    public async localisedReply(options: string | MessageReplyOptions) {
        if (typeof options === "string") {
            options = { content: options };
        }
        options.failIfNotExists = false;
        return this.message.reply(options);
    }

    public async dmReply(options: string | BaseMessageOptions, ...args) {
        if (typeof options === "string") {
            options = Localisation.getLocalisation(options, ...args);
        } else {
            if (options.content)
                options.content = Localisation.getLocalisation(options.content, ...args);
        }
        let sendTarget: DMChannel | TextBasedChannel = await this.author.createDM().catch(() => undefined);
        if (!sendTarget || isDM(this.channel)) {
            sendTarget = this.channel;
        } else {
            await this.reply("Please check your DM");
        }
        return sendTarget.send(options);
    }
}