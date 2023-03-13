import { ApplicationCommandData, Guild, TextBasedChannel, User, GuildMember, CommandInteraction, InteractionReplyOptions, DMChannel, MessageOptions } from "discord.js";
import { CommandAvailable } from "./CommandAvailable";
import { CommandAccess } from "./CommandAccess";
import { Localisation } from "../localisation";
import { BaseCommand } from "../baseCommands/BaseCommand";

export abstract class SlashCommand {
    public commandData: ApplicationCommandData;
    public deferEphemeral: boolean;

    public access: CommandAccess;
    public available: CommandAvailable;

    public guildIds: string[];

    public baseCommand: BaseCommand;

    public cooldown: number;

    public constructor(commandData: ApplicationCommandData) {
        this.commandData = commandData;
        this.deferEphemeral = false;
        this.access = CommandAccess.None;
        this.available = CommandAvailable.Both;
        this.guildIds = [];
        this.cooldown = 3;
    }

    public async onRun(cmdArgs: SlashCommandArguments) {
        if (this.baseCommand) {
            await this.baseCommand.onRun(cmdArgs);
        }
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
            options = Localisation.getTranslation(options, ...args);
        else {
            if (options.content) {
                options.content = Localisation.getTranslation(options.content, ...args);
            }
        }
        if (this.interaction.deferred || this.interaction.replied) {
            await this.interaction.followUp(options);
        } else {
            await this.interaction.reply(options);
        }
    }

    public async dmReply(options: string | MessageOptions, ...args){
        if (typeof options === "string") {
            options = Localisation.getTranslation(options, ...args);
        } else {
            if (options.content)
                options.content = Localisation.getTranslation(options.content, ...args);
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