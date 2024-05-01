import { Guild, GuildMember, TextBasedChannel, User } from "discord.js";
import { CommandAccess } from "../structs/CommandAccess";
import { asyncForEach, hasFlagSet, isBooster, isModerator, isPatron, isTopChatter } from "./Utils";

export interface PermissionData {
    commandAccess: CommandAccess,
    isDM: boolean,
    guild: Guild,
    member: GuildMember,
    author: User,
    customCheck?: (permissionData: PermissionData) => Promise<PermissionResponse> | PermissionResponse
}

export interface PermissionResponse {
    hasPermission: boolean,
    reason: string
}

async function checkPatronPermission(permissionData: PermissionData): Promise<PermissionResponse> {
    if (permissionData.isDM) {
        return { hasPermission: false, reason: "command.available.server" };
    }

    if (await isPatron(permissionData.author.id, permissionData.guild.id)) {
        return { hasPermission: true, reason: "" };
    }

    return { hasPermission: false, reason: "command.access.patreon" };
}

async function checkBoosterPermission(permissionData: PermissionData): Promise<PermissionResponse> {
    if (permissionData.isDM) {
        return { hasPermission: false, reason: "command.available.server" };
    }

    if (isBooster(permissionData.member)) {
        return { hasPermission: true, reason: "" };
    }

    return { hasPermission: false, reason: "command.access.booster" };
}

async function checkModeratorPermission(permissionData: PermissionData): Promise<PermissionResponse> {
    if (permissionData.isDM) {
        return { hasPermission: false, reason: "command.available.server" };
    }

    if (isModerator(permissionData.member)) {
        return { hasPermission: true, reason: "" };
    }

    return { hasPermission: false, reason: "command.access.moderator" };
}

async function checkGuildOwnerPermission(permissionData: PermissionData): Promise<PermissionResponse> {
    if (permissionData.isDM) {
        return { hasPermission: false, reason: "command.available.server" };
    }

    if (permissionData.guild.ownerId === permissionData.author.id) {
        return { hasPermission: true, reason: "" };
    }

    return { hasPermission: false, reason: "command.access.guildOwner" };
}

async function checkBotOwnerPermission(permissionData: PermissionData): Promise<PermissionResponse> {
    if (permissionData.author.id === process.env.OWNER_ID) {
        return { hasPermission: true, reason: "" };
    }

    return { hasPermission: false, reason: "command.access.botOwner" };
}

async function checkWeeklyTopChatterPermission(permissionData: PermissionData): Promise<PermissionResponse> {
    if (permissionData.isDM) {
        return { hasPermission: false, reason: "command.available.server" };
    }

    if (await isTopChatter(permissionData.guild.id, permissionData.member.id)) {
        return { hasPermission: true, reason: "" };
    }

    return { hasPermission: false, reason: "command.access.topChatter" };
}

export async function hasPermission(permissionData: PermissionData) {
    let permissionResponse: PermissionResponse = { hasPermission: true, reason: "" };

    const permissionFunctions: { commandAccess: CommandAccess, check: ((permissionData: PermissionData) => Promise<PermissionResponse> | PermissionResponse) }[] = [
        { commandAccess: CommandAccess.Patron, check: checkPatronPermission },
        { commandAccess: CommandAccess.Booster, check: checkBoosterPermission },
        { commandAccess: CommandAccess.Moderators, check: checkModeratorPermission },
        { commandAccess: CommandAccess.GuildOwner, check: checkGuildOwnerPermission },
        { commandAccess: CommandAccess.BotOwner, check: checkBotOwnerPermission },
        { commandAccess: CommandAccess.WeeklyTopChatter, check: checkWeeklyTopChatterPermission },
        { commandAccess: CommandAccess.Custom, check: permissionData.customCheck }
    ];

    await asyncForEach(permissionFunctions, async (perm) => {
        if (hasFlagSet(permissionData.commandAccess, perm.commandAccess)) {
            if (!perm.check) return;
            const response = await perm.check(permissionData);

            permissionResponse = response;
            if (response.hasPermission) {
                return true;
            }
        }
    });

    return permissionResponse;
}

export async function hasPermissionForCustomWings(member: GuildMember) {
    if (!member) return false;
    return (await hasPermission({ commandAccess: CommandAccess.PatronOrBooster | CommandAccess.WeeklyTopChatter, author: member.user, member, guild: member.guild, isDM: false })).hasPermission;
}