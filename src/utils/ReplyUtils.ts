import { Message, MessageAttachment, MessageComponentInteraction, MessageOptions, Role, Guild, BaseGuildTextChannel, GuildMember } from "discord.js";
import { Localisation } from "../localisation";
import { getMemberFromMention, getRoleFromMention, getTextChannelFromMention } from "./GetterUtils";
import { MessageAuthor, SendTarget } from "./MessageButtonUtils";
import { createMessageCollector } from "./MessageUtils";
import { isHexColor } from "./Utils";

export async function getReply<T>(replyData: ReplyData, callbackFn: (msg: Message, resolve: (value: { value: T, message: Message } | PromiseLike<{ value: T, message: Message }>) => void, reject: (reason?: any) => void) => void) {
    const { sendTarget, author, options } = replyData;
    let { settings } = replyData;

    let sendMessage;

    if (sendTarget instanceof Message || sendTarget instanceof MessageComponentInteraction) {
        sendMessage = sendTarget.reply.bind(sendTarget);
        if (sendTarget instanceof MessageComponentInteraction) {
            if (!sendTarget.deferred && !sendTarget.replied) {
                await sendTarget.deferUpdate();
            }
            sendMessage = sendTarget.followUp.bind(sendTarget);
        }
    } else {
        sendMessage = sendTarget.send.bind(sendTarget);
    }

    let message: Message<boolean>;

    if (typeof options === "string")
        message = await sendMessage({ content: Localisation.getTranslation(options) });
    else {
        if (options.content !== undefined) {
            options.content = Localisation.getTranslation(options.content);
        }
        message = await sendMessage(options);
    }

    let authorId: string;

    if (author)
        authorId = (typeof author === "string" ? author : author.id);

    if (!settings) {
        settings = { max: Number.MAX_SAFE_INTEGER, time: 1000 * 60 * 5 };
    }

    if (settings.time && settings.time <= 0)
        settings.time = undefined;
    else if (!settings.time)
        settings.time = 1000 * 60 * 5;

    let use = 0;

    const collector = createMessageCollector(message.channel, message.id, { max: settings.max, time: settings.time });
    return new Promise<{ value: T, message: Message }>((resolve, reject) => {
        collector.on("collect", (msg) => {
            if (msg.author.bot) return;
            if (msg.author.id === authorId) {
                callbackFn(msg, resolve, reject);
                use++;
                if (settings.max && settings.max > 0 && use >= settings.max) {
                    collector.emit("end", "");
                }
            } else {
                msg.reply({ content: Localisation.getTranslation("generic.not.author"), allowedMentions: { users: [msg.author.id] } });
            }
        });
    }).then(value => value, () => {
        return { value: <T>undefined, message };
    });
}

export async function getNumberReply(replyData: ReplyData, bounds: { min?: number, max?: number } = { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }) {
    if (!replyData.options) {
        replyData.options = "argument.reply.amount";
    }

    if (bounds.min == undefined) {
        bounds.min = Number.MIN_SAFE_INTEGER;
    }

    if (bounds.max == undefined) {
        bounds.max = Number.MAX_SAFE_INTEGER;
    }

    return getReply<number>(replyData, (msg, resolve, reject) => {
        const level = parseInt(msg.content);
        if (isNaN(level) || level < bounds.min || level > bounds.max) {
            reject("invalid.number");
            return msg.reply(Localisation.getTranslation("error.invalid.number"));
        }

        resolve({ value: level, message: msg });
    });
}

export async function getLevelReply(replyData: ReplyData) {
    if (!replyData.options) {
        replyData.options = "argument.reply.level";
    }

    return getNumberReply(replyData, { min: 0 });
}

export async function getStringReply(replyData: ReplyData) {
    return getReply<string>(replyData, (msg, resolve) => {
        resolve({ value: msg.content, message: msg });
    });
}

export async function getImageReply(replyData: ReplyData) {
    if (!replyData.options) {
        replyData.options = "argument.reply.image";
    }

    return getReply<MessageAttachment>(replyData, (msg, resolve, reject) => {
        const image = msg.attachments.first();
        if (!image) {
            reject("missing.image");
            return msg.reply(Localisation.getTranslation("error.missing.image"));
        }

        if (![".png", ".jpg", ".jpeg"].some(extension => image.name.toLowerCase().endsWith(extension))) {
            reject("invalid.image.format");
            return msg.reply(Localisation.getTranslation("error.invalid.image"));
        }

        resolve({ value: image, message: msg });
    });
}

export async function getHexReply(replyData: ReplyData) {
    if (!replyData.options) {
        replyData.options = "argument.reply.hexcolor";
    }

    return getReply<string>(replyData, (msg, resolve, reject) => {
        let hex = msg.content;
        if (hex.startsWith("#")) {
            hex = hex.substring(1);
        }

        if (!isHexColor(hex)) {
            reject("invalid.hexcolor");
            return msg.reply(Localisation.getTranslation("error.invalid.hexcolor"));
        }

        resolve({ value: hex, message: msg });
    });
}

export async function getRoleReply(replyData: GuildReplyData) {
    if (!replyData.options) {
        replyData.options = "argument.reply.role";
    }

    return getReply<Role>(replyData, async (msg, resolve, reject) => {
        const role = await getRoleFromMention(msg.content, replyData.guild);
        if (!role) {
            reject("invalid.role");
            return msg.reply(Localisation.getTranslation("error.invalid.role"));
        }

        resolve({ value: role, message: msg });
    });
}

export async function getTextChannelReply(replyData: GuildReplyData) {
    if (!replyData.options) {
        replyData.options = "argument.reply.channel";
    }

    return getReply<BaseGuildTextChannel>(replyData, async (msg, resolve, reject) => {
        const channel = await getTextChannelFromMention(msg.content, replyData.guild);
        if (!channel) {
            reject("invalid.channel");
            return msg.reply(Localisation.getTranslation("error.invalid.channel"));
        }

        resolve({ value: channel, message: msg });
    });
}

export async function getMemberReply(replyData: GuildReplyData) {
    if (!replyData.options) {
        replyData.options = "argument.reply.user";
    }

    return getReply<GuildMember>(replyData, async (msg, resolve, reject) => {
        const member = await getMemberFromMention(msg.content, replyData.guild);
        if (!member) {
            reject("invalid.member");
            return msg.reply(Localisation.getTranslation("error.invalid.member"));
        }

        resolve({ value: member, message: msg });
    });
}

export interface ReplyData {
    sendTarget: SendTarget,
    author: MessageAuthor,
    options?: string | MessageOptions,
    settings?: { max?: number, time?: number }
}

export interface GuildReplyData extends ReplyData {
    guild: Guild
}