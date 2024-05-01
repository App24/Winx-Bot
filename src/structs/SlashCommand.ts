import { ApplicationCommandData, Guild, TextBasedChannel, User, GuildMember, CommandInteraction, InteractionReplyOptions, DMChannel, BaseMessageOptions } from "discord.js";
import { CommandAvailable } from "./CommandAvailable";
import { Localisation } from "../localisation";
import { BaseCommand } from "../baseCommands/BaseCommand";
import { CommandAccess } from "./CommandAccess";

export abstract class SlashCommand {
    public commandData: Partial<ApplicationCommandData>;
    public deferEphemeral: boolean;

    public guildIds: string[];

    public baseCommand: BaseCommand;

    public cooldown: number;

    public constructor(commandData: Partial<ApplicationCommandData>) {
        this.commandData = commandData;
        this.deferEphemeral = false;
        this.guildIds = [];
        this.cooldown = 3;
    }

    public async onRun(cmdArgs: SlashCommandArguments) {
        if (this.baseCommand) {
            await this.baseCommand.onRun(cmdArgs);
        }
    }

    public get access() {
        if (!this.baseCommand) return CommandAccess.Everyone;
        return this.baseCommand.access;
    }

    public get available() {
        if (!this.baseCommand) return CommandAvailable.Both;
        return this.baseCommand.available;
    }
}

export class SlashCommandArguments {
    public readonly interaction: CommandInteraction;
    public readonly args: string[];
    public readonly guild: Guild;
    public readonly guildId: string;
    public readonly channel: TextBasedChannel;
    public readonly channelId: string;
    public readonly author: User;
    public readonly member: GuildMember;

    public constructor(interaction: CommandInteraction, args: string[]) {
        this.args = args;
        this.interaction = interaction;
        this.guild = interaction.guild;
        this.guildId = interaction.guildId;
        this.channel = interaction.channel;
        this.channelId = interaction.channelId;
        this.author = interaction.user;
        this.member = <GuildMember>interaction.member;
    }

    public get body() {
        return this.interaction;
    }

    public async reply(options: string | InteractionReplyOptions, ...args) {
        if (typeof options === "string")
            options = Localisation.getLocalisation(options, ...args);
        else {
            if (options.content) {
                options.content = Localisation.getLocalisation(options.content, ...args);
            }
        }
        if (this.interaction.deferred || this.interaction.replied) {
            await this.interaction.followUp(options);
        } else {
            await this.interaction.reply(options);
        }
    }

    public async localisedReply(options: string | InteractionReplyOptions) {
        if (this.interaction.deferred || this.interaction.replied) {
            await this.interaction.followUp(options);
        } else {
            await this.interaction.reply(options);
        }
    }

    public async dmReply(options: string | BaseMessageOptions, ...args) {
        if (typeof options === "string") {
            options = Localisation.getLocalisation(options, ...args);
        } else {
            if (options.content)
                options.content = Localisation.getLocalisation(options.content, ...args);
        }
        let sendTarget: DMChannel | TextBasedChannel = await this.author.createDM();
        if (!sendTarget) {
            sendTarget = this.channel;
        } else {
            await this.reply("Please check your DM");
            // await interaction.deferUpdate();
        }
        return sendTarget.send(options);
    }
}