import { Message, User, MessageAttachment, MessageComponentInteraction, MessageOptions, TextBasedChannel, Role, Guild, BaseGuildTextChannel } from "discord.js";
import { Localisation } from "../localisation";
import { getRoleFromMention, getTextChannelFromMention } from "./GetterUtils";
import { createMessageCollector } from "./MessageUtils";
import { isHexColor } from "./Utils";

export async function getReply<T>(replyData: ReplyData, callbackFn: (msg: Message, resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
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
        message = await sendMessage({ content: options });
    else {
        message = await sendMessage(options);
    }

    let authorId: string;

    if (author)
        authorId = (typeof author === "string" ? author : author.id);

    if (!settings) {
        settings = { max: 1, time: 1000 * 60 * 5 };
    }

    if (settings.time && settings.time <= 0)
        settings.time = undefined;
    else if (!settings.time)
        settings.time = 1000 * 60 * 5;

    const collector = createMessageCollector(message.channel, message.id, authorId, { max: settings.max, time: settings.time });
    return new Promise<T>((resolve, reject) => {
        collector.on("collect", (msg) => {
            callbackFn(msg, resolve, reject);
        });
    }).then(value => {
        return { value, message };
    }, () => {
        return { value: <T>undefined, message };
    });
}

export async function getNumberReply(replyData: ReplyData, bounds: { min?: number, max?: number } = { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }) {
    if (bounds.min == undefined) {
        bounds.min = Number.MIN_SAFE_INTEGER;
    }

    if (bounds.max == undefined) {
        bounds.max = Number.MAX_SAFE_INTEGER;
    }

    return getReply<number>(replyData, (msg, resolve, reject) => {
        const level = parseInt(msg.content);
        if (isNaN(level) || level < bounds.min || level > bounds.max) {
            reject(Localisation.getTranslation("error.invalid.number"));
            return <any>msg.reply(Localisation.getTranslation("error.invalid.number"));
        }

        resolve(level);
    });
}

export async function getLevelReply(replyData: ReplyData) {
    return getReply<number>(replyData, (msg, resolve, reject) => {
        const level = parseInt(msg.content);
        if (isNaN(level) || level < 0) {
            reject(Localisation.getTranslation("error.invalid.level"));
            return <any>msg.reply(Localisation.getTranslation("error.invalid.level"));
        }

        resolve(level);
    });
}

export async function getStringReply(replyData: ReplyData) {
    return getReply<string>(replyData, (msg, resolve) => {
        resolve(msg.content);
    });
}

export async function getImageReply(replyData: ReplyData) {
    return getReply<MessageAttachment>(replyData, (msg, resolve, reject) => {
        const image = msg.attachments.first();
        if (!image) {
            reject(Localisation.getTranslation("error.missing.image"));
            return msg.reply(Localisation.getTranslation("error.missing.image"));
        }

        if (!image.name.toLowerCase().endsWith(".png")) {
            reject(Localisation.getTranslation("error.invalid.image"));
            return msg.reply(Localisation.getTranslation("error.invalid.image"));
        }

        resolve(image);
    });
}

export async function getHexReply(replyData: ReplyData) {
    return getReply<string>(replyData, (msg, resolve, reject) => {
        let hex = msg.content;
        if (hex.startsWith("#")) {
            hex = hex.substring(1);
        }

        if (!isHexColor(hex)) {
            reject(Localisation.getTranslation("error.invalid.hexcolor"));
            return msg.reply(Localisation.getTranslation("error.invalid.hexcolor"));
        }

        resolve(hex);
    });
}

export async function getRoleReply(replyData: GuildReplyData) {
    return getReply<Role>(replyData, async (msg, resolve, reject) => {
        const role = await getRoleFromMention(msg.content, replyData.guild);
        if (!role) {
            reject(Localisation.getTranslation("error.invalid.role"));
            return msg.reply(Localisation.getTranslation("error.invalid.role"));
        }

        resolve(role);
    });
}

export async function getTextChannelReply(replyData: GuildReplyData) {
    return getReply<BaseGuildTextChannel>(replyData, async (msg, resolve, reject) => {
        const channel = await getTextChannelFromMention(msg.content, replyData.guild);
        if (!channel) {
            reject(Localisation.getTranslation("error.invalid.channel"));
            return msg.reply(Localisation.getTranslation("error.invalid.channel"));
        }

        resolve(channel);
    });
}

export interface ReplyData {
    sendTarget: Message | TextBasedChannel | MessageComponentInteraction,
    author: User | string,
    options: string | MessageOptions,
    settings?: { max?: number, time?: number }
}

export interface GuildReplyData extends ReplyData {
    guild: Guild
}