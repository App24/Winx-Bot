import { APIGuildMember, BaseMessageOptions, CommandInteraction, Guild, GuildMember, GuildTextBasedChannel, If, InteractionReplyOptions, Message, MessageReplyOptions, PartialGroupDMChannel, TextBasedChannel, User } from "discord.js";
import { Localisation, LocalisationType } from "../localisation";
import { LocalisationKeys } from "./LocalKeys";

export type CommandArgumentsType = MessageCommandArguments | SlashCommandArguments;

export type BotTextChannels = Exclude<TextBasedChannel, PartialGroupDMChannel>;

interface LocalisationMessageReplyOptions extends Omit<MessageReplyOptions, "content"> {
    content?: LocalisationType
}

interface LocalisationInteractionReplyOptions extends Omit<InteractionReplyOptions, "content"> {
    content?: LocalisationType
}

interface LocalisationBaseMessageOptions extends Omit<BaseMessageOptions, "content"> {
    content?: LocalisationType
}

abstract class BaseCommandArguments<Slash extends boolean = boolean> {
    public readonly args: string[];
    public readonly guild: Guild;
    public readonly guildId: string;
    public readonly channel: BotTextChannels;
    public readonly channelId: string;
    public readonly author: User;
    public readonly member: GuildMember;

    public constructor(data: { guild: Guild, guildId: string, channel: GuildTextBasedChannel | TextBasedChannel, channelId: string, author?: User, user?: User, member: GuildMember | APIGuildMember }, args: string[]) {
        // this.message = message;
        this.guild = data.guild;
        this.guildId = data.guildId;
        if (data.channel instanceof PartialGroupDMChannel) {
            return;
        }
        this.channel = data.channel;
        this.channelId = data.channelId;
        this.args = args;
        if (data.author)
            this.author = data.author;
        else
            this.author = data.user;
        this.member = <GuildMember>data.member;
    }

    public abstract body();

    public abstract reply(options: LocalisationType | If<Slash, LocalisationInteractionReplyOptions, LocalisationMessageReplyOptions>): If<Slash, Promise<void>, Promise<Message>>;

    public async dmReply(options: LocalisationType | LocalisationBaseMessageOptions) {
        let localisedOptions: BaseMessageOptions;
        if (options instanceof LocalisationType) {
            localisedOptions.content = Localisation.getLocalisation(options);
        } else {
            localisedOptions = <any>options;
            if (options.content) {
                localisedOptions.content = Localisation.getLocalisation(options.content);
            }
        }
        let sendTarget: BotTextChannels = await this.author.createDM().catch(() => undefined);
        if (!sendTarget || this.channel.isDMBased()) {
            sendTarget = this.channel;
        } else {
            await this.reply({ key: LocalisationKeys.reply_check_dm });
        }
        return sendTarget.send(localisedOptions);
    }
}

export class MessageCommandArguments extends BaseCommandArguments<false> {
    public readonly message: Message;

    public constructor(message: Message, args: string[]) {
        super(message, args);
        this.message = message;
    }

    public body() {
        return this.message;
    }
    public reply(options: LocalisationType | LocalisationMessageReplyOptions): Promise<Message<boolean>> {
        let localisedOptions: MessageReplyOptions = {};
        if("key" in options){
            localisedOptions.content = Localisation.getLocalisation(options);
        }else{
            localisedOptions = <any>options;
            if(options.content){
                localisedOptions.content = Localisation.getLocalisation(options.content);
            }
        }
        localisedOptions.failIfNotExists = false;
        return this.message.reply(localisedOptions);
        // try {
        //     if (typeof options === "string") {
        //         options = { content: Localisation.getLocalisation(options, ...args) };
        //     } else {
        //         if (options.content)
        //             options.content = Localisation.getLocalisation(options.content, ...args);
        //     }
        //     options.failIfNotExists = false;
        //     return this.message.reply(options);
        // } catch (error) {
        //     return reportBotError(error.stack, this.message);
        // }
    }
}

export class SlashCommandArguments extends BaseCommandArguments<true> {
    public readonly interaction: CommandInteraction;

    public constructor(interaction: CommandInteraction, args: string[]) {
        super(interaction, args);
        this.interaction = interaction;
    }

    public body() {
        return this.interaction;
    }

    public reply(options: LocalisationType | LocalisationInteractionReplyOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }
}