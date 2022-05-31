import { ApplicationCommandData, Guild, TextBasedChannel, User, GuildMember, BaseCommandInteraction } from "discord.js";
import { CommandAvailable } from "./CommandAvailable";
import { CommandAccess } from "./CommandAccess";

export abstract class SlashCommand {
    public commandData: ApplicationCommandData;
    public deferEphemeral: boolean;

    public access: CommandAccess;
    public available: CommandAvailable;

    public guildIds: string[];

    public constructor(commandData: ApplicationCommandData) {
        this.commandData = commandData;
        this.deferEphemeral = false;
        this.access = CommandAccess.None;
        this.available = CommandAvailable.Both;
    }

    public abstract onRun(cmdArgs: SlashCommandArguments);
}

export class SlashCommandArguments {
    public readonly interaction: BaseCommandInteraction;
    public readonly args: string[];
    public readonly guild: Guild;
    public readonly guildId: string;
    public readonly channel: TextBasedChannel;
    public readonly channelId: string;
    public readonly author: User;
    public readonly member: GuildMember;

    public constructor(interaction: BaseCommandInteraction, args: string[]) {
        this.args = args;
        this.interaction = interaction;
        this.guild = interaction.guild;
        this.guildId = interaction.guildId;
        this.channel = interaction.channel;
        this.channelId = interaction.channelId;
        this.author = interaction.user;
        this.member = <GuildMember>interaction.member;
    }
}