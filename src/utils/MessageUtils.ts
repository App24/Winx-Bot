import { Message, TextBasedChannel, User } from "discord.js";

export function createMessageCollector(channel: TextBasedChannel, messageId: string, user: User, settings: { max?: number, time?: number }) {
    const filter = (m: Message) => (m.reference && m.reference.messageId === messageId) && user.id === m.author.id;

    return channel.createMessageCollector({ filter, time: settings.time, max: settings.max });
}