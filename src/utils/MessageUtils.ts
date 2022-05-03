import { Message, TextBasedChannel } from "discord.js";

export function createMessageCollector(channel: TextBasedChannel, messageId: string, userId: string, settings: { max?: number, time?: number }) {
    const filter = (m: Message) => (m.reference && m.reference.messageId === messageId) && userId === m.author.id;

    return channel.createMessageCollector({ filter, time: settings.time, max: settings.max });
}