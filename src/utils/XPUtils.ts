import { BaseGuildTextChannel, Guild, GuildMember, MessageOptions, Role } from "discord.js";
import { BotUser } from "../BotClient";
import { getMemberById, getRoleById, getTextChannelById } from "./GetterUtils";
import { Localisation } from "../localisation";
import { DatabaseType } from "../structs/DatabaseTypes";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { getServerDatabase } from "./Utils";
import { capitalise } from "./FormatUtils";
import { ServerUserSettings } from "../structs/databaseTypes/ServerUserSettings";

export class XPInfo {
    public readonly xp: number;
    public readonly member: GuildMember;
    public readonly guild: Guild;
    public readonly channel: BaseGuildTextChannel;

    public constructor(xp: number, member: GuildMember, guild: Guild, channel: BaseGuildTextChannel) {
        this.xp = xp;
        this.member = member;
        this.guild = guild;
        this.channel = channel;
    }
}

/**
 * Get the amount of xp required for a certain level based on a formula
 * @param level 
 * @returns Amount of xp this level needs
 */
export function getLevelXP(level: number) {
    return Math.abs(level) * 2 * 75 + 50;
}

export async function removeXP(xpInfo: XPInfo) {
    const Levels = BotUser.getDatabase(DatabaseType.Levels);
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);

    const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, xpInfo.guild.id, DEFAULT_SERVER_INFO);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, xpInfo.guild.id);
    const levels: UserLevel[] = await getServerDatabase(Levels, xpInfo.guild.id);

    let userLevel = levels.find(u => u.userId === xpInfo.member.id);
    if (!userLevel) {
        levels.push(new UserLevel(xpInfo.member.id));
        userLevel = levels.find(u => u.userId === xpInfo.member.id);
    }

    userLevel.xp -= xpInfo.xp;
    let levelChannel = xpInfo.channel;
    if (serverInfo.levelChannel) {
        const temp = await getTextChannelById(serverInfo.levelChannel, xpInfo.guild);
        if (temp) levelChannel = temp;
    }

    while (userLevel.xp < 0) {
        if (userLevel.level <= 0) {
            userLevel.xp = 0;
            break;
        }
        userLevel.level--;
        userLevel.xp += getLevelXP(userLevel.level);
        let rankDetails: { rankLevel: RankLevel, rank: Role };
        if (ranks) {
            const rankLevel = ranks.find(rank => rank.level === userLevel.level + 1);
            if (rankLevel) {
                const rank = await getRoleById(rankLevel.roleId, xpInfo.guild);
                if (rank) {
                    if (xpInfo.member.roles.cache.has(rank.id))
                        await xpInfo.member.roles.remove(rank, "lost transformation").catch(console.error);
                    rankDetails = { rankLevel, rank };
                }
            }
        }
        showLevelMessage(false, levelChannel, xpInfo.member, userLevel.level, rankDetails);
    }

    await Levels.set(xpInfo.guild.id, levels);
}

export async function addXP(xpInfo: XPInfo, levelUpMessage = true) {
    const Levels = BotUser.getDatabase(DatabaseType.Levels);
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);

    const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, xpInfo.guild.id, DEFAULT_SERVER_INFO);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, xpInfo.guild.id);
    const levels: UserLevel[] = await getServerDatabase(Levels, xpInfo.guild.id);

    const member = await getMemberById(xpInfo.member.id, xpInfo.guild);
    if (!member) return;

    let userLevel = levels.find(u => u.userId === xpInfo.member.id);
    if (!userLevel) {
        levels.push(new UserLevel(xpInfo.member.id));
        userLevel = levels.find(u => u.userId === xpInfo.member.id);
    }

    userLevel.xp += xpInfo.xp;
    let levelChannel = xpInfo.channel;
    if (serverInfo.levelChannel) {
        const temp = await getTextChannelById(serverInfo.levelChannel, xpInfo.guild);
        if (temp) levelChannel = temp;
    }

    while (userLevel.xp >= getLevelXP(userLevel.level)) {
        userLevel.xp -= getLevelXP(userLevel.level);
        userLevel.level++;
        let rankDetails: { rankLevel: RankLevel, rank: Role };
        if (ranks) {
            const rankLevel = ranks.find(rank => rank.level === userLevel.level);
            if (rankLevel) {
                const rank = await getRoleById(rankLevel.roleId, xpInfo.guild);
                if (rank) {
                    if (!member.roles.cache.has(rank.id))
                        member.roles.add(rank).catch(console.error);
                    rankDetails = { rankLevel, rank };
                }
            }
        }
        if (levelUpMessage)
            showLevelMessage(true, levelChannel, xpInfo.member, userLevel.level, rankDetails);
    }

    await Levels.set(xpInfo.guild.id, levels);
}

export async function showLevelMessage(levelUp: boolean, levelChannel: BaseGuildTextChannel, member: GuildMember, level: number, rankDetails: { rankLevel: RankLevel, rank: Role }) {
    const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
    const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, levelChannel.guildId);

    let userIndex = serverUserSettings.findIndex(u => u.userId === member.id);
    if (userIndex < 0) {
        serverUserSettings.push(new ServerUserSettings(member.id));
        userIndex = serverUserSettings.length - 1;
    }
    const userSettings = serverUserSettings[userIndex];

    if (userSettings.levelPing === undefined) {
        userSettings.levelPing = false;
    }

    const options: MessageOptions = {
        content: Localisation.getTranslation(levelUp ? "xp.level.up" : "xp.level.down", member, level)
    };

    if (userSettings.levelPing) {
        options.allowedMentions = { users: [member.id] };
    }

    await levelChannel.send(options);
    if (rankDetails) {
        await levelChannel.send(Localisation.getTranslation(levelUp ? "xp.transformation.earn" : "xp.transformation.lost", member, capitalise(rankDetails.rank.name)));
        if (rankDetails.rankLevel.gifs && rankDetails.rankLevel.gifs.length) {
            await levelChannel.send(rankDetails.rankLevel.gifs[Math.floor(Math.random() * rankDetails.rankLevel.gifs.length)]);
        }
    }
}