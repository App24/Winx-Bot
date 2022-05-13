import { Message, TextBasedChannel } from "discord.js";

export function createMessageCollector(channel: TextBasedChannel, messageId: string, settings: { max?: number, time?: number }, userId?: string) {
    const filter = (m: Message) => (m.reference && m.reference.messageId === messageId) && ((userId && userId === m.author.id) || (!userId));

    return channel.createMessageCollector({ filter, time: settings.time, max: settings.max });
}