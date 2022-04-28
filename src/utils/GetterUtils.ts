import { BaseGuildTextChannel, Guild, GuildMember, NewsChannel, Role, TextChannel, ThreadChannel, User } from "discord.js";
import { BotUser } from "../BotClient";

//#region User/Member

export function getUserFromMention(mention: string) {
    if (!mention) return;
    const matches = mention.match(/^<@!?(\d+)>$/);

    if (!matches) {
        return getUserById(mention);
    }

    return getUserById(matches[1]);
}

export async function getUserById(id: string): Promise<User> {
    if (!id) return;

    return BotUser.users.fetch(id).catch(() => undefined);
}

export function getMemberFromMention(mention: string, guild: Guild) {
    if (!mention || !guild) return;
    const matches = mention.match(/^<@!?(\d+)>$/);

    if (!matches) {
        return getMemberById(mention, guild);
    }

    return getMemberById(matches[1], guild);
}

export function getMemberById(id: string, guild: Guild): Promise<GuildMember> {
    if (!id || !guild) return;
    return guild.members.fetch(id).catch(() => undefined);
}

export function getBotMember(guild: Guild) {
    return getMemberById(BotUser.user.id, guild);
}

/**
 * 
 * @param guild 
 * @returns Color of the role color of bot as a number
 */
export async function getBotRoleColor(guild: Guild) {
    const defaultcolor = 5793266;
    if (!guild) return defaultcolor;
    const member = await getBotMember(guild);
    if (!member) return defaultcolor;
    if (!member.roles) return defaultcolor;
    if (!member.roles.color) return defaultcolor;
    return member.roles.color.color;
}

//#endregion

//#region Server Channels

export function getGuildById(id: string): Promise<Guild> {
    return BotUser.guilds.fetch(id).catch(() => undefined);
}

export function GetTextNewsGuildChannelFromMention(mention: string, guild: Guild) {
    if (!mention || !guild) return;
    const matches = mention.match(/^<#!?(\d+)>$/);

    if (!matches) {
        return getTextNewsGuildChannelById(mention, guild);
    }

    return getTextNewsGuildChannelById(matches[1], guild);
}

export function getTextNewsGuildChannelById(id: string, guild: Guild): TextChannel | NewsChannel {
    if (!id || !guild) return undefined;
    return <TextChannel | NewsChannel>guild.channels.cache.find(channel => channel.id === id && channel.isText());
}

export function getTextBasedGuildChannelFromMention(mention: string, guild: Guild) {
    if (!mention || !guild) return;
    const matches = mention.match(/^<#!?(\d+)>$/);

    if (!matches) {
        return getTextBasedGuildGuildChannelById(mention, guild);
    }

    return getTextBasedGuildGuildChannelById(matches[1], guild);
}

export function getTextBasedGuildGuildChannelById(id: string, guild: Guild): BaseGuildTextChannel {
    if (!id || !guild) return undefined;
    return <BaseGuildTextChannel>guild.channels.cache.find(channel => channel.id === id && channel.isText());
}

export function getThreadChannelFromMention(mention: string, guild: Guild) {
    if (!mention || !guild) return;
    const matches = mention.match(/^<#!?(\d+)>$/);

    if (!matches) {
        return getThreadChannelById(mention, guild);
    }

    return getThreadChannelById(matches[1], guild);
}

export function getThreadChannelById(id: string, guild: Guild): ThreadChannel {
    if (!id || !guild) return undefined;
    return <ThreadChannel>guild.channels.cache.find(channel => channel.id === id && channel.isThread());
}

//#endregion

//#region Role

export function getRoleFromMention(mention: string, guild: Guild) {
    if (!mention || !guild) return;
    const matches = mention.match(/^<@&(\d+)>$/);

    if (!matches) {
        return getRoleById(mention, guild);
    }

    return getRoleById(matches[1], guild);
}

export function getRoleById(id: string, guild: Guild): Promise<Role> {
    if (!id || !guild) return undefined;
    return guild.roles.fetch(id).catch(() => undefined);
}

//#endregion