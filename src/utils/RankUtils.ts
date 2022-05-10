import { loadImage } from "canvas";
import { User } from "discord.js";
import { existsSync } from "fs";
import { BotUser } from "../BotClient";
import { DatabaseType } from "../structs/DatabaseTypes";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { ServerUserSettings } from "../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { UserSetting } from "../structs/databaseTypes/UserSetting";
import { WinxCharacter } from "../structs/WinxCharacters";
import { getServerDatabase } from "./Utils";

export async function getUserLevel(userId: string, guildId: string, createNew = true) {
    const Levels = BotUser.getDatabase(DatabaseType.Levels);
    const levels: UserLevel[] = await getServerDatabase(Levels, guildId);

    let userIndex = levels.findIndex(u => u.userId === userId);
    if (userIndex < 0 && createNew) {
        levels.push(new UserLevel(userId));
        userIndex = levels.length - 1;
        await Levels.set(guildId, levels);
    } else if (userIndex < 0) {
        return undefined;
    }
    return levels[userIndex];
}

export async function getRank(level: number, guildId: string) {
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, guildId);
    return ranks.find(r => r.level === level);
}

export async function getNextRank(currentLevel: number, guildId: string) {
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, guildId);
    if (!ranks || !ranks.length) return;
    ranks.sort((a, b) => {
        return a.level - b.level;
    });
    let rankToReturn: RankLevel;
    for (const rank of ranks) {
        if (rank.level <= currentLevel) continue;
        rankToReturn = rank;
        break;
    }
    return rankToReturn;
}

export async function getCurrentRank(currentLevel: number, guildId: string) {
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, guildId);
    if (!ranks || !ranks.length) return;
    ranks.sort((a, b) => {
        return a.level - b.level;
    });
    let rankToReturn: RankLevel;
    for (const rank of ranks) {
        if (rank.level > currentLevel) break;
        if (rank.level <= currentLevel) {
            rankToReturn = rank;
        }
    }
    return rankToReturn;
}

export async function getPreviousRank(currentLevel: number, guildId: string) {
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, guildId);
    if (!ranks || !ranks.length) return;
    ranks.sort((a, b) => {
        return a.level - b.level;
    });
    let currentRank: RankLevel;
    for (const rank of ranks) {
        if (rank.level > currentLevel) break;
        if (rank.level <= currentLevel) {
            currentRank = rank;
        }
    }
    let rankToReturn: RankLevel;
    for (const rank of ranks) {
        if (rank.level >= currentLevel || rank.level === currentRank.level) break;
        if (rank.level < currentLevel) {
            rankToReturn = rank;
        }
    }
    return rankToReturn;
}

export async function getPreviousRanks(currentLevel: number, guildId: string) {
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, guildId);
    if (!ranks || !ranks.length) return;
    ranks.sort((a, b) => {
        return a.level - b.level;
    });
    let currentRank: RankLevel;
    for (const rank of ranks) {
        if (rank.level > currentLevel) break;
        if (rank.level <= currentLevel) {
            currentRank = rank;
        }
    }
    const ranksToReturn: RankLevel[] = [];
    for (const rank of ranks) {
        if (rank.level >= currentLevel || rank.level === currentRank.level) break;
        if (rank.level < currentLevel) {
            ranksToReturn.push(rank);
        }
    }
    return ranksToReturn;
}

export async function getUserSettings(userId: string) {
    const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);
    const userSettings: UserSetting = await UserSettings.get(userId);
    if (!userSettings) {
        return new UserSetting();
    }
    return userSettings;
}

export async function getServerUserSettings(userId: string, guildId: string) {
    const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
    const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, guildId);

    let userIndex = serverUserSettings.findIndex(u => u.userId === userId);
    if (userIndex < 0) {
        serverUserSettings.push(new ServerUserSettings(userId));
        userIndex = serverUserSettings.length - 1;
        await ServerUserSettingsDatabase.set(guildId, serverUserSettings);
    }
    return serverUserSettings[userIndex];
}

export async function getWingsImage(user: User, guildId: string) {
    const serverUserSettings = await getServerUserSettings(user.id, guildId);
    const userLevel = await getUserLevel(user.id, guildId);

    if (serverUserSettings.winxCharacter <= 0)
        return undefined;

    let level = userLevel.level;
    if (serverUserSettings.wingsLevel >= 0) {
        level = serverUserSettings.wingsLevel;
    }

    return getWingsImageByLevel(level, serverUserSettings.winxCharacter, guildId);
}

export async function getWingsImageByLevel(level: number, winxCharacter: WinxCharacter, guildId: string) {
    if (winxCharacter <= 0)
        return undefined;

    const rank = await getCurrentRank(level, guildId);

    return getWingsImageByRank(rank, winxCharacter);
}

export async function getWingsImageByRank(rank: RankLevel, winxCharacter: WinxCharacter) {
    if (winxCharacter <= 0)
        return undefined;

    if (!rank || !rank.wings)
        return undefined;

    const characterWingFile = Object.values(rank.wings)[winxCharacter - 1];

    if (characterWingFile !== "" && existsSync(characterWingFile)) {
        return loadImage(characterWingFile);
    }

    return undefined;
}